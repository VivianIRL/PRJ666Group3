

const express = require("express");
const cors    = require("cors");
const pinoHttp = require("pino-http");
const logger = require("./logger.js");
const authRoutes         = require("./src/routes/authRoutes");
const profileRoutes      = require("./src/routes/profileRoutes");
const taskRoutes         = require("./src/routes/taskRoutes");
const infoRoutes         = require("./src/routes/infoRoutes");
const contentRoutes      = require("./src/routes/contentRoutes");
const communityRoutes    = require("./src/routes/communityRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");

const app = express();

// Logging Middleware 
// This automatically captures and logs every single incoming HTTP request/response
app.use(pinoHttp({logger}));

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));

app.use(express.json());
logger.debug("Core middleware layers (CORS, JSON Parser) intialized.");


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
logger.info("Application gateway routes bound succesfully.");

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    logger.warn(`Routing miss: ${req.method} ${req.url}`);
    res.status(404).json({ message: "Route not found." });
});


module.exports = app;