const express = require("express");
const adminRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const Challenge = require("../models/challenge");
const cache = require("../services/cache");

/**
 * Admin middleware — checks if user has admin role.
 * For now, checks if email is in ADMIN_EMAILS env var.
 */
const isAdmin = (req, res, next) => {
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  if (!adminEmails.includes(req.user.email)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// ===== GET /admin/stats =====
adminRouter.get("/admin/stats", userAuth, isAdmin, async (req, res) => {
  try {
    const [totalUsers, totalActive, totalBoosted] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      User.countDocuments({ isBoosted: true }),
    ]);

    res.json({
      data: {
        totalUsers,
        activeUsersThisWeek: totalActive,
        currentlyBoosted: totalBoosted,
        cacheStats: cache.stats(),
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===== POST /admin/challenges =====
adminRouter.post("/admin/challenges", userAuth, isAdmin, async (req, res) => {
  try {
    const { title, description, difficulty, tags, timeLimit, endsAt } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    const challenge = new Challenge({
      title,
      description,
      difficulty: difficulty || "medium",
      tags: tags || [],
      timeLimit: timeLimit || "30 min",
      endsAt: endsAt ? new Date(endsAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
    });

    await challenge.save();
    res.json({ message: "Challenge created", data: challenge });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===== DELETE /admin/challenges/:id =====
adminRouter.delete("/admin/challenges/:id", userAuth, isAdmin, async (req, res) => {
  try {
    await Challenge.findByIdAndDelete(req.params.id);
    res.json({ message: "Challenge deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===== POST /admin/ban/:userId =====
adminRouter.post("/admin/ban/:userId", userAuth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isBanned = true;
    user.bannedAt = new Date();
    user.banReason = req.body.reason || "Violated community guidelines";
    await user.save();

    res.json({ message: `User ${user.firstName} has been banned` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===== POST /admin/unban/:userId =====
adminRouter.post("/admin/unban/:userId", userAuth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isBanned = false;
    user.bannedAt = null;
    user.banReason = "";
    await user.save();

    res.json({ message: `User ${user.firstName} has been unbanned` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===== POST /admin/cache/flush =====
adminRouter.post("/admin/cache/flush", userAuth, isAdmin, (req, res) => {
  cache.flush();
  res.json({ message: "Cache flushed" });
});

module.exports = adminRouter;
