const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth.js");
const { validateEditProfileData } = require("../utils/validation");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    // console.log(user);
    if (!user) throw new Error("user not found");

    // console.log("user successfully logged in ");
    res.send(user);
  } catch (error) {
    res.status(400).send(" error during loging " + error.message);
  }
});
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error(" Invalid fields found");
    }
    
    const loggedInUser = req.user;
    if (!loggedInUser) throw new Error("user not found");
    Object.keys(req.body).forEach((key) => {
      loggedInUser[key] = req.body[key];
    });
    await loggedInUser.save();
    // console.log(loggedInUser)
    res.send({ message:`${loggedInUser.firstName}, user profile updated successfully`,
    data:  loggedInUser});
    
  } catch (err) {
    res.status(400).send("errror during updating user data" + err.message);
  }
});

module.exports = profileRouter;
