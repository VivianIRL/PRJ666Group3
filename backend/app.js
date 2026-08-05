

const express = require("express");
const cors    = require("cors");
const pinoHttp = require("pino-http");
const logger = require("./src/logger");
const authRoutes         = require("./src/routes/authRoutes");
const profileRoutes      = require("./src/routes/profileRoutes");
const taskRoutes         = require("./src/routes/taskRoutes");
const infoRoutes         = require("./src/routes/infoRoutes");
const contentRoutes      = require("./src/routes/contentRoutes");
const communityRoutes    = require("./src/routes/communityRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const policyFeedRoutes   = require("./src/routes/policyFeedRoutes");

// Task Hierarchy & Notification System — new, additive, lives at /api/v2/*
// so the existing /api/tasks and /api/notifications consumers (the current
// TasksDashboard/TaskManager/Checklist pages) are untouched. See
// docs/TASK_NOTIFICATION_SYSTEM_DESIGN.md.
const taskNodeRoutes         = require("./src/routes/taskNodeRoutes");
const templateRoutes         = require("./src/routes/templateRoutes");
const taskNotificationRoutes = require("./src/routes/taskNotificationRoutes");
const schedulerRoutes        = require("./src/routes/schedulerRoutes");

const app = express();

// Logging Middleware 
// This automatically captures and logs every single incoming HTTP request/response
app.use(pinoHttp({logger}));

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "http://localhost:3000", 
    "https://prj666group3-1064803374828.us-central1.run.app"
  ],
  credentials: true,
}));

app.use(express.json());
logger.debug("Core middleware layers (CORS, JSON Parser) initialized.");


// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
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
app.use("/api/policy-updates", policyFeedRoutes);

app.use("/api/v2/tasks",         taskNodeRoutes);
app.use("/api/v2",               templateRoutes); // /api/v2/templates, /api/v2/users/:id/generate-tasks
app.use("/api/v2/notifications", taskNotificationRoutes);
app.use("/api/v2/scheduler",     schedulerRoutes);

logger.info("Application gateway routes bound succesfully.");

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    logger.warn(`Routing miss: ${req.method} ${req.url}`);
    res.status(404).json({ message: "Route not found." });
});


module.exports = app;