import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";

/**
 * Generate Access Token (Short-lived — 15 minutes)
 */
export const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

/**
 * Generate Refresh Token (Long-lived — 7 days)
 * Uses a separate secret so compromising one doesn't compromise the other.
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh",
    { expiresIn: "7d" },
  );
};

/**
 * Cookie configuration — centralised for consistency.
 */
const isProd = process.env.NODE_ENV === "production";

const getCookieOptions = (maxAgeMs) => ({
  maxAge: maxAgeMs,
  httpOnly: true,
  secure: isProd,
  // sameSite:"None" REQUIRES secure:true — browsers silently reject the cookie otherwise.
  // In production (HTTPS) we need "None" for cross-origin cookies.
  // In development (HTTP) we use "Lax" so the browser actually stores the cookie.
  sameSite: isProd ? "None" : "Lax",
  path: "/",
  // Only set a domain in production to avoid local development and 127.0.0.1 issues.
  domain: isProd ? ".akjobservices.com" : undefined,
});

/**
 * Issue both tokens, store refresh token hash in DB (for rotation),
 * set HTTP-only cookies, and return JSON.
 */
export const sendTokenResponse = async (user, statusCode, res, req) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store hashed refresh token for rotation validation
  const refreshHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  await User.findByIdAndUpdate(user._id, { refreshToken: refreshHash });

  // Track session if request object available
  if (req) {
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    const ua = req.get("User-Agent") || "unknown";
    await User.findByIdAndUpdate(user._id, {
      $push: {
        sessions: {
          $each: [
            {
              ipAddress: ip,
              deviceInfo: ua.substring(0, 200),
              lastActive: new Date(),
            },
          ],
          $slice: -5, // max 5 sessions per user
        },
      },
    });
  }

  const responsePayload = {
    success: true,
    user: {
      _id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
  };

  if (req?.headers?.["x-client-type"] === "mobile") {
    const ua = req.get("User-Agent") || "";
    const isTrustedClient = ua.includes("Expo") || ua.includes("okhttp");

    if (!isTrustedClient) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid mobile client signature" });
    }

    responsePayload.accessToken = accessToken;
    responsePayload.refreshToken = refreshToken;
  }

  res
    .status(statusCode)
    .cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000)) // 15 min
    .cookie(
      "refreshToken",
      refreshToken,
      getCookieOptions(7 * 24 * 60 * 60 * 1000),
    ) // 7 days
    .json(responsePayload);
};

/**
 * Refresh token rotation — validates old token, issues new pair,
 * invalidates old token in DB.
 */
export const rotateRefreshToken = async (req, res) => {
  try {
    const incomingToken = req.cookies?.refreshToken;
    if (!incomingToken) {
      console.warn(
        `[AUTH] Refresh failed: No cookie found. Cookies present: ${Object.keys(req.cookies || {}).join(", ")}`,
      );
      return res
        .status(401)
        .json({ success: false, message: "No refresh token" });
    }

    // Verify signature
    let decoded;
    try {
      decoded = jwt.verify(
        incomingToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh",
      );
    } catch {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired refresh token" });
    }

    // Find user and compare stored hash
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const incomingHash = crypto
      .createHash("sha256")
      .update(incomingToken)
      .digest("hex");
    if (user.refreshToken !== incomingHash) {
      // Possible token reuse attack — invalidate all sessions
      await User.findByIdAndUpdate(user._id, {
        refreshToken: null,
        sessions: [],
      });
      return res
        .status(401)
        .json({
          success: false,
          message: "Token reuse detected — all sessions invalidated",
        });
    }

    // Issue new pair
    await sendTokenResponse(user, 200, res, req);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Logout — clear cookies and remove refresh token from DB.
 */
export const clearTokens = async (userId, res) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });

  res.cookie("accessToken", "", getCookieOptions(1));
  res.cookie("refreshToken", "", getCookieOptions(1));
};

/**
 * Logout from ALL devices — clear refresh token + all sessions.
 */
export const clearAllSessions = async (userId, res) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null, sessions: [] });

  res.cookie("accessToken", "", getCookieOptions(1));
  res.cookie("refreshToken", "", getCookieOptions(1));
};
