const express = require("express");
const { body } = require("express-validator");

const {
  register,
  login,
  me,
} = require("../controllers/authController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

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
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Email format is invalid."),

    body("password")
      .notEmpty()
      .withMessage("Password is required."),
  ],
  login
);

router.get("/me", authenticateToken, me);

module.exports = router;