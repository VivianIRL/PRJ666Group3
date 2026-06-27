require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/authRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const taskRoutes = require("./src/routes/taskRoutes");
const infoRoutes = require("./src/routes/infoRoutes");
const contentRoutes = require("./src/routes/contentRoutes");
const communityRoutes = require("./src/routes/communityRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const documentRoutes = require("./src/routes/documentRoutes");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
  }),
);
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ status: "SettleCAN API running", version: "1.0.0" });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/info", infoRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/documents", documentRoutes);

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: "Route not found." }));

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SettleCAN API running on http://localhost:${PORT}`);
});
