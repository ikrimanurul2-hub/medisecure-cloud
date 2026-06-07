const pool = require("../config/db");

const getClientIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket?.remoteAddress ||
    req.ip ||
    "unknown"
  );
};

const createActivityLog = async (req, {
  userId = null,
  activity,
  description,
  statusCode = 200,
}) => {
  try {
    await pool.query(
      `INSERT INTO activity_logs 
      (user_id, activity, description, ip_address, user_agent, endpoint, method, status_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        activity,
        description,
        getClientIp(req),
        req.get("user-agent") || "unknown",
        req.originalUrl,
        req.method,
        statusCode,
      ]
    );
  } catch (error) {
    console.error("Failed to create activity log:", error.message);
  }
};

const createSecurityAlert = async (req, {
  userId = null,
  alertType,
  severity = "Medium",
  description,
  status = "open",
}) => {
  try {
    await pool.query(
      `INSERT INTO security_alerts
      (user_id, alert_type, severity, description, source_ip, endpoint, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        alertType,
        severity,
        description,
        getClientIp(req),
        req.originalUrl,
        status,
      ]
    );
  } catch (error) {
    console.error("Failed to create security alert:", error.message);
  }
};

module.exports = {
  createActivityLog,
  createSecurityAlert,
};