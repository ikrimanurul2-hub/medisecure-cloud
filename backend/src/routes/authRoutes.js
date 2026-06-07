const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { createSecurityAlert } = require("../utils/auditLogger");

const { register, login, me } = require("../controllers/authController");

const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MINUTES || 1) * 60 * 1000,
  limit: Number(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS || 3),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many login attempts. Please try again later.",
  },
  handler: async (req, res) => {
    console.log("LOGIN RATE LIMIT TRIGGERED");

    await createSecurityAlert(req, {
      alertType: "LOGIN_RATE_LIMIT_EXCEEDED",
      severity: "High",
      description:
        "Login request rejected because too many login attempts were detected.",
    });

    return res.status(429).json({
      status: "error",
      message: "Too many login attempts. Please try again later.",
    });
  },
});

router.post(
  "/register",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required.")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters."),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Email format is invalid."),

    body("password")
      .notEmpty()
      .withMessage("Password is required.")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters."),

    body("phone")
      .optional()
      .trim()
      .isLength({ min: 8 })
      .withMessage("Phone number is too short."),

    body("role_id")
      .optional()
      .isInt({ min: 1, max: 3 })
      .withMessage("Role ID must be 1, 2, or 3."),
  ],
  register
);

router.post(
  "/login",
  loginLimiter,
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Email format is invalid."),

    body("password").notEmpty().withMessage("Password is required."),
  ],
  login
);

router.get("/me", authenticateToken, me);

module.exports = router;