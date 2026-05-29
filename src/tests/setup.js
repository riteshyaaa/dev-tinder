/**
 * Test Setup — creates Express app instance WITHOUT starting the server.
 * Uses in-memory MongoDB for isolation (or test database).
 */
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Import routes
const authRouter = require("../routes/auth");
const profileRouter = require("../routes/profile");
const requestRouter = require("../routes/request");
const userRouter = require("../routes/user");
const chatRouter = require("../routes/chat");
const projectRouter = require("../routes/project");
const challengeRouter = require("../routes/challenge");
const activityRouter = require("../routes/activity");

// Create app without server.listen()
const createApp = () => {
  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "10mb" }));
  app.use(cookieParser());

  app.use("/", authRouter);
  app.use("/", profileRouter);
  app.use("/", requestRouter);
  app.use("/", userRouter);
  app.use("/", chatRouter);
  app.use("/", projectRouter);
  app.use("/", challengeRouter);
  app.use("/", activityRouter);

  app.get("/health", (req, res) => res.json({ status: "ok" }));

  return app;
};

// Connect to test database
const connectTestDB = async () => {
  const uri =
    process.env.MONGODB_URI_TEST ||
    process.env.MONGODB_URI ||
    `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.idc8p5l.mongodb.net/devtinder_test`;

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
};

// Cleanup test database
const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

// Disconnect
const disconnectTestDB = async () => {
  await mongoose.disconnect();
};

module.exports = { createApp, connectTestDB, clearTestDB, disconnectTestDB };
