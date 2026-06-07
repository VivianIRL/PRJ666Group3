const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const { createClient } = require("@supabase/supabase-js");
const ws = require("ws");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    realtime: { transport: ws },
  }
);

module.exports = supabase;