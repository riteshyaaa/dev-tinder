const cron = require("node-cron");
const User = require("../models/user");
const Challenge = require("../models/challenge");

/**
 * Cron Jobs — Automated background tasks.
 *
 * Jobs:
 * 1. Expire boosts: Every 5 minutes, deactivate expired profile boosts
 * 2. Deactivate challenges: Daily at midnight, mark past challenges inactive
 * 3. Reset streaks: Daily at midnight, reset streaks for inactive users
 */

const initializeCronJobs = () => {
  // ===== JOB 1: Expire boosts (every 5 minutes) =====
  cron.schedule("*/5 * * * *", async () => {
    try {
      const result = await User.updateMany(
        { isBoosted: true, boostExpiresAt: { $lt: new Date() } },
        { $set: { isBoosted: false, boostExpiresAt: null } }
      );
      if (result.modifiedCount > 0) {
        console.log(`[CRON] Expired ${result.modifiedCount} boosts`);
      }
    } catch (err) {
      console.error("[CRON] Expire boosts failed:", err.message);
    }
  });

  // ===== JOB 2: Deactivate old challenges (daily at midnight) =====
  cron.schedule("0 0 * * *", async () => {
    try {
      const result = await Challenge.updateMany(
        { isActive: true, endsAt: { $lt: new Date() } },
        { $set: { isActive: false } }
      );
      if (result.modifiedCount > 0) {
        console.log(`[CRON] Deactivated ${result.modifiedCount} expired challenges`);
      }
    } catch (err) {
      console.error("[CRON] Deactivate challenges failed:", err.message);
    }
  });

  // ===== JOB 3: Reset streaks for inactive users (daily at 1 AM) =====
  cron.schedule("0 1 * * *", async () => {
    try {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const result = await User.updateMany(
        { lastActive: { $lt: twoDaysAgo }, challengeStreak: { $gt: 0 } },
        { $set: { challengeStreak: 0 } }
      );
      if (result.modifiedCount > 0) {
        console.log(`[CRON] Reset streaks for ${result.modifiedCount} inactive users`);
      }
    } catch (err) {
      console.error("[CRON] Reset streaks failed:", err.message);
    }
  });

  console.log("✅ Cron jobs initialized (boosts, challenges, streaks)");
};

module.exports = initializeCronJobs;
