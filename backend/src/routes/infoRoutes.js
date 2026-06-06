const express = require("express");
const router = express.Router();
const {
  getWorkPermitInfo,
  getHealthInfo,
} = require("../controllers/infoController");

// GET /api/info/work-permit
router.get("/work-permit", getWorkPermitInfo);

// GET /api/info/health
router.get("/health", getHealthInfo);

module.exports = router;
