// ─── High-Performance In-Memory Cache Store ─────────────────────────────────────
const memoryCache = new Map();
const tombstones = new Map();

// Periodic cleanup of expired cache items to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of memoryCache.entries()) {
    if (item.expiresAt < now) {
      memoryCache.delete(key);
    }
  }
}, 60 * 1000).unref(); // Clean every minute

// Periodic cleanup of expired tombstones
setInterval(() => {
  const now = Date.now();
  for (const [key, expiresAt] of tombstones.entries()) {
    if (expiresAt < now) {
      tombstones.delete(key);
    }
  }
}, 5000).unref(); // Clean every 5 seconds

/**
 * Retrieve an item from the cache.
 */
export const getCachedData = async (key) => {
  const item = memoryCache.get(key);
  if (!item) return null;

  if (item.expiresAt < Date.now()) {
    memoryCache.delete(key);
    return null;
  }

  return item.value;
};

/**
 * Store an item in the cache with a specified TTL (in seconds).
 */
export const setCachedData = async (key, value, ttlSeconds = 300) => {
  memoryCache.set(key, {
    value,
    savedAt: Date.now(),
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
  return true;
};

/**
 * Invalidate/Delete cache keys (supports wildcards/patterns).
 */
export const invalidateCache = async (keyPattern) => {
  try {
    const now = Date.now();
    if (keyPattern.includes("*")) {
      const regexPattern = new RegExp("^" + keyPattern.replace(/\*/g, ".*") + "$");
      const matchedKeys = [];

      for (const key of memoryCache.keys()) {
        if (regexPattern.test(key)) {
          matchedKeys.push(key);
        }
      }

      for (const k of matchedKeys) {
        memoryCache.delete(k);
        tombstones.set(k, now + 5000); // 5-second tombstone lock
      }
      console.log(`🧹 [Cache Invalidation] Cleared ${matchedKeys.length} matching keys and set tombstones for pattern: "${keyPattern}"`);
    } else {
      memoryCache.delete(keyPattern);
      tombstones.set(keyPattern, now + 5000); // 5-second tombstone lock
      console.log(`🧹 [Cache Invalidation] Cleared key and set tombstone: "${keyPattern}"`);
    }
    return true;
  } catch (error) {
    console.error(`[Cache Error] Failed to invalidate pattern "${keyPattern}":`, error.message);
    return false;
  }
};

const pendingFetches = new Map();

/**
 * Executes a database lookup with Request Coalescing (Single-Flight Pattern)
 * to ensure multiple concurrent identical queries only execute once.
 */
export const coalesceRequest = async (key, fetchCallback) => {
  if (pendingFetches.has(key)) {
    console.log(`🔗 [Request Coalescing] Coalescing active read for: "${key}"`);
    return pendingFetches.get(key);
  }

  const promise = fetchCallback().finally(() => {
    pendingFetches.delete(key);
  });

  pendingFetches.set(key, promise);
  return promise;
};

/**
 * Advanced read-through cache using Stale-While-Revalidate (SWR) & Single-Flight.
 * Completely immune to cache stampedes.
 */
export const getOrFetchSWR = async (key, fetchCallback, ttlSeconds = 300, softTtlSeconds = 60) => {
  const cached = await getCachedData(key);

  if (cached && cached.savedAt) {
    const { data, savedAt } = cached;
    const age = (Date.now() - savedAt) / 1000;

    if (age < softTtlSeconds) {
      // Data is fully fresh, return it instantly
      return data;
    } else {
      // Data is stale. Serve it immediately, trigger background refresh
      console.log(`🔄 [SWR Revalidation] Serving stale copy for "${key}". Triggering background sync...`);
      coalesceRequest(`revalidate:${key}`, async () => {
        try {
          const freshData = await fetchCallback();
          // Tombstone race-condition guard: skip cache rewrite if key was recently invalidated
          const hasTombstone = tombstones.has(key) && tombstones.get(key) > Date.now();
          if (!hasTombstone) {
            await setCachedData(key, { data: freshData, savedAt: Date.now() }, ttlSeconds);
            console.log(`✅ [SWR Revalidation] Cache refreshed for "${key}"`);
          } else {
            console.log(`⚠️ [SWR Revalidation] Aborted write for "${key}" due to active invalidation tombstone.`);
          }
        } catch (err) {
          console.error(`❌ [SWR Revalidation] Failed to refresh "${key}":`, err.message);
        }
      }).catch(() => {});

      return data;
    }
  }

  // Hard miss: Coalesce database query, cache, and return
  console.log(`🔍 [Cache Miss] Initiating coalesced database query for "${key}"`);
  const freshData = await coalesceRequest(key, fetchCallback);
  
  // Tombstone lock guard
  const hasTombstone = tombstones.has(key) && tombstones.get(key) > Date.now();
  if (!hasTombstone) {
    await setCachedData(key, { data: freshData, savedAt: Date.now() }, ttlSeconds);
  }
  
  return freshData;
};
