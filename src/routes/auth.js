const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
const { validateSignUpdata } = require("../utils/validation.js");
const bcrypt = require("bcrypt");
var validator = require("validator");

authRouter.post("/signUp", async (req, res) => {
  try {
    //validate the user data
    validateSignUpdata(req);
    const { firstName, lastName, email, password, gender, age } = req.body;

    //Encrypt the password
    const encryptedPassword = await bcrypt.hash(password, 10);
    console.log(encryptedPassword);
    const user = new User({
      firstName,
      lastName,
      email,
      password: encryptedPassword,
      gender,
      age,
    });
    await user.save();
    res.send("User registered successfully:");
  } catch (error) {
    res.send("Error during signup:" + error.message);
  }
});

authRouter.post("/logIn", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      //validating email address
      if (!validator.isEmail(email)) throw new Error("Invalid email address");
      //checking if user exist or not
      const user = await User.findOne({ email: email });
  
      if (!user) throw new Error("Invalid credentials");
      //varifying user password is correct or not
      const isPasswordValid = await user.validatePassword(password);
      
      if (isPasswordValid) {
        //create JWT token
        const token = await user.getJWT();
        if (!token) {
          throw new Error("token not found");
        }
  
        // add token to cookie and send back to the user
        res.cookie("token", token, {
          expires: new Date(Date.now() + 7 * 24 * 3600000),
        });
  
        res.send("login successfull");
      } else {
        res.send("Invalid credentials");
      }
    } catch (error) {
      res.status(400).send(" error during loging " + error.message);
    }
  });
  authRouter.post("/logOut", async(req, res) => {
    try{
      res.cookie("token", null, {
        expires: new Date(Date.now()) 
      }).send("Successfully logged out");
    }catch{
      res.status(400).send("error during logging out");
    }
  })

module.exports = authRouter ;

