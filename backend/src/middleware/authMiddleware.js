const supabase = require("../../db/supabase");

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
  next();
}

module.exports = { requireAuth };
