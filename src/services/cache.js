/**
 * Cache service — In-memory cache with TTL.
 *
 * For production, replace with Redis:
 *   const Redis = require("ioredis");
 *   const redis = new Redis(process.env.REDIS_URL);
 *
 * This in-memory implementation works for single-server deployments
 * and demonstrates the caching pattern.
 */

class CacheService {
  constructor() {
    this.store = new Map();
    this.ttls = new Map();

    // Cleanup expired entries every 60 seconds
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Get a cached value.
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    if (!this.store.has(key)) return null;

    const expiry = this.ttls.get(key);
    if (expiry && Date.now() > expiry) {
      this.delete(key);
      return null;
    }

    return this.store.get(key);
  }

  /**
   * Set a cached value with optional TTL.
   * @param {string} key
   * @param {any} value
   * @param {number} ttlSeconds - Time to live in seconds (default: 300 = 5 min)
   */
  set(key, value, ttlSeconds = 300) {
    this.store.set(key, value);
    this.ttls.set(key, Date.now() + ttlSeconds * 1000);
  }

  /**
   * Delete a cached value.
   */
  delete(key) {
    this.store.delete(key);
    this.ttls.delete(key);
  }

  /**
   * Invalidate all keys matching a pattern (prefix).
   * @param {string} prefix
   */
  invalidatePattern(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.delete(key);
      }
    }
  }

  /**
   * Clear all cached data.
   */
  flush() {
    this.store.clear();
    this.ttls.clear();
  }

  /**
   * Remove expired entries.
   */
  cleanup() {
    const now = Date.now();
    for (const [key, expiry] of this.ttls.entries()) {
      if (now > expiry) {
        this.delete(key);
      }
    }
  }

  /**
   * Get cache statistics.
   */
  stats() {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }

  /**
   * Destroy the cache (cleanup interval).
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.flush();
  }
}

// Singleton instance
const cache = new CacheService();

module.exports = cache;
