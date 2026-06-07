const express = require("express");
const { param } = require("express-validator");

const {
  analyzeHealthRecord,
  getMyAiResults,
} = require("../controllers/aiController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/analyze/:healthRecordId",
  authenticateToken,
  [
    param("healthRecordId")
      .isInt({ min: 1 })
      .withMessage("Health record ID must be a positive integer."),
  ],
  analyzeHealthRecord
);

router.get(
  "/results/me",
  authenticateToken,
  getMyAiResults
);

module.exports = router;