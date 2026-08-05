const express = require("express");
const router  = express.Router();
const { getPolicyUpdates } = require("../controllers/policyFeedController");

router.get("/", getPolicyUpdates);

module.exports = router;
