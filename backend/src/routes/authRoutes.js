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
      dob:               meta.dob ?? "",
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
      dob:               meta.dob ?? "",
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

// ── POST /api/auth/forgot-password ─────────────────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const redirectTo = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    return res.status(400).json({ message: "Could not send reset email." });
  }

  return res.json({ message: "If an account exists for that email, a reset link has been sent." });
});

// ── POST /api/auth/reset-password ─────────────────────────────────────────────
router.post("/reset-password", async (req, res) => {
  const { accessToken, refreshToken, password } = req.body;

  if (!accessToken || !refreshToken || !password) {
    return res.status(400).json({ message: "Reset link and password are required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (sessionError) {
    return res.status(401).json({ message: "This reset link is invalid or has expired." });
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return res.status(400).json({ message: "Could not reset password." });
  }

  return res.json({ message: "Password reset successfully." });
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
      dob:               meta.dob ?? "",
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
