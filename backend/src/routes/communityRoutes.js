const express  = require("express");
const router   = express.Router();
const supabase = require("../../db/supabase");
const { requireAuth } = require("../middleware/authMiddleware");

// Posts and replies go through req.supabase (the caller's own JWT forwarded
// through, set by requireAuth) rather than the shared anon-key client above
// — community_qa/community_replies' RLS policies check auth.uid() = user_id,
// which is NULL under the anon client, so inserts made through it were
// silently rejected. FAQ stays on the shared client since it's public,
// unauthenticated reference data with no write path.

// ── GET /api/community/posts ──────────────────────────────────────────────────
router.get("/posts", requireAuth, async (req, res) => {
  const { data, error } = await req.supabase
    .from("community_qa")
    .select("*, community_replies(*)")
    .order("qa_id", { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// ── POST /api/community/posts ─────────────────────────────────────────────────
router.post("/posts", requireAuth, async (req, res) => {
  const { question, tags } = req.body;
  if (!question?.trim()) return res.status(400).json({ message: "Question is required." });

  const { data, error } = await req.supabase
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

// ── DELETE /api/community/posts/:id ───────────────────────────────────────────
// RLS (auth.uid() = user_id) is what actually stops one user from deleting
// another's post — this route just forwards the request.
router.delete("/posts/:id", requireAuth, async (req, res) => {
  const { error } = await req.supabase
    .from("community_qa")
    .delete()
    .eq("qa_id", req.params.id);

  if (error) return res.status(400).json({ message: error.message });
  res.status(204).end();
});

// ── POST /api/community/posts/:id/replies ─────────────────────────────────────
router.post("/posts/:id/replies", requireAuth, async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ message: "Reply text is required." });

  const { data, error } = await req.supabase
    .from("community_replies")
    .insert([{
      qa_id:      req.params.id,
      user_id:    req.user.id,
      reply_text: text.trim(),
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });
  res.status(201).json(data);
});

// ── DELETE /api/community/replies/:replyId ────────────────────────────────────
router.delete("/replies/:replyId", requireAuth, async (req, res) => {
  const { error } = await req.supabase
    .from("community_replies")
    .delete()
    .eq("reply_id", req.params.replyId);

  if (error) return res.status(400).json({ message: error.message });
  res.status(204).end();
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
