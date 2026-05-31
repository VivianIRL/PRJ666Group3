const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const { createClient } = require("@supabase/supabase-js");

console.log("ENV CHECK:", {
  cwd: process.cwd(),
  file: __dirname,
  url: process.env.SUPABASE_URL,
  keyExists: !!process.env.SUPABASE_ANON_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = supabase;