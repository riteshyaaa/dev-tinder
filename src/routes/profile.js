const express = require("express")
const profileRouter = express.Router()
const { userAuth } = require("../middlewares/auth.js");


profileRouter.get("/profile", userAuth, async (req, res) => {
    try {
      const user = req.user;
      if (!user) throw new Error("user not found");
  
      console.log("user successfully logged in ");
      res.send(user);
    } catch (error) {
      res.status(400).send(" error during loging " + error.message);
    }
  });


  module.exports = profileRouter;