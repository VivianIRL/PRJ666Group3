const supabase = require("../../db/supabase");
const { createClient } = require("@supabase/supabase-js");
const ws = require("ws");
const WebSocket = ws.WebSocket || ws;

/**
 * Middleware that validates the Bearer JWT from the Authorization header.
 * Attaches `req.user` with the Supabase user object on success.
 */
async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Authentication required." });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }

  req.user = data.user;

  // Task hierarchy system routes (backend/src/routes/taskNode*.js etc.) read
  // and write through a per-request client that forwards the caller's own
  // JWT, so Postgres RLS — not application code — enforces "users can only
  // touch their own rows". This is purely additive: existing routes that
  // never reference req.supabase are unaffected.
  req.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.authorization } },
    realtime: { transport: WebSocket },
  });

  next();
}

/**
 * Gates admin-only endpoints (template authoring, analytics). Must run
 * after requireAuth. Checks membership in the existing `admins` table
 * rather than adding a new role column — that table already exists in the
 * schema but nothing in the app queried it before this.
 */
async function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const client = req.supabase ?? supabase;
  const { data, error } = await client
    .from("admins")
    .select("admin_id")
    .eq("user_id", req.user.id)
    .maybeSingle();

  if (error) return res.status(500).json({ message: error.message });
  if (!data) return res.status(403).json({ message: "Admin access required." });

  next();
}

/**
 * Guards the daily notification sweep endpoint. There's no logged-in human
 * user when Cloud Scheduler (or local cron) triggers it, so it accepts
 * either a valid admin session OR a shared secret set in both the request
 * header and the SCHEDULER_SECRET env var. See
 * docs/TASK_NOTIFICATION_SYSTEM_DESIGN.md ("Known trade-off: scheduler auth")
 * for why this — rather than a service-role key — is what's used here.
 */
function requireAdminOrSchedulerSecret(req, res, next) {
  const provided = req.headers["x-scheduler-secret"];
  if (provided && process.env.SCHEDULER_SECRET && provided === process.env.SCHEDULER_SECRET) {
    return next();
  }
  return requireAuth(req, res, () => requireAdmin(req, res, next));
}

module.exports = { requireAuth, requireAdmin, requireAdminOrSchedulerSecret };
