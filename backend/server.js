require("dotenv").config();

const app = require("./app");
const logger = require("./logger");

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`SettleCAN API running on http://localhost:${PORT}`);
});
