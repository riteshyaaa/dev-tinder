const mongoose = require("mongoose");

const ChallengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxLength: 200,
    },
    description: {
      type: String,
      required: true,
      maxLength: 1000,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    tags: {
      type: [String],
      default: [],
    },
    timeLimit: {
      type: String,
      default: "30 min",
    },
    endsAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
    },
    participants: {
      type: Number,
      default: 0,
    },
    submissions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        solution: String,
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

ChallengeSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model("Challenge", ChallengeSchema);
