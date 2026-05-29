const User = require("../models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || "Riteshy@dav89";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ error: "Please login" });
    }

    const decodedObj = jwt.verify(token, JWT_SECRET);

    if (!decodedObj) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { _id } = decodedObj;
    if (!_id) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    const user = await User.findById(_id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please login again." });
    }
    return res.status(500).json({ error: "Authentication failed" });
  }
};

module.exports = {
  userAuth,
};
