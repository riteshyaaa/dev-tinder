const rateLimit = require("express-rate-limit");

/**
 * Rate limiters for different API sections.
 * Protects against brute-force attacks and API abuse.
 */

// General API: 100 requests per minute per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again in a minute." },
});

// Auth endpoints: 10 attempts per 15 minutes (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
});

// Swipe/request endpoints: 50 per hour
const swipeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Daily swipe limit reached. Upgrade to premium or try again later." },
});

// Message sending: 60 per minute
const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Sending messages too fast. Please slow down." },
});

module.exports = { generalLimiter, authLimiter, swipeLimiter, messageLimiter };
