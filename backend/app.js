

const express = require("express");
const cors    = require("cors");
const logger = require("./logger.js");
const authRoutes         = require("./src/routes/authRoutes");
const profileRoutes      = require("./src/routes/profileRoutes");
const taskRoutes         = require("./src/routes/taskRoutes");
const infoRoutes         = require("./src/routes/infoRoutes");
const contentRoutes      = require("./src/routes/contentRoutes");
const communityRoutes    = require("./src/routes/communityRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));

app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ status: "SettleCAN API running", version: "1.0.0" });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/profile",       profileRoutes);
app.use("/api/tasks",         taskRoutes);
app.use("/api/info",          infoRoutes);
app.use("/api/content",       contentRoutes);
app.use("/api/community",     communityRoutes);
app.use("/api/notifications", notificationRoutes);

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: "Route not found." }));


module.exports = app;