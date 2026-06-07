const express  = require("express");
const router   = express.Router();
const supabase = require("../../db/supabase");
const { requireAuth } = require("../middleware/authMiddleware");

// ── GET /api/community/posts ──────────────────────────────────────────────────
router.get("/posts", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("community_qa")
    .select("*")
    .order("qa_id", { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// ── POST /api/community/posts ─────────────────────────────────────────────────
router.post("/posts", requireAuth, async (req, res) => {
  const { question, tags } = req.body;
  if (!question?.trim()) return res.status(400).json({ message: "Question is required." });

  const { data, error } = await supabase
    .from("community_qa")
    .insert([{
      user_id:      req.user.id,
      question:     question.trim(),
      answer:       null,
      is_moderated: false,
      tags:         tags ?? [],
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });
  res.status(201).json(data);
});

// ── GET /api/community/faq ────────────────────────────────────────────────────
router.get("/faq", async (_req, res) => {
  const { data, error } = await supabase
    .from("faq_db")
    .select("*")
    .order("category");

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

module.exports = router;
