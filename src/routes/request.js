const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth.js");


requestRouter.get("/sendConnectionRequest", userAuth, async (req, res) => {
    try {
      const user = req.user;
      const { firstName } = user;
      console.log("Request sent successfully ");
  
      res.send(firstName + " made a connection reaquest");
    } catch (err) {
      res.status(400).send(" error during logging" + err.message);
    }
  });


  module.exports = requestRouter;
  
  