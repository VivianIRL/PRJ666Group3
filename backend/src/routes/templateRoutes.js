// templateRoutes.js — task_hierarchy_templates + generation trigger.
// Mounted at /api/v2 (see backend/app.js): POST /api/v2/templates and
// POST /api/v2/users/:id/generate-tasks.
const express = require("express");
const router = express.Router();
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const controller = require("../controllers/templateController");

// GET /api/v2/templates — public-read (any authenticated user can see the
// active templates; RLS separately restricts write access to admins)
router.get("/templates", requireAuth, controller.listTemplates);

// POST /api/v2/templates — admin only
router.post("/templates", requireAuth, requireAdmin, controller.createTemplate);

// POST /api/v2/users/:id/generate-tasks — self-service (see templateController.generateTasks)
router.post("/users/:id/generate-tasks", requireAuth, controller.generateTasks);

module.exports = router;
