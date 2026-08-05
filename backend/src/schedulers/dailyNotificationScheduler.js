// dailyNotificationScheduler.js — local/dev convenience runner.
//
// This is NOT the production trigger. Cloud Run instances scale to zero
// and don't run a persistent process, so an in-process node-cron timer
// here can silently never fire in production. The real trigger should be
// Google Cloud Scheduler (or any external cron) making an HTTP call to
// POST /api/v2/scheduler/run-daily with the X-Scheduler-Secret header —
// see backend/src/routes/schedulerRoutes.js. This file just wires up the
// same sweep locally so `npm run dev` demonstrates it without any external
// scheduler configured, gated behind an env flag so it's off by default.
const cron = require("node-cron");
const sharedSupabase = require("../../db/supabase");
const schedulerService = require("../services/schedulerService");
const logger = require("../logger");

function start() {
  if (process.env.ENABLE_NOTIFICATION_CRON !== "true") {
    logger.info("Local notification cron disabled (set ENABLE_NOTIFICATION_CRON=true to enable).");
    return;
  }

  // Once a day at 08:00 server time.
  cron.schedule("0 8 * * *", async () => {
    try {
      const result = await schedulerService.runDailyNotificationSweep(sharedSupabase);
      logger.info(result, "Scheduled daily notification sweep completed");
    } catch (err) {
      logger.error({ err }, "Scheduled daily notification sweep failed");
    }
  });

  logger.info("Local notification cron scheduled for 08:00 daily.");
}

module.exports = { start };
