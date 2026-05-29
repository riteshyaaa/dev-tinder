const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      maxLength: 100,
      trim: true,
    },
    description: {
      type: String,
      maxLength: 500,
      default: "",
    },
    techStack: {
      type: [String],
      default: [],
    },
    lookingFor: {
      type: String,
      maxLength: 200,
      default: "",
    },
    applicants: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    status: {
      type: String,
      enum: ["open", "closed", "in-progress"],
      default: "open",
    },
  },
  { timestamps: true }
);

ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ userId: 1 });

module.exports = mongoose.model("Project", ProjectSchema);
