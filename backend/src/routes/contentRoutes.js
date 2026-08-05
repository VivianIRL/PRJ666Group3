const express  = require("express");
const router   = express.Router();
const supabase = require("../../db/supabase");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

// ── GET /api/content ──────────────────────────────────────────────────────────
// Public: returns all Published articles. body_content is included so the
// Articles list page can show a real summary/read-time instead of always
// falling back to a 1-minute placeholder.
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("content_db")
    .select("content_id, title, page_name, body_content, category, status, last_updated")
    .order("last_updated", { ascending: false });

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// ── GET /api/content/:id ──────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("content_db")
    .select("*")
    .eq("content_id", req.params.id)
    .single();

  if (error) return res.status(404).json({ message: "Article not found." });
  res.json(data);
});

// Writes go through req.supabase (the caller's own JWT) + requireAdmin —
// content_db's RLS only ever had a public SELECT policy, so writes made
// through the shared anon client were silently rejected regardless of who
// called them. See backend/db/init/006_content_admin_policies.sql for the
// admin write policy this now relies on.

// ── POST /api/content ─────────────────────────────────────────────────────────
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const { title, pageName, bodyContent, category, status } = req.body;
  if (!title?.trim()) return res.status(400).json({ message: "Title is required." });

  const { data, error } = await req.supabase
    .from("content_db")
    .insert([{
      title,
      page_name:    pageName    ?? title,
      body_content: bodyContent ?? "",
      category:     category    ?? "General",
      status:       status      ?? "Draft",
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });
  res.status(201).json(data);
});

// ── PATCH /api/content/:id ────────────────────────────────────────────────────
router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  const allowed = ["title", "page_name", "body_content", "category", "status"];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  // Always bump last_updated
  updates.last_updated = new Date().toISOString();

  const { data, error } = await req.supabase
    .from("content_db")
    .update(updates)
    .eq("content_id", req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

// ── DELETE /api/content/:id ───────────────────────────────────────────────────
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const { error } = await req.supabase
    .from("content_db")
    .delete()
    .eq("content_id", req.params.id);

  if (error) return res.status(400).json({ message: error.message });
  res.json({ message: "Article deleted." });
});

module.exports = router;
