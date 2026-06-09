const express = require("express");
const router = express.Router();
const supabase = require("../../db/supabase");
const transporter = require("../services/mailer");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

router.patch("/read-all", requireAuth, async (req, res) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", req.user.id)
    .eq("is_read", false);

  if (error) return res.status(400).json({ message: error.message });
  res.json({ message: "All notifications marked as read." });
});

router.patch("/:id/read", requireAuth, async (req, res) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("notification_id", req.params.id)
    .eq("user_id", req.user.id);

  if (error) return res.status(400).json({ message: error.message });
  res.json({ message: "Marked as read." });
});

router.post("/send-email", requireAuth, async (req, res) => {
  const { email, title, description, date } = req.body;
  if (!email || !title) {
    return res.status(400).json({ message: "email and title are required." });
  }

  try {
    await transporter.sendMail({
      from: `"SettleCAN" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `SettleCAN Reminder: ${title}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;">
          <h2 style="color:#8E0002;margin-bottom:4px;">SettleCAN Reminder</h2>
          <h3 style="margin-top:0;">${title}</h3>
          ${date ? `<p><strong>Due:</strong> ${date}</p>` : ""}
          ${description ? `<p>${description}</p>` : ""}
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
          <small style="color:#999;">You are receiving this because you enabled email notifications on SettleCAN.</small>
        </div>
      `,
    });
    res.json({ success: true, message: "Email sent." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const { message, email, send_email } = req.body;
  if (!message)
    return res.status(400).json({ message: "message is required." });

  const { data, error } = await supabase
    .from("notifications")
    .insert([{ user_id: req.user.id, message, is_read: false }])
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });

  if (send_email && email) {
    await transporter
      .sendMail({
        from: `"SettleCAN" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "SettleCAN Reminder",
        html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;">
          <h2 style="color:#8E0002;">SettleCAN Reminder</h2>
          <p>${message}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
          <small style="color:#999;">You are receiving this because you enabled email notifications on SettleCAN.</small>
        </div>
      `,
      })
      .catch(() => {});
  }

  res.status(201).json({ success: true, notification: data });
});

module.exports = router;
