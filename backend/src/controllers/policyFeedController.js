const { fetchIrccNews } = require("../services/policyFeedService");
const logger = require("../logger");

// GET /api/policy-updates — real, live IRCC newsroom items (Government of
// Canada's official Atom feed). Public, unauthenticated — the same posture
// as /api/community/faq.
async function getPolicyUpdates(req, res) {
  try {
    const items = await fetchIrccNews();
    res.json(items);
  } catch (err) {
    logger.error({ err }, "Failed to fetch IRCC news feed");
    res.status(502).json({ message: "Couldn't reach the IRCC news feed right now." });
  }
}

module.exports = { getPolicyUpdates };
