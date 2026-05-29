const express = require("express");
const challengeRouter = express.Router();
const { userAuth } = require("../middlewares/auth.js");
const Challenge = require("../models/challenge.js");
const User = require("../models/user.js");

// GET /challenges
challengeRouter.get("/challenges", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const challenges = await Challenge.find({})
      .sort({ isActive: -1, createdAt: -1 })
      .limit(20);

    const data = challenges.map((c) => {
      const obj = c.toObject();
      obj.hasSubmitted = c.submissions.some(
        (s) => s.userId.toString() === userId.toString()
      );
      obj.participants = c.submissions.length;
      delete obj.submissions; // Don't expose all submissions
      return obj;
    });

    res.json({ data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /challenges/:id/submit
challengeRouter.post("/challenges/:id/submit", userAuth, async (req, res) => {
  try {
    const challengeId = req.params.id;
    const userId = req.user._id;
    const { solution } = req.body;

    if (!solution || !solution.trim()) {
      return res.status(400).json({ error: "Solution is required" });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    const alreadySubmitted = challenge.submissions.some(
      (s) => s.userId.toString() === userId.toString()
    );
    if (alreadySubmitted) {
      return res.status(400).json({ error: "Already submitted" });
    }

    challenge.submissions.push({ userId, solution: solution.trim() });
    await challenge.save();

    // Increment user's challenge streak
    await User.findByIdAndUpdate(userId, { $inc: { challengeStreak: 1 } });

    res.json({ message: "Solution submitted!", data: { participants: challenge.submissions.length } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = challengeRouter;
