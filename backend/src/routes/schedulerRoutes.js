// schedulerRoutes.js — manual/external trigger for the daily notification
// sweep. Mounted at /api/v2/scheduler. The actual daily run in production
// is expected to come from Cloud Scheduler (or node-cron locally) hitting
// this same endpoint — see backend/src/schedulers/dailyNotificationScheduler.js.
const express = require("express");
const router = express.Router();
const { requireAdminOrSchedulerSecret } = require("../middleware/authMiddleware");
const controller = require("../controllers/schedulerController");

router.post("/run-daily", requireAdminOrSchedulerSecret, controller.runDaily);

module.exports = router;
