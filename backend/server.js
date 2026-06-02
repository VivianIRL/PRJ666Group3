require("dotenv").config();

const express = require("express");
const cors = require("cors");
const supabase = require("./db/supabase");

const authRoutes = require("./src/routes/authRoutes");
const infoRoutes = require("./src/routes/infoRoutes");
const contentRoutes = require("./src/routes/contentRoutes");
const communityRoutes = require("./src/routes/communityRoutes");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// health check
app.get("/", (req, res) => {
  res.send("SettleCAN API Server running...");
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/info", infoRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/community", communityRoutes);

// profiles route
app.get("/api/profiles", async (req, res) => {
  const { data, error } = await supabase.from("profiles").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
