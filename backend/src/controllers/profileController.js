const { createClient } = require("@supabase/supabase-js");
const ws = require("ws");
const WebSocket = ws.WebSocket || ws;

function userSupabase(req) {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.authorization } },
    realtime: { transport: WebSocket },
  });
}

const PROFILE_FIELDS = [
  "first_name",
  "last_name",
  "immigration_status",
  "province",
  "country",
  "arrival_date",
  "permit_expiry",
  "language_test",
];

const FIELD_ALIASES = {
  firstName: "first_name",
  lastName: "last_name",
  immigrationStatus: "immigration_status",
  arrivalDate: "arrival_date",
  permitExpiry: "permit_expiry",
  languageTest: "language_test",
};

function toProfile(row, user) {
  return {
    id: user.id,
    userId: row.user_id,
    email: user.email ?? "",
    firstName: row.first_name ?? "",
    lastName: row.last_name ?? "",
    immigrationStatus: row.immigration_status ?? "",
    province: row.province ?? "",
    country: row.country ?? "",
    arrivalDate: row.arrival_date ?? "",
    permitExpiry: row.permit_expiry ?? "",
    languageTest: row.language_test ?? "",
  };
}

function profileUpdates(body) {
  return PROFILE_FIELDS.reduce((updates, field) => {
    const camelField = Object.keys(FIELD_ALIASES).find(key => FIELD_ALIASES[key] === field);
    const value = body[field] !== undefined ? body[field] : body[camelField];
    if (value !== undefined) updates[field] = value;
    return updates;
  }, {});
}

async function findProfile(req) {
  return userSupabase(req)
    .from("profiles")
    .select("*")
    .eq("user_id", req.user.id)
    .maybeSingle();
}

async function getProfile(req, res) {
  const { data, error } = await findProfile(req);
  if (error) return res.status(500).json({ message: error.message });
  if (!data) return res.status(404).json({ message: "Profile not found." });
  return res.json(toProfile(data, req.user));
}

async function createProfile(req, res) {
  const updates = profileUpdates(req.body);
  const { data, error } = await userSupabase(req)
    .from("profiles")
    .insert([{ user_id: req.user.id, ...updates }])
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return res.status(409).json({ message: "Profile already exists." });
    return res.status(400).json({ message: error.message });
  }

  return res.status(201).json(toProfile(data, req.user));
}

async function updateProfile(req, res) {
  const updates = profileUpdates(req.body);
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "At least one profile field is required." });
  }

  const { data, error } = await userSupabase(req)
    .from("profiles")
    .upsert([{ user_id: req.user.id, ...updates }], { onConflict: "user_id" })
    .select()
    .single();

  if (error) return res.status(400).json({ message: error.message });
  return res.json(toProfile(data, req.user));
}

async function deleteProfile(req, res) {
  const { data, error } = await userSupabase(req)
    .from("profiles")
    .delete()
    .eq("user_id", req.user.id)
    .select("user_id")
    .maybeSingle();

  if (error) return res.status(400).json({ message: error.message });
  if (!data) return res.status(404).json({ message: "Profile not found." });
  return res.json({ message: "Profile deleted." });
}

module.exports = {
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
};
