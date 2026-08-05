require("dotenv").config();

const app    = require("./app");
const logger = require("./src/logger"); // Import your configured Pino logger
const dailyNotificationScheduler = require("./src/schedulers/dailyNotificationScheduler");

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  // Use logger.info instead of console.log
  logger.info(`SettleCAN API running on http://localhost:${PORT}`);
  dailyNotificationScheduler.start();
});