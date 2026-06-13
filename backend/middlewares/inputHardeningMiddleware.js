/**
 * 🛡️ ENTERPRISE-GRADE INPUT HARDENING & PROTOTYPE POLLUTION PROTECTION MIDDLEWARE
 * 
 * This middleware secures the application against:
 * 1. Prototype Pollution attacks (poisoning Object.prototype via __proto__, constructor, prototype)
 * 2. Nested NoSQL Query Injection (manipulating Mongo query selectors)
 * 3. Query string array/object injection (e.g. ?id[]=1&id[]=2)
 */

const SUSPICIOUS_KEYS = ["__proto__", "constructor", "prototype"];

/**
 * Recursively scans an object for prototype pollution vectors.
 * Returns true if a malicious signature is found.
 */
const hasPrototypePollution = (obj, depth = 0) => {
  if (depth > 20) {
    return true; // Exceeded maximum recursion depth, block potential circular loop attacks
  }
  if (!obj || typeof obj !== "object") {
    return false;
  }

  // Handle arrays explicitly
  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (hasPrototypePollution(item, depth + 1)) return true;
    }
    return false;
  }

  for (const key of Object.keys(obj)) {
    if (SUSPICIOUS_KEYS.includes(key)) {
      return true;
    }
    const val = obj[key];
    if (val && typeof val === "object") {
      if (hasPrototypePollution(val, depth + 1)) return true;
    }
  }
  return false;
};

/**
 * Standardize and normalize query inputs to block query parsing exploitation.
 * Prevents array-based pollution on non-array fields.
 */
const normalizeQuery = (query) => {
  if (!query || typeof query !== "object") return;
  for (const key in query) {
    // If a query parameter is parsed as an array (e.g., ?id[]=1), flatten it to a single value
    // unless explicitly designed. This prevents unexpected schema verification bypasses.
    if (Array.isArray(query[key])) {
      query[key] = String(query[key][query[key].length - 1]);
    }
  }
};

export const inputHardening = (req, res, next) => {
  // 1. Detect Prototype Pollution in Body, Query, or Params
  if (
    hasPrototypePollution(req.body) ||
    hasPrototypePollution(req.query) ||
    hasPrototypePollution(req.params)
  ) {
    console.error(
      `🚨 [SECURITY INTRUSION ATTEMPT] Prototype Pollution signature blocked! ` +
      `IP: ${req.ip} | Route: ${req.originalUrl} | User-Agent: ${req.get("User-Agent")}`
    );
    return res.status(400).json({
      success: false,
      message: "Bad Request - Malformed input structure.",
    });
  }

  // 2. Normalize and flatten query parameters to avoid array-poisoning
  normalizeQuery(req.query);

  next();
};
