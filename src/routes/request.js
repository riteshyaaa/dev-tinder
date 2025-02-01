const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth.js");
const ConnectionRequest = require("../models/connectionRequest.js");
const User = require("../models/user");
const connectionRequest = require("../models/connectionRequest.js");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["interested", "ignored"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).send(`${status} is not valid`);
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({
          Error: "userId not valid",
        });
      }

      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          {
            fromUserId,
            toUserId,
          },
          {
            fromUserId: toUserId,
            toUserId: fromUserId,
          },
        ],
      });
      if (existingRequest) {
        return res.status(200).send("Connection already established");
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();
      res.json({
        message: "Request sent successfully",
        data,
      });
    } catch (err) {
      res.status(400).send(" error during logging " + err.message);
    }
  }
);
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const {status,requestId} = req.params;
     
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).send(" status not valid" + err.message);
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      if (!connectionRequest) {
        return res.status(404).send(` ${status} Request not found `);
      }
      connectionRequest.status = status;
      const data = await connectionRequest.save();
      res.json({
        message: `Request ${status} successfully`,
        data,
      });
    } catch (err) {
      res.status(400).send("Error occure during :" + err.message);
    }
  }
);
module.exports = requestRouter;
