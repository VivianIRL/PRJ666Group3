const express = require("express");
const router = express.Router();

// placeholder auth routes — to be completed by auth team
router.post("/register", (req, res) => {
  res.json({ message: "Register endpoint — coming soon" });
});

router.post("/login", (req, res) => {
  res.json({ message: "Login endpoint — coming soon" });
});

router.post("/logout", (req, res) => {
  res.json({ message: "Logout endpoint — coming soon" });
});

module.exports = router;
