const express = require("express");
const activityRouter = express.Router();
const { userAuth } = require("../middlewares/auth.js");
const Activity = require("../models/activity.js");

// GET /activity/feed
activityRouter.get("/activity/feed", userAuth, async (req, res) => {
  try {
    const activities = await Activity.find({})
      .populate("userId", "firstName lastName photoUrl")
      .sort({ createdAt: -1 })
      .limit(30);

    const data = activities.map((a) => ({
      ...a.toObject(),
      author: a.userId,
    }));

    res.json({ data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /activity/story
activityRouter.post("/activity/story", userAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content is required" });
    }

    const activity = new Activity({
      userId: req.user._id,
      content: content.trim(),
    });
    await activity.save();

    const populated = await Activity.findById(activity._id)
      .populate("userId", "firstName lastName photoUrl");

    res.json({
      message: "Story posted!",
      data: { ...populated.toObject(), author: populated.userId },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = activityRouter;
