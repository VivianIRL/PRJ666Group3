// skeleton server just to get it running 
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const supabase = require("./db/supabase");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// health check
app.get("/", (req, res) => {
  res.send("StatsCan API Server running 🚀🚀🚀🚀🚀");
});

app.get("/api/test-db", async (req, res) => {
  const { data, error } = await supabase
    .from("test_table")
    .select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});