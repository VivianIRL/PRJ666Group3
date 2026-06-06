const express = require("express");
const router = express.Router();
const {
  getWorkPermitInfo,
  getHealthInfo,
  getLanguageInfo,
} = require("../controllers/infoController");

// GET /api/info/work-permit
router.get("/work-permit", getWorkPermitInfo);

// GET /api/info/health
router.get("/health", getHealthInfo);

// GET /api/info/language
router.get("/language", getLanguageInfo);

module.exports = router;
