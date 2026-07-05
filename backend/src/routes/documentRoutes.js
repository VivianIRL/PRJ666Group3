const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  getExpiringDocuments,
} = require("../controllers/documentController");

// GET /api/documents/expiring — must come before /:id so "expiring" isn't treated as an id
router.get("/expiring", requireAuth, getExpiringDocuments);

router.get("/", requireAuth, getDocuments);
router.get("/:id", requireAuth, getDocumentById);
router.post("/", requireAuth, createDocument);
router.put("/:id", requireAuth, updateDocument);
router.delete("/:id", requireAuth, deleteDocument);

module.exports = router;
