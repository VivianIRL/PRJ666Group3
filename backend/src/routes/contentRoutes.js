const express = require("express");
const router = express.Router();
const contentController = require("../controllers/contentController");

router.get("/", contentController.getAllContent);
router.post("/", contentController.createContent);
router.put("/:id", contentController.updateContent);
router.delete("/:id", contentController.deleteContent);

module.exports = router;
