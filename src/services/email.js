const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Email service using Nodemailer.
 *
 * Supports:
 * - Password reset emails
 * - Match notifications
 * - Connection request notifications
 *
 * Configuration via env vars:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * Falls back to console logging in development (no SMTP configured).
 */

// Create reusable transporter
const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  // Development: log emails to console
  return null;
};

const transporter = createTransporter();
const FROM_EMAIL = process.env.SMTP_FROM || "DevTinder <noreply@devtinder.dev>";

/**
 * Send an email. Falls back to console.log in dev mode.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = { from: FROM_EMAIL, to, subject, html, text };

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`Email failed to ${to}:`, err.message);
      return { success: false, error: err.message };
    }
  } else {
    // Dev mode: log to console
    console.log(`\n📧 EMAIL (dev mode) ─────────────────`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text || html}`);
    console.log(`─────────────────────────────────────\n`);
    return { success: true, messageId: "dev-mode" };
  }
};

// ===== EMAIL TEMPLATES =====

const sendPasswordResetEmail = async (email, token) => {
  return sendEmail({
    to: email,
    subject: "DevTinder — Password Reset Code",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #661ae6;">🔐 Password Reset</h2>
        <p>You requested a password reset for your DevTinder account.</p>
        <p>Your reset code is:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #661ae6;">${token}</span>
        </div>
        <p>This code expires in 15 minutes.</p>
        <p style="color: #888; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
    text: `Your DevTinder password reset code is: ${token}. This expires in 15 minutes.`,
  });
};

const sendMatchNotificationEmail = async (email, matchedUserName) => {
  return sendEmail({
    to: email,
    subject: `🎉 It's a Match! — ${matchedUserName} likes you too!`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #661ae6;">🎉 It's a Match!</h2>
        <p>Great news! You and <strong>${matchedUserName}</strong> are interested in each other.</p>
        <p>Start a conversation and see where it leads!</p>
        <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/connections"
           style="display: inline-block; background: #661ae6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
          Send a Message →
        </a>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">— DevTinder Team</p>
      </div>
    `,
    text: `It's a match! You and ${matchedUserName} are interested in each other. Open DevTinder to start chatting.`,
  });
};

const sendNewRequestEmail = async (email, fromUserName) => {
  return sendEmail({
    to: email,
    subject: `🤝 ${fromUserName} wants to connect — DevTinder`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #661ae6;">New Connection Request</h2>
        <p><strong>${fromUserName}</strong> is interested in connecting with you!</p>
        <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/requests"
           style="display: inline-block; background: #661ae6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
          View Request →
        </a>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">— DevTinder Team</p>
      </div>
    `,
    text: `${fromUserName} wants to connect with you on DevTinder. Open the app to respond.`,
  });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendMatchNotificationEmail,
  sendNewRequestEmail,
};
