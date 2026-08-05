const sharedSupabase = require("../../db/supabase");
const schedulerService = require("../services/schedulerService");
const logger = require("../logger");

// POST /api/v2/scheduler/run-daily — see requireAdminOrSchedulerSecret in
// authMiddleware.js for who's allowed to call this. When triggered via the
// shared secret (Cloud Scheduler, local cron) there's no logged-in user and
// therefore no req.supabase, so this falls back to the anon singleton
// client — safe only because run_daily_notification_sweep() is granted to
// `anon` specifically for this reason (see the migration file).
async function runDaily(req, res) {
  try {
    const client = req.supabase ?? sharedSupabase;
    const result = await schedulerService.runDailyNotificationSweep(client);
    logger.info(result, "Daily notification sweep completed");
    res.json(result);
  } catch (err) {
    logger.error({ err }, "Daily notification sweep failed");
    res.status(500).json({ message: err.message });
  }
}

module.exports = { runDaily };
