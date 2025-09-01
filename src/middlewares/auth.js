const User = require("../models/user");
const jwt = require("jsonwebtoken");
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET;


const userAuth = async (req, res, next) => {
  //read token from req cookie
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).send("Please login");
  }

  //if token is valid then send user profile
  const decodedObj = await jwt.verify(token, JWT_SECRET);

  if (!decodedObj) return res.status(401).send("Unauthoreized token");
  //find the user by _id
  const { _id } = decodedObj;
  if (!_id) return res.status(401).send("User not found ");
  const user = await User.findOne({ _id });
  if (!user) return res.status(404).send("User not found");
  req.user = user;
  next();
};

module.exports = {
  userAuth,
};
