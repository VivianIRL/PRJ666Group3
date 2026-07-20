const express = require("express");
const router = express.Router();
const supabase = require("../../db/supabase");
const { requireAuth } = require("../middleware/authMiddleware");
const logger = require("../../logger"); // Adjust path if needed

// All routes require authentication
router.use(requireAuth);

// ── GET /api/tasks ────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  logger.info({ userId: req.user.id }, "Fetching user tasks");

  const { data, error } = await supabase
    .from("user_tasks")
    .select(`
      user_task_id,
      status,
      due_date,
      custom_note,
      task_templates (
        task_template_id,
        title,
        description,
        category,
        base_due_days
      ),
      task_checklist:task_checklist (
        checklist_id,
        item_description,
        is_required
      )
    `)
    .eq("user_id", req.user.id)
    .order("due_date", { ascending: true });

  if (error) {
    logger.error({ err: error, userId: req.user.id }, "Failed to fetch tasks");
    return res.status(500).json({ message: error.message });
  }

  logger.info(
    { userId: req.user.id, count: data.length },
    "Tasks fetched successfully"
  );

  res.json(data);
});

// ── POST /api/tasks ───────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const { title, description, category, dueDate, customNote } = req.body;

  if (!title?.trim()) {
    logger.warn({ userId: req.user.id }, "Task creation failed: title missing");
    return res.status(400).json({ message: "Title is required." });
  }

  logger.info(
    { userId: req.user.id, title: title.trim() },
    "Creating custom task"
  );

  const { data: tmpl, error: tmplErr } = await supabase
    .from("task_templates")
    .insert([{
      title: title.trim(),
      description: description ?? "",
      category: category ?? "Custom",
    }])
    .select()
    .single();

  if (tmplErr) {
    logger.error({ err: tmplErr, userId: req.user.id }, "Failed to create task template");
    return res.status(400).json({ message: tmplErr.message });
  }

  const { data: task, error: taskErr } = await supabase
    .from("user_tasks")
    .insert([{
      user_id: req.user.id,
      task_template_id: tmpl.task_template_id,
      status: "Pending",
      due_date: dueDate ?? null,
      custom_note: customNote ?? null,
    }])
    .select()
    .single();

  if (taskErr) {
    logger.error({ err: taskErr, userId: req.user.id }, "Failed to create user task");
    return res.status(400).json({ message: taskErr.message });
  }

  logger.info(
    { userId: req.user.id, taskId: task.user_task_id },
    "Task created successfully"
  );

  res.status(201).json({ ...task, task_templates: tmpl });
});

// ── PATCH /api/tasks/:id ──────────────────────────────────────────────────────
router.patch("/:id", async (req, res) => {
  const allowed = ["status", "due_date", "custom_note"];
  const updates = {};

  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  if (Object.keys(updates).length === 0) {
    logger.warn(
      { userId: req.user.id, taskId: req.params.id },
      "No valid fields provided for task update"
    );
    return res.status(400).json({ message: "No valid fields to update." });
  }

  logger.info(
    { userId: req.user.id, taskId: req.params.id, updates },
    "Updating task"
  );

  const { data, error } = await supabase
    .from("user_tasks")
    .update(updates)
    .eq("user_task_id", req.params.id)
    .eq("user_id", req.user.id)
    .select()
    .single();

  if (error) {
    logger.error(
      { err: error, userId: req.user.id, taskId: req.params.id },
      "Failed to update task"
    );
    return res.status(400).json({ message: error.message });
  }

  logger.info(
    { userId: req.user.id, taskId: req.params.id },
    "Task updated successfully"
  );

  res.json(data);
});

// ── DELETE /api/tasks/:id ─────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  logger.info(
    { userId: req.user.id, taskId: req.params.id },
    "Deleting task"
  );

  const { error } = await supabase
    .from("user_tasks")
    .delete()
    .eq("user_task_id", req.params.id)
    .eq("user_id", req.user.id);

  if (error) {
    logger.error(
      { err: error, userId: req.user.id, taskId: req.params.id },
      "Failed to delete task"
    );
    return res.status(400).json({ message: error.message });
  }

  logger.info(
    { userId: req.user.id, taskId: req.params.id },
    "Task deleted successfully"
  );

  res.json({ message: "Task deleted." });
});

// ── GET /api/tasks/templates ──────────────────────────────────────────────────
router.get("/templates", async (_req, res) => {
  logger.info("Fetching task templates");

  const { data, error } = await supabase
    .from("task_templates")
    .select("*, task_checklist(*)")
    .order("category");

  if (error) {
    logger.error({ err: error }, "Failed to fetch task templates");
    return res.status(500).json({ message: error.message });
  }

  logger.info({ count: data.length }, "Task templates fetched successfully");

  res.json(data);
});

// ── POST /api/tasks/templates/:templateId/assign ──────────────────────────────
router.post("/templates/:templateId/assign", async (req, res) => {
  const { dueDate, customNote } = req.body;

  logger.info(
    { userId: req.user.id, templateId: req.params.templateId },
    "Assigning template task"
  );

  const { data: existing } = await supabase
    .from("user_tasks")
    .select("user_task_id")
    .eq("user_id", req.user.id)
    .eq("task_template_id", req.params.templateId)
    .maybeSingle();

  if (existing) {
    logger.warn(
      { userId: req.user.id, templateId: req.params.templateId },
      "Template task already assigned"
    );

    return res.status(409).json({ message: "Task already assigned." });
  }

  const { data, error } = await supabase
    .from("user_tasks")
    .insert([{
      user_id: req.user.id,
      task_template_id: req.params.templateId,
      status: "Pending",
      due_date: dueDate ?? null,
      custom_note: customNote ?? null,
    }])
    .select()
    .single();

  if (error) {
    logger.error(
      { err: error, userId: req.user.id, templateId: req.params.templateId },
      "Failed to assign template task"
    );
    return res.status(400).json({ message: error.message });
  }

  logger.info(
    { userId: req.user.id, taskId: data.user_task_id },
    "Template task assigned successfully"
  );

  res.status(201).json(data);
});

module.exports = router;