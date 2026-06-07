const express  = require("express");
const router   = express.Router();
const supabase = require("../../db/supabase");
const { requireAuth } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(requireAuth);

// ── GET /api/tasks ────────────────────────────────────────────────────────────
// Returns all tasks for the current user (from user_tasks + task_templates join).
router.get("/", async (req, res) => {
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

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// ── POST /api/tasks ───────────────────────────────────────────────────────────
// Creates a new task for the current user (custom task, not from a template).
router.post("/", async (req, res) => {
  const { title, description, category, dueDate, customNote } = req.body;
  if (!title?.trim()) return res.status(400).json({ message: "Title is required." });

  // 1. Upsert into task_templates (custom tasks use category "Custom")
  const { data: tmpl, error: tmplErr } = await supabase
    .from("task_templates")
    .insert([{ title: title.trim(), description: description ?? "", category: category ?? "Custom" }])
    .select()
    .single();

  if (tmplErr) return res.status(400).json({ message: tmplErr.message });

  // 2. Create the user_task instance
  const { data: task, error: taskErr } = await supabase
    .from("user_tasks")
    .insert([{
      user_id:          req.user.id,
      task_template_id: tmpl.task_template_id,
      status:           "Pending",
      due_date:         dueDate ?? null,
      custom_note:      customNote ?? null,
    }])
    .select()
    .single();

  if (taskErr) return res.status(400).json({ message: taskErr.message });
  res.status(201).json({ ...task, task_templates: tmpl });
});

// ── PATCH /api/tasks/:id ──────────────────────────────────────────────────────
// Updates status, due_date, or custom_note of a user task.
router.patch("/:id", async (req, res) => {
  const allowed = ["status", "due_date", "custom_note"];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  if (Object.keys(updates).length === 0)
    return res.status(400).json({ message: "No valid fields to update." });

  const { data, error } = await supabase
    .from("user_tasks")
    .update(updates)
    .eq("user_task_id", req.params.id)
    .eq("user_id", req.user.id)   // ensure ownership
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

// ── DELETE /api/tasks/:id ─────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  const { error } = await supabase
    .from("user_tasks")
    .delete()
    .eq("user_task_id", req.params.id)
    .eq("user_id", req.user.id);

  if (error) return res.status(400).json({ message: error.message });
  res.json({ message: "Task deleted." });
});

// ── GET /api/tasks/templates ──────────────────────────────────────────────────
// Returns the master task template library so the frontend can show preset tasks.
router.get("/templates", async (_req, res) => {
  const { data, error } = await supabase
    .from("task_templates")
    .select("*, task_checklist(*)")
    .order("category");

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// ── POST /api/tasks/templates/:templateId/assign ──────────────────────────────
// Assigns an existing template task to the current user.
router.post("/templates/:templateId/assign", async (req, res) => {
  const { dueDate, customNote } = req.body;

  // Prevent duplicates
  const { data: existing } = await supabase
    .from("user_tasks")
    .select("user_task_id")
    .eq("user_id", req.user.id)
    .eq("task_template_id", req.params.templateId)
    .maybeSingle();

  if (existing) return res.status(409).json({ message: "Task already assigned." });

  const { data, error } = await supabase
    .from("user_tasks")
    .insert([{
      user_id:          req.user.id,
      task_template_id: req.params.templateId,
      status:           "Pending",
      due_date:         dueDate ?? null,
      custom_note:      customNote ?? null,
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });
  res.status(201).json(data);
});

module.exports = router;
