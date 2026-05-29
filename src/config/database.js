const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  // Support both: full URI (Railway/Render) or separate username/password (Atlas)
  const uri =
    process.env.MONGODB_URI ||
    `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.idc8p5l.mongodb.net/devtinder`;

  await mongoose.connect(uri, {
    // Modern Mongoose 8 doesn't need these, but explicit for clarity
    retryWrites: true,
    w: "majority",
  });
};

module.exports = connectDB;
