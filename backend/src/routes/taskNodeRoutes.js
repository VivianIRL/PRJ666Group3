// taskNodeRoutes.js — the recursive task/subtask hierarchy API.
// Mounted at /api/v2/tasks (see backend/app.js) rather than /api/tasks:
// that path is already served by the existing taskRoutes.js, which the
// current TasksDashboard/TaskManager/Checklist pages depend on for a
// different response shape. Keeping this on its own prefix means neither
// system has to change to accommodate the other.
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const controller = require("../controllers/taskNodeController");

router.use(requireAuth);

// GET /api/v2/tasks — full hierarchical tree for the current user
router.get("/", controller.getTree);

// POST /api/v2/tasks — create a custom root (or child, via parentId) task
router.post("/", controller.createTask);

// GET /api/v2/tasks/:id — one task with its nested children
router.get("/:id", controller.getById);

// PATCH /api/v2/tasks/:id — status, dueDate, or title/description/priority
router.patch("/:id", controller.updateTask);

// DELETE /api/v2/tasks/:id — cascades to all descendants (ON DELETE CASCADE)
router.delete("/:id", controller.deleteTask);

// POST /api/v2/tasks/:taskId/children — create a subtask under :taskId
router.post("/:taskId/children", controller.createChild);

// GET /api/v2/tasks/:taskId/children — direct children only (not the full subtree)
router.get("/:taskId/children", controller.getChildren);

module.exports = router;
