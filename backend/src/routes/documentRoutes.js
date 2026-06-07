const express = require("express");

const {
  uploadMedicalDocument,
  getMyDocuments,
} = require("../controllers/documentController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  uploadDocumentFile,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/upload",
  authenticateToken,
  uploadDocumentFile,
  uploadMedicalDocument
);

router.get(
  "/me",
  authenticateToken,
  getMyDocuments
);

module.exports = router;