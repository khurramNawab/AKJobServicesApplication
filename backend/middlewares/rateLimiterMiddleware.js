// ─── Resilient In-Memory Rate Limiter Store ─────────────────────────────────────────
const localStore = new Map();
const blockStore = new Map();

// Automatic cleanup tasks to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of localStore.entries()) {
    // Keep only timestamps from the last 1 hour
    const active = timestamps.filter((t) => t > now - 3600 * 1000);
    if (active.length === 0) {
      localStore.delete(key);
    } else {
      localStore.set(key, active);
    }
  }
}, 5 * 60 * 1000).unref(); // Clean localStore every 5 mins

setInterval(() => {
  const now = Date.now();
  for (const [key, expiresAt] of blockStore.entries()) {
    if (expiresAt < now) {
      blockStore.delete(key);
    }
  }
}, 30 * 1000).unref(); // Clean blockStore every 30 seconds

/**
 * ⚡ HIGH-PERFORMANCE SLIDING WINDOW RATE LIMITER ALGORITHM
 * 
 * Tracks requests precisely within a moving window duration in-memory.
 */
const checkSlidingWindow = async (key, limit, windowMs) => {
  const now = Date.now();
  const clearBefore = now - windowMs;

  if (!localStore.has(key)) {
    localStore.set(key, []);
  }

  const timestamps = localStore.get(key);
  // Filter out expired items
  const activeTimestamps = timestamps.filter((t) => t > clearBefore);
  activeTimestamps.push(now);
  localStore.set(key, activeTimestamps);

  return { count: activeTimestamps.length, allowed: activeTimestamps.length <= limit };
};

/**
 * Enterprise Rate Limiter Factory Middleware
 */
export const createRateLimiter = ({
  routeName,
  limit = 60,
  windowMs = 60 * 1000,
  message = "Too many requests. Please check back later.",
}) => {
  return async (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || "127.0.0.1";
    const userId = req.user?._id || req.user?.id || "";
    
    // Identifier tracking: combined tracking (Authenticated user beats simple IP)
    // Secure IP + authenticated userId based tracking to prevent fake User-Agent rate limit bypass
    const identifier = userId ? `user_${userId}` : `ip_${ip.replace(/:/g, "_")}`;
    const key = `ratelimit:${routeName}:${identifier}`;

    // Get adaptive cooldown modifiers if users repeat limit breaches
    const blockKey = `block:${routeName}:${identifier}`;
    const blockExpiresAt = blockStore.get(blockKey);
    const isBlocked = blockExpiresAt && blockExpiresAt > Date.now();

    if (isBlocked) {
      return res.status(429).json({
        success: false,
        message: `Adaptive lockdown active. ${message} (Rate Cooldown Active)`,
      });
    }

    const { count, allowed } = await checkSlidingWindow(key, limit, windowMs);

    if (!allowed) {
      console.warn(
        `⚠️ [RATE LIMIT BREACHED] Route: ${routeName} | Identifier: ${identifier} | Count: ${count}/${limit}`
      );

      // Adaptive Cooldown lockout: Double lockout block duration (e.g. block for 2 mins)
      blockStore.set(blockKey, Date.now() + windowMs * 2);

      return res.status(429).json({
        success: false,
        message: `${message} (Cool down for ${Math.round((windowMs * 2) / 1000)} seconds)`,
      });
    }

    // Set standard rate limit headers
    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, limit - count));

    next();
  };
};

// ─── Export Customized Per-Route Rate Limit Middleware ────────────────────────────────
export const loginLimiter = (req, res, next) => next();

export const registerLimiter = createRateLimiter({
  routeName: "register",
  limit: 5,
  windowMs: 60 * 1000 * 5, // 5 sign-ups per 5 mins
  message: "Registration limit reached. Please wait before creating more profiles.",
});

export const otpLimiter = createRateLimiter({
  routeName: "otp-resend",
  limit: 3,
  windowMs: 60 * 1000 * 3, // 3 OTP requests per 3 mins
  message: "OTP request frequency reached. Please wait before requesting another code.",
});

export const resumeUploadLimiter = createRateLimiter({
  routeName: "resume-upload",
  limit: 5,
  windowMs: 60 * 1000 * 60, // 5 resume uploads per hour
  message: "Resume upload frequency limit hit. Please avoid spamming resume updates.",
});

export const jobPostLimiter = createRateLimiter({
  routeName: "job-post",
  limit: 10,
  windowMs: 60 * 1000 * 60, // 10 job postings per hour for recruiters
  message: "Job posting limit reached. Enterprise rules restrict recruiters from job spamming.",
});

export const adminLimiter = process.env.NODE_ENV === 'production' 
  ? createRateLimiter({
      routeName: "admin-api",
      limit: 100,
      windowMs: 60 * 1000,
      message: "Admin security threshold reached.",
    })
  : (req, res, next) => next();
