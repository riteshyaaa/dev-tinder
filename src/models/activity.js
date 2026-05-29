const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
      maxLength: 500,
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  { timestamps: true }
);

ActivitySchema.index({ createdAt: -1 });
ActivitySchema.index({ userId: 1 });

module.exports = mongoose.model("Activity", ActivitySchema);
