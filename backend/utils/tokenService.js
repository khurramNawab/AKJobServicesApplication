import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";

const isProd = process.env.NODE_ENV === "production";

// --- Short-lived grace window fallback cache to avoid memory leaks ---
const graceStore = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of graceStore.entries()) {
    if (val.expiresAt < now) {
      graceStore.delete(key);
    }
  }
}, 30000).unref();

/**
 * Generate Access Token (Short-lived — 15 minutes)
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

/**
 * Generate Refresh Token (Long-lived — 7 days)
 * Signs a unique JTI (JWT ID) in the payload for sliding-session tracking.
 */
export const generateRefreshToken = (user, jti) => {
  return jwt.sign(
    { id: user._id || user.id, jti },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh",
    { expiresIn: "7d" }
  );
};

/**
 * Cookie configuration — centralized for consistency.
 */
const getCookieOptions = (maxAgeMs) => ({
  maxAge: maxAgeMs,
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "None" : "Lax",
  path: "/",
  domain: isProd ? ".akjobservices.com" : undefined,
});

/**
 * Issue both tokens, store JTI session details in DB,
 * set HTTP-only cookies for web, and return JSON payload.
 */
export const sendTokenResponse = async (user, statusCode, res, req, existingJtiToReplace = null) => {
  // Generate cryptographically unique JTI for this session tracking
  const newJti = crypto.randomBytes(16).toString("hex");
  
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, newJti);

  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const ip = req ? (req.ip || req.connection?.remoteAddress || "unknown") : "unknown";
  const ua = req ? (req.get("User-Agent") || "unknown") : "unknown";

  const userWithSessions = await User.findById(user._id || user.id).select("+sessions");
  
  if (userWithSessions) {
    let sessions = userWithSessions.sessions || [];

    // Geo-anomaly & suspicious login logic
    if (sessions.length > 0) {
      const isKnownIpOrUa = sessions.some(
        (s) => s.ipAddress === ip || s.deviceInfo === ua.substring(0, 200)
      );
      if (!isKnownIpOrUa) {
        console.warn(
          `🚨 [SECURITY ALERT] Suspicious session initiated for user: ${userWithSessions.email} ` +
          `from unknown IP/Device: ${ip} | User-Agent: ${ua}`
        );
      }
    }

    if (existingJtiToReplace) {
      // Rotate existing session (Refresh Rotation)
      const index = sessions.findIndex((s) => s.jti === existingJtiToReplace);
      if (index !== -1) {
        sessions[index] = {
          jti: newJti,
          hashedToken,
          deviceInfo: ua.substring(0, 200),
          ipAddress: ip,
          lastActive: new Date(),
        };
      } else {
        // Fallback: push if JTI not found
        sessions.push({
          jti: newJti,
          hashedToken,
          deviceInfo: ua.substring(0, 200),
          ipAddress: ip,
          lastActive: new Date(),
        });
      }
    } else {
      // New login session creation
      sessions.push({
        jti: newJti,
        hashedToken,
        deviceInfo: ua.substring(0, 200),
        ipAddress: ip,
        lastActive: new Date(),
      });
    }

    // Limit maximum active concurrent sessions to 5 to prevent session flood attacks
    if (sessions.length > 5) {
      sessions.sort((a, b) => new Date(a.lastActive) - new Date(b.lastActive));
      while (sessions.length > 5) {
        sessions.shift();
      }
    }

    userWithSessions.sessions = sessions;
    // Set legacy token property to hash of latest refresh token for compatibility
    userWithSessions.refreshToken = hashedToken;
    await userWithSessions.save();
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

  if (existingJtiToReplace) {
    const gracePayload = JSON.stringify({
      accessToken,
      refreshToken,
      responsePayload,
    });
    graceStore.set(existingJtiToReplace, {
      payload: gracePayload,
      expiresAt: Date.now() + 10000,
    });
  }

  const isMobile = req?.headers?.["x-client-type"] === "mobile";

  if (isMobile) {
    responsePayload.accessToken = accessToken;
    responsePayload.refreshToken = refreshToken;
    return res.status(statusCode).json(responsePayload);
  }

  // Web clients strictly receive HttpOnly cookies
  return res
    .status(statusCode)
    .cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000))
    .cookie("refreshToken", refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000))
    .json(responsePayload);
};

/**
 * Refresh Token Rotation (RTR) with replay protection.
 * Decodes JTI and verifies it matches active session store.
 */
export const rotateRefreshToken = async (req, res) => {
  try {
    let incomingToken = req.cookies?.refreshToken;
    
    // Support mobile tokens sent in request payload
    if (!incomingToken && req.body.refreshToken) {
      incomingToken = req.body.refreshToken;
    }

    if (!incomingToken) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token is missing" });
    }

    // 1. Verify token signature
    let decoded;
    try {
      decoded = jwt.verify(
        incomingToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh"
      );
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired refresh token" });
    }

    // --- JWT RTR CONCURRENCY GRACE WINDOW CHECK ---
    let graceDataString = null;
    const graceLocal = graceStore.get(decoded.jti);
    if (graceLocal && graceLocal.expiresAt > Date.now()) {
      graceDataString = graceLocal.payload;
    }

    if (graceDataString) {
      try {
        const { accessToken, refreshToken, responsePayload } = JSON.parse(graceDataString);
        console.log(`⚡ [RTR Grace Period] Serving cached concurrent refresh tokens for JTI: ${decoded.jti}`);

        const isMobile = req?.headers?.["x-client-type"] === "mobile";
        if (isMobile) {
          return res.status(200).json({
            success: true,
            accessToken,
            refreshToken,
            user: responsePayload.user,
          });
        }

        // Web client gets cookies
        return res
          .status(200)
          .cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000))
          .cookie("refreshToken", refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000))
          .json(responsePayload);
      } catch (err) {
        console.error("⚠️ [RTR Grace Period] Failed to parse grace payload:", err.message);
      }
    }

    // 2. Load user along with session store
    const user = await User.findById(decoded.id).select("+sessions");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User session not found" });
    }

    const incomingHash = crypto
      .createHash("sha256")
      .update(incomingToken)
      .digest("hex");

    // 3. Locate session by decoded JTI
    const session = user.sessions.find((s) => s.jti === decoded.jti);

    // 4. Reuse Detection: If JTI is missing OR hash does not match, it indicates a replay attack!
    if (!session || session.hashedToken !== incomingHash) {
      console.error(
        `🚨 [SECURITY ATTACK ATTEMPT] Refresh Token Reuse/Theft Detected! ` +
        `User: ${user.email} | JTI: ${decoded.jti} | Revoking all active sessions.`
      );

      // Invalidate the entire family of tokens by wiping all active sessions
      user.sessions = [];
      user.refreshToken = null;
      await user.save();

      res.cookie("accessToken", "", getCookieOptions(1));
      res.cookie("refreshToken", "", getCookieOptions(1));

      return res.status(401).json({
        success: false,
        message: "Security warning: Authentication session reuse detected. Please login again.",
      });
    }

    // 5. Rotate session: generate new pairs and replace current JTI record
    await sendTokenResponse(user, 200, res, req, decoded.jti);
  } catch (error) {
    console.error("[Token Service] Rotation error:", error.message);
    res.status(500).json({ success: false, message: "Internal Token Error" });
  }
};

/**
 * Logout — Clear cookies and remove current JTI session record.
 */
export const clearTokens = async (userId, res, req) => {
  try {
    let incomingToken = req?.cookies?.refreshToken;
    if (!incomingToken && req?.body?.refreshToken) {
      incomingToken = req.body.refreshToken;
    }

    if (incomingToken) {
      const user = await User.findById(userId).select("+sessions");
      if (user) {
        let decoded = null;
        try {
          decoded = jwt.verify(
            incomingToken,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh"
          );
        } catch (_) {}

        if (decoded && decoded.jti) {
          // Remove only this specific active session
          user.sessions = user.sessions.filter((s) => s.jti !== decoded.jti);
          await user.save();
        }
      }
    }
  } catch (err) {
    console.error("[Token Service] Logout clear fail:", err.message);
  }

  res.cookie("accessToken", "", getCookieOptions(1));
  res.cookie("refreshToken", "", getCookieOptions(1));
};

/**
 * Logout from ALL devices — Clear refresh tokens and wipe the entire session array.
 */
export const clearAllSessions = async (userId, res) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null, sessions: [] });
  res.cookie("accessToken", "", getCookieOptions(1));
  res.cookie("refreshToken", "", getCookieOptions(1));
};
