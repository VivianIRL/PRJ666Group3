require("dotenv").config();

const app    = require("./app"); 
const logger = require("./logger"); // Import your configured Pino logger

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  // Use logger.info instead of console.log
  logger.info(`SettleCAN API running on http://localhost:${PORT}`);
});