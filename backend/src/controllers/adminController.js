const pool = require("../config/db");
const { createActivityLog } = require("../utils/auditLogger");

const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT 
        users.id,
        users.name,
        users.email,
        users.phone,
        users.status,
        users.last_login_at,
        users.created_at,
        roles.role_name
      FROM users
      JOIN roles ON users.role_id = roles.id
      ORDER BY users.created_at DESC`
    );

    await createActivityLog(req, {
      userId: req.user.id,
      activity: "ADMIN_VIEW_USERS",
      description: "Admin viewed user list.",
      statusCode: 200,
    });

    return res.json({
      status: "success",
      message: "Users retrieved successfully.",
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Internal server error during get users.",
    });
  }
};

const getActivityLogs = async (req, res) => {
  try {
    const [logs] = await pool.query(
      `SELECT 
        activity_logs.id,
        activity_logs.user_id,
        users.name,
        users.email,
        activity_logs.activity,
        activity_logs.description,
        activity_logs.ip_address,
        activity_logs.endpoint,
        activity_logs.method,
        activity_logs.status_code,
        activity_logs.created_at
      FROM activity_logs
      LEFT JOIN users ON activity_logs.user_id = users.id
      ORDER BY activity_logs.created_at DESC
      LIMIT 100`
    );

    await createActivityLog(req, {
      userId: req.user.id,
      activity: "ADMIN_VIEW_ACTIVITY_LOGS",
      description: "Admin viewed activity logs.",
      statusCode: 200,
    });

    return res.json({
      status: "success",
      message: "Activity logs retrieved successfully.",
      data: logs,
    });
  } catch (error) {
    console.error("Get activity logs error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Internal server error during get activity logs.",
    });
  }
};

const getSecurityAlerts = async (req, res) => {
  try {
    const [alerts] = await pool.query(
      `SELECT 
        security_alerts.id,
        security_alerts.user_id,
        users.name,
        users.email,
        security_alerts.alert_type,
        security_alerts.severity,
        security_alerts.description,
        security_alerts.source_ip,
        security_alerts.endpoint,
        security_alerts.status,
        security_alerts.created_at,
        security_alerts.resolved_at
      FROM security_alerts
      LEFT JOIN users ON security_alerts.user_id = users.id
      ORDER BY security_alerts.created_at DESC
      LIMIT 100`
    );

    await createActivityLog(req, {
      userId: req.user.id,
      activity: "ADMIN_VIEW_SECURITY_ALERTS",
      description: "Admin viewed security alerts.",
      statusCode: 200,
    });

    return res.json({
      status: "success",
      message: "Security alerts retrieved successfully.",
      data: alerts,
    });
  } catch (error) {
    console.error("Get security alerts error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Internal server error during get security alerts.",
    });
  }
};

module.exports = {
  getUsers,
  getActivityLogs,
  getSecurityAlerts,
};