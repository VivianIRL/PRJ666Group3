const express = require("express");
const router  = express.Router();
const supabase = require("../../db/supabase");

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const {
    email, password,
    firstName, lastName, dob,
    immigrationStatus, province, country,
    arrivalDate, permitExpiry, languageTest,
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name:         firstName        ?? "",
        last_name:          lastName         ?? "",
        dob:                dob              ?? "",
        immigration_status: immigrationStatus ?? "International Student",
        province:           province         ?? "",
        country:            country          ?? "",
        arrival_date:       arrivalDate      ?? "",
        permit_expiry:      permitExpiry     ?? "",
        language_test:      languageTest     ?? "None",
      },
    },
  });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const meta = data.user?.user_metadata ?? {};

  return res.status(201).json({
    message: "Registration successful. Please check your email to confirm your account.",
    user: {
      id:                data.user?.id,
      email:             data.user?.email,
      firstName:         meta.first_name,
      lastName:          meta.last_name,
      immigrationStatus: meta.immigration_status,
      province:          meta.province,
      arrivalDate:       meta.arrival_date,
    },
    token: data.session?.access_token ?? null,
  });
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const meta = data.user?.user_metadata ?? {};

  return res.json({
    message: "Login successful.",
    user: {
      id:                data.user?.id,
      email:             data.user?.email,
      firstName:         meta.first_name         ?? "",
      lastName:          meta.last_name          ?? "",
      immigrationStatus: meta.immigration_status ?? "International Student",
      province:          meta.province           ?? "",
      arrivalDate:       meta.arrival_date       ?? "",
      country:           meta.country            ?? "",
    },
    token: data.session?.access_token,
  });
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post("/logout", async (req, res) => {
  // Sign out the current session; errors are non-fatal
  await supabase.auth.signOut().catch(() => {});
  return res.json({ message: "Logged out successfully." });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
// Verify a JWT and return the current user's profile.
router.get("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided." });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ message: "Invalid or expired token." });

  const meta = data.user.user_metadata ?? {};
  return res.json({
    user: {
      id:                data.user.id,
      email:             data.user.email,
      firstName:         meta.first_name         ?? "",
      lastName:          meta.last_name          ?? "",
      immigrationStatus: meta.immigration_status ?? "International Student",
      province:          meta.province           ?? "",
      arrivalDate:       meta.arrival_date       ?? "",
      country:           meta.country            ?? "",
    },
  });
});

module.exports = router;
