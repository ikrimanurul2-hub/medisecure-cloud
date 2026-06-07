const express = require("express");
const { body } = require("express-validator");

const {
  createHealthRecord,
  getMyHealthRecords,
  getAllHealthRecords,
} = require("../controllers/healthRecordController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  [
    body("blood_pressure")
      .optional()
      .trim()
      .matches(/^\d{2,3}\/\d{2,3}$/)
      .withMessage("Blood pressure format must be like 120/80."),

    body("blood_sugar")
      .optional()
      .isFloat({ min: 0, max: 500 })
      .withMessage("Blood sugar must be a number between 0 and 500."),

    body("weight")
      .optional()
      .isFloat({ min: 1, max: 500 })
      .withMessage("Weight must be a number between 1 and 500."),

    body("height")
      .optional()
      .isFloat({ min: 30, max: 250 })
      .withMessage("Height must be a number between 30 and 250."),

    body("body_temperature")
      .optional()
      .isFloat({ min: 30, max: 45 })
      .withMessage("Body temperature must be a number between 30 and 45."),

    body("symptoms")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Symptoms must be less than 1000 characters."),

    body("notes")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Notes must be less than 1000 characters."),
  ],
  createHealthRecord
);

router.get(
  "/me",
  authenticateToken,
  getMyHealthRecords
);

router.get(
  "/all",
  authenticateToken,
  authorizeRoles("admin", "doctor"),
  getAllHealthRecords
);

module.exports = router;