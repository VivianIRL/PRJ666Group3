const express  = require("express");
const router   = express.Router();
const supabase = require("../../db/supabase");
const { requireAuth } = require("../middleware/authMiddleware");

// ── GET /api/notifications ────────────────────────────────────────────────────
router.get("/", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// ── PATCH /api/notifications/:id/read ────────────────────────────────────────
router.patch("/:id/read", requireAuth, async (req, res) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("notification_id", req.params.id)
    .eq("user_id", req.user.id);

  if (error) return res.status(400).json({ message: error.message });
  res.json({ message: "Marked as read." });
});

// ── PATCH /api/notifications/read-all ────────────────────────────────────────
router.patch("/read-all", requireAuth, async (req, res) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", req.user.id)
    .eq("is_read", false);

  if (error) return res.status(400).json({ message: error.message });
  res.json({ message: "All notifications marked as read." });
});

module.exports = router;
