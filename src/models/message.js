const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    text: {
      type: String,
      default: "",
      maxLength: 5000,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
    reactions: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      // Format: { "👍": ["userId1", "userId2"], "❤️": ["userId3"] }
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
MessageSchema.index({ receiverId: 1, read: 1 });

module.exports = mongoose.model("Message", MessageSchema);
