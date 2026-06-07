const jwt = require("jsonwebtoken");
const { createSecurityAlert } = require("../utils/auditLogger");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      await createSecurityAlert(req, {
        alertType: "TOKEN_MISSING",
        severity: "Medium",
        description: "Request rejected because authorization token is missing.",
      });

      return res.status(401).json({
        status: "error",
        message: "Access denied. Token is required.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      await createSecurityAlert(req, {
        alertType: "INVALID_TOKEN_FORMAT",
        severity: "Medium",
        description: "Request rejected because token format is invalid.",
      });

      return res.status(401).json({
        status: "error",
        message: "Access denied. Invalid token format.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    await createSecurityAlert(req, {
      alertType: "INVALID_OR_EXPIRED_TOKEN",
      severity: "Medium",
      description: "Request rejected because token is invalid or expired.",
    });

    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token.",
    });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role_name)) {
      await createSecurityAlert(req, {
        userId: req.user?.id || null,
        alertType: "UNAUTHORIZED_ACCESS",
        severity: "High",
        description: `User with role '${req.user?.role_name || "unknown"}' attempted to access restricted endpoint. Allowed roles: ${allowedRoles.join(", ")}.`,
      });

      return res.status(403).json({
        status: "error",
        message: "Forbidden. You do not have permission to access this resource.",
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};