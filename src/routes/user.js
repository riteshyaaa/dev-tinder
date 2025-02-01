const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest.js");
const userRouter = express.Router();

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
      data: { connections: connectionRequest },
    });
  } catch (err) {
    res.status(400).send("error during logging" + err.message);
  }
});

module.exports = userRouter;
