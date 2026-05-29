const express = require("express");
const chatRouter = express.Router();
const { userAuth } = require("../middlewares/auth.js");
const Message = require("../models/message.js");
const User = require("../models/user.js");
const ConnectionRequest = require("../models/connectionRequest.js");

// ==================== GET /chat/:targetUserId ====================
// Returns message history between current user and target user
chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const targetUserId = req.params.targetUserId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify they are connected (accepted connection)
    const connection = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
        { fromUserId: targetUserId, toUserId: userId, status: "accepted" },
      ],
    });

    if (!connection) {
      return res.status(403).json({ error: "You must be connected to view chat history" });
    }

    // Fetch messages between both users (both directions)
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: userId },
      ],
    })
      .populate("senderId", "firstName lastName photoUrl")
      .sort({ createdAt: 1 }) // oldest first
      .skip(skip)
      .limit(limit);

    // Mark unread messages as read
    await Message.updateMany(
      { senderId: targetUserId, receiverId: userId, read: false },
      { $set: { read: true } }
    );

    // Get target user info
    const targetUser = await User.findById(targetUserId).select(
      "firstName lastName photoUrl skills currentlyBuilding experienceLevel github"
    );

    res.json({
      messages,
      targetUser,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = chatRouter;
