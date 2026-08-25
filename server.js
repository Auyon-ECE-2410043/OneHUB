require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const registrationRoutes = require("./routes/registrations");
const feeRoutes = require("./routes/fees");
const markRoutes = require("./routes/marks");
const attendanceRoutes = require("./routes/attendance");
const noticeRoutes = require("./routes/notices");
const facultyRoutes = require("./routes/faculty");
const hallRoutes = require("./routes/hall");
const studentRoutes = require("./routes/students");
const routineRoutes = require("./routes/routine");
const notificationRoutes = require("./routes/notifications");
const clearanceRoutes = require("./routes/clearance");
const medicalRoutes = require("./routes/medical");
const calendarRoutes = require("./routes/calendar");

const { initReminderScheduler } = require("./services/reminderScheduler");
const logger = require("./utils/logger");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(cors());
app.use(express.json());

// Apply global rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

// Specific stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Temporarily increased to 50 for testing
  message: "Too many authentication attempts, please try again later",
});
app.use("/api/auth", authLimiter);

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "RUET OneHub API",
    version: "2.1.0",
    ordinance: "RUET Scale 4.0 Standard",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/marks", markRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/hall", hallRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/routine", routineRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/clearance", clearanceRoutes);
app.use("/api/medical", medicalRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/cron", cronRoutes);
app.use("/api/settings", require("./routes/settings"));

// Global 404 handler
app.use((req, res) => {
  logger.warn(`Endpoint ${req.originalUrl} not found`);
  res.status(404).json({ error: `Endpoint ${req.originalUrl} not found` });
});

// Centralized error handler
app.use((err, req, res, next) => {
  logger.error(`Unhandled server error: ${err.message}`, { stack: err.stack });
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info("Connected to MongoDB");
    // Start automated class reminder scheduler
    initReminderScheduler();
    app.listen(PORT, () => logger.info(`RUET OneHub Server running on port ${PORT}`));
  })
  .catch((err) => {
    logger.error("MongoDB connection error", { error: err.message });
    process.exit(1);
  });