const express  = require("express");
const router   = express.Router();
const supabase = require("../../db/supabase");
const logger = require("../logger");
const { requireAuth } = require("../middleware/authMiddleware");
const { getProfileById, updateProfileById } = require("../controllers/profileController");
const templateService = require("../services/templateService");

// ── GET /api/profile/:user_id ─────────────────────────────────────────────────
router.get("/:user_id", requireAuth, getProfileById);

// ── PUT /api/profile/:user_id ────────────────────────────────────────────────
router.put("/:user_id", requireAuth, updateProfileById);

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

  // A status change means the user needs the NEW status's tasks without
  // losing progress on tasks they already share with their old status (see
  // templateService.materialize() / 009_task_canonical_keys.sql). This is
  // best-effort: the profile update already succeeded, so a generation
  // failure here is logged, not surfaced as a failed request — the
  // frontend's own generate-tasks call on the next /tasks load (see
  // templateController.generateTasks) is a self-healing fallback.
  if (updates.immigration_status !== undefined) {
    try {
      const [onboarding, compliance] = await Promise.all([
        templateService.generateTasksForUser(req.supabase, req.user.id, meta.immigration_status, meta.arrival_date),
        templateService.generateComplianceTasksForUser(req.supabase, req.user.id, meta.immigration_status),
      ]);
      logger.info({ userId: req.user.id, onboarding, compliance }, "Synced tasks after immigration status change");
    } catch (err) {
      logger.error({ err, userId: req.user.id }, "Failed to sync tasks after immigration status change");
    }
  }

  res.json({
    message: "Profile updated.",
    profile: {
      firstName: meta.first_name ?? "",
      lastName: meta.last_name ?? "",
      immigrationStatus: meta.immigration_status ?? "",
      province: meta.province ?? "",
      country: meta.country ?? "",
      arrivalDate: meta.arrival_date ?? "",
      permitExpiry: meta.permit_expiry ?? "",
      languageTest: meta.language_test ?? "",
    },
  });
});
module.exports = router;
