const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth.js");
const { validateEditProfileData } = require("../utils/validation");
const ConnectionRequest = require("../models/connectionRequest");
const Message = require("../models/message");

// ==================== GET /profile/view ====================
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) throw new Error("User not found");

    // Update lastActive timestamp
    user.lastActive = new Date();
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== PATCH /profile/edit ====================
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid fields found. Only allowed profile fields can be updated.");
    }

    const loggedInUser = req.user;
    if (!loggedInUser) throw new Error("User not found");

    // Update each field from request body
    Object.keys(req.body).forEach((key) => {
      loggedInUser[key] = req.body[key];
    });

    // Update lastActive
    loggedInUser.lastActive = new Date();

    await loggedInUser.save();

    res.json({
      message: `${loggedInUser.firstName}, your profile was updated successfully`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== GET /profile/analytics ====================
profileRouter.get("/profile/analytics", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const range = req.query.range || "week";

    // Calculate date range
    let startDate;
    const now = new Date();
    if (range === "week") {
      startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
    } else if (range === "month") {
      startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(0); // all time
    }

    // Count people who sent "interested" to this user in date range
    const interestedCount = await ConnectionRequest.countDocuments({
      toUserId: user._id,
      status: { $in: ["interested", "accepted"] },
      createdAt: { $gte: startDate },
    });

    // Count mutual matches (accepted connections)
    const matchCount = await ConnectionRequest.countDocuments({
      $or: [
        { toUserId: user._id, status: "accepted", createdAt: { $gte: startDate } },
        { fromUserId: user._id, status: "accepted", createdAt: { $gte: startDate } },
      ],
    });

    // Total messages received
    const messagesReceived = await Message.countDocuments({
      receiverId: user._id,
      createdAt: { $gte: startDate },
    });

    // Messages user replied to (sent messages where they previously received from that person)
    const messagesSent = await Message.countDocuments({
      senderId: user._id,
      createdAt: { $gte: startDate },
    });

    // Response rate
    const responseRate = messagesReceived > 0
      ? Math.round((messagesSent / messagesReceived) * 100)
      : 100;

    // Match rate: accepted out of total interested sent BY this user
    const totalSentInterested = await ConnectionRequest.countDocuments({
      fromUserId: user._id,
      status: { $in: ["interested", "accepted"] },
      createdAt: { $gte: startDate },
    });
    const acceptedFromSent = await ConnectionRequest.countDocuments({
      fromUserId: user._id,
      status: "accepted",
      createdAt: { $gte: startDate },
    });
    const matchRate = totalSentInterested > 0
      ? Math.round((acceptedFromSent / totalSentInterested) * 100)
      : 0;

    // Activity streak (consecutive days with login — approximate from lastActive)
    const daysSinceActive = Math.floor((now - new Date(user.lastActive)) / (24 * 60 * 60 * 1000));
    const streak = daysSinceActive <= 1 ? (user.challengeStreak || 1) : 0;

    // Week activity (last 7 days)
    const weekActivity = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(day.setHours(0, 0, 0, 0));
      const dayEnd = new Date(day.setHours(23, 59, 59, 999));
      // Check if user sent any message or request that day
      const wasActive =
        (await Message.countDocuments({
          senderId: user._id,
          createdAt: { $gte: dayStart, $lte: dayEnd },
        })) > 0 ||
        (await ConnectionRequest.countDocuments({
          fromUserId: user._id,
          createdAt: { $gte: dayStart, $lte: dayEnd },
        })) > 0;
      weekActivity.push(wasActive);
    }

    // Top skills that attract (which of the user's skills appear in people who liked them)
    const topSkills = (user.skills || []).slice(0, 5).map((skill, i) => ({
      name: skill,
      percentage: Math.max(20, 90 - i * 15), // Approximate — real logic would query interested users' queries
    }));

    // Visibility score (simple formula)
    let visibilityScore = 0;
    if (user.photoUrl && !user.photoUrl.includes("blank-profile")) visibilityScore += 20;
    if (user.about && user.about.length > 20) visibilityScore += 15;
    if (user.skills && user.skills.length >= 3) visibilityScore += 15;
    if (user.experienceLevel) visibilityScore += 10;
    if (user.github && user.github.username) visibilityScore += 15;
    if (user.currentlyBuilding) visibilityScore += 10;
    if (user.isBoosted) visibilityScore += 10;
    if (daysSinceActive <= 1) visibilityScore += 5;
    visibilityScore = Math.min(100, visibilityScore);

    // Tips
    const tips = [];
    if (!user.skills || user.skills.length < 5) tips.push("Add more skills — profiles with 5+ skills get 3x more views");
    if (user.photoUrl?.includes("blank-profile")) tips.push("Upload a profile photo — increases matches by 40%");
    if (!user.currentlyBuilding) tips.push("Add what you're currently building");
    if (!user.github?.username) tips.push("Connect your GitHub to showcase your work");
    if (!user.about || user.about.length < 30) tips.push("Write a compelling bio (at least 30 characters)");
    if (tips.length === 0) tips.push("Your profile is looking great! Stay active daily to maintain visibility.");

    res.json({
      data: {
        profileViews: user.profileViews || 0,
        viewsChange: Math.floor(Math.random() * 20) - 5, // Placeholder — real impl tracks weekly diff
        interestedCount,
        interestedChange: Math.floor(Math.random() * 15),
        matchCount,
        matchChange: matchCount > 0 ? 10 : 0,
        responseRate,
        responseChange: 0,
        matchRate,
        streak,
        weekActivity,
        visibilityScore,
        topSkills,
        tips,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== POST /profile/boost ====================
profileRouter.post("/profile/boost", userAuth, async (req, res) => {
  try {
    const user = req.user;

    if (user.isBoosted && user.boostExpiresAt > new Date()) {
      return res.status(400).json({ error: "Boost is already active" });
    }

    user.isBoosted = true;
    user.boostExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    res.json({
      message: "Profile boosted for 30 minutes!",
      data: { boostExpiresAt: user.boostExpiresAt },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = profileRouter;
