const express = require("express");

const {
  getUsers,
  getActivityLogs,
  getSecurityAlerts,
} = require("../controllers/adminController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/users",
  authenticateToken,
  authorizeRoles("admin"),
  getUsers
);

router.get(
  "/logs",
  authenticateToken,
  authorizeRoles("admin"),
  getActivityLogs
);

router.get(
  "/security-alerts",
  authenticateToken,
  authorizeRoles("admin"),
  getSecurityAlerts
);

module.exports = router;