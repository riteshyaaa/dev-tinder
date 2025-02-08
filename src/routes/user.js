const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest.js");
const User = require("../models/user.js");

const userRouter = express.Router();

const USER_SAFE_DATA = ["firstName", "lastName", "age", "about", "skills" ,"photoUrl"];
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    // Fetching all the connection requests where the logged in user is the receiver and pending request( status is "interested")

    const connectionRequest = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", ["firstName", "lastName"]);
    res.json({
      message: "User connections fetched successfully",
      data: connectionRequest,
    });
  } catch (err) {
    res.status(400).send("error during logging" + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequest = await ConnectionRequest.find({
      $or: [
        {
          toUserId: loggedInUser._id,
          status: "accepted",
        },
        {
          fromUserId: loggedInUser._id,
          status: "accepted",
        },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequest.map((row) => {
      if (row.fromUserId._id.toString() == loggedInUser._id) {
        return row.toUserId;
      } else {
        return row.fromUserId;
      }
    });

    res.json({ data });
  } catch (err) {
    res.status(400).send("error during get connections request" + err.message);
  }
});
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        {
          toUserId: loggedInUser._id,
        },
        {
          fromUserId: loggedInUser._id,
        },
      ],
    }).select("fromUserId toUserId");

    const hideUserData = new Set();
    connectionRequests.forEach((row) => {
      hideUserData.add(row.toUserId.toString());
      hideUserData.add(row.fromUserId.toString());
    });

    const users = await User.find({
      $and: [
        {
          _id: { $nin: Array.from(hideUserData) },
        },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);
     
    res.send(users);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});
module.exports = userRouter;
