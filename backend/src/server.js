const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const rateLimit = require("express-rate-limit");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const healthRecordRoutes = require("./routes/healthRecordRoutes");
const aiRoutes = require("./routes/aiRoutes");
const adminRoutes = require("./routes/adminRoutes");
const documentRoutes = require("./routes/documentRoutes");
const { createSecurityAlert } = require("./utils/auditLogger");

const app = express();

const PORT = process.env.APP_PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MINUTES || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res) => {
    await createSecurityAlert(req, {
      userId: req.user?.id || null,
      alertType: "API_RATE_LIMIT_EXCEEDED",
      severity: "Medium",
      description: "Request rejected because API rate limit was exceeded.",
    });

    return res.status(429).json({
      status: "error",
      message: "Too many requests. Please try again later.",
    });
  },
});

app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "MediSecure Cloud Backend API is running",
    environment: process.env.APP_ENV || "development",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "Backend service is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT DATABASE() AS database_name, NOW() AS server_time"
    );

    res.json({
      status: "success",
      message: "Database connection successful",
      data: rows[0],
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: error.message,
    });
  }
});

/*
  Rate limiting global untuk seluruh endpoint API.
  Endpoint / dan endpoint health check tetap tidak dibatasi agar mudah dicek.
*/
app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/health-records", healthRecordRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/documents", documentRoutes);

app.listen(PORT, () => {
  console.log(`MediSecure Cloud Backend running on http://localhost:${PORT}`);
});