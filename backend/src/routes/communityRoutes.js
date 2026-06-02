const express = require("express");
const router = express.Router();
const communityController = require("../controllers/communityController");

router.get("/", communityController.getAllPosts);
router.post("/", communityController.createPost);
router.put("/:id/reply", communityController.replyToPost);
router.delete("/:id", communityController.deletePost);

module.exports = router;
