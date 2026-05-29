const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
const { validateSignUpdata } = require("../utils/validation.js");
const bcrypt = require("bcrypt");
const validator = require("validator");

// POST /signUp
authRouter.post("/signUp", async (req, res) => {
  try {
    validateSignUpdata(req);
    const { firstName, lastName, email, password, gender, age } = req.body;

    const encryptedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: encryptedPassword,
      gender,
      age,
    });
    const savedUser = await user.save();
    const token = await user.getJWT();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 3600000), // 7 days
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });

    res.json({ message: "User registered successfully", data: savedUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /login (lowercase — matches frontend)
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!validator.isEmail(email)) throw new Error("Invalid email address");

    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) throw new Error("Invalid credentials");

    // Update lastActive
    user.lastActive = new Date();
    await user.save();

    const token = await user.getJWT();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 3600000),
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /logout (lowercase — matches frontend)
authRouter.post("/logout", async (req, res) => {
  try {
    res
      .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      })
      .json({ message: "Successfully logged out" });
  } catch {
    res.status(400).json({ error: "Error during logging out" });
  }
});

module.exports = authRouter;


const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../services/email");

// In-memory token store (use Redis in production)
const resetTokens = new Map();

// POST /auth/forgot-password
authRouter.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists (security)
      return res.json({ message: "If the email exists, a reset code has been sent." });
    }

    // Generate 6-digit token
    const token = crypto.randomInt(100000, 999999).toString();
    resetTokens.set(email.toLowerCase(), {
      token,
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    // Send email
    await sendPasswordResetEmail(email, token);

    res.json({ message: "If the email exists, a reset code has been sent." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /auth/reset-password
authRouter.post("/auth/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: "Email, token, and new password are required" });
    }

    const stored = resetTokens.get(email.toLowerCase());
    if (!stored || stored.token !== token) {
      return res.status(400).json({ error: "Invalid reset code" });
    }
    if (Date.now() > stored.expires) {
      resetTokens.delete(email.toLowerCase());
      return res.status(400).json({ error: "Reset code has expired. Please request a new one." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: hashedPassword }
    );

    // Cleanup token
    resetTokens.delete(email.toLowerCase());

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
