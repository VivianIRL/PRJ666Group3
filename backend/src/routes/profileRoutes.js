const express  = require("express");
const router   = express.Router();
const supabase = require("../../db/supabase");
const logger = require("../../logger");
const { requireAuth } = require("../middleware/authMiddleware");

// ── GET /api/profile ──────────────────────────────────────────────────────────
// Returns the current user's profile (from Supabase user_metadata).
router.get("/", requireAuth, async (req, res) => {
  logger.info({ userId: req.user.id }, "Fetching user profile");

  const meta = req.user.user_metadata ?? {};

  logger.info({ userId: req.user.id }, "User profile retrieved successfully");

  res.json({
    id: req.user.id,
    email: req.user.email,
    firstName: meta.first_name ?? "",
    lastName: meta.last_name ?? "",
    immigrationStatus: meta.immigration_status ?? "",
    province: meta.province ?? "",
    country: meta.country ?? "",
    arrivalDate: meta.arrival_date ?? "",
    permitExpiry: meta.permit_expiry ?? "",
    languageTest: meta.language_test ?? "",
  });
});

// ── PATCH /api/profile ────────────────────────────────────────────────────────
// Updates editable fields in user_metadata.
router.patch("/", requireAuth, async (req, res) => {
  const allowed = [
    "first_name",
    "last_name",
    "immigration_status",
    "province",
    "country",
    "arrival_date",
    "permit_expiry",
    "language_test",
  ];

  const updates = {};

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  logger.info(
    {
      userId: req.user.id,
      fields: Object.keys(updates),
    },
    "Updating user profile"
  );

  const { data, error } = await supabase.auth.updateUser({ data: updates });

  if (error) {
    logger.error(
      {
        err: error,
        userId: req.user.id,
      },
      "Failed to update user profile"
    );

    return res.status(400).json({ message: error.message });
  }

  logger.info(
    { userId: req.user.id },
    "User profile updated successfully"
  );

  const meta = data.user?.user_metadata ?? {};

  res.json({
    message: "Profile updated.",
    profile: {
      firstName: meta.first_name ?? "",
      lastName: meta.last_name ?? "",
      immigrationStatus: meta.immigration_status ?? "",
      province: meta.province ?? "",
      country: meta.country ?? "",
      arrivalDate: meta.arrival_date ?? "",
    },
  });
});
module.exports = router;
