const path = require("path");
const multer = require("multer");
const { createSecurityAlert } = require("../utils/auditLogger");

const maxFileSizeMb = parseInt(process.env.MAX_FILE_SIZE_MB || "5", 10);

const allowedMimeTypes = (process.env.ALLOWED_FILE_TYPES ||
  "application/pdf,image/png,image/jpeg")
  .split(",")
  .map((item) => item.trim().toLowerCase());

const allowedExtensions = (process.env.ALLOWED_FILE_EXTENSIONS ||
  "pdf,png,jpg,jpeg")
  .split(",")
  .map((item) => item.trim().toLowerCase());

const fileFilter = async (req, file, callback) => {
  const fileExtension = path
    .extname(file.originalname)
    .replace(".", "")
    .toLowerCase();

  const mimeType = file.mimetype.toLowerCase();

  const isMimeAllowed = allowedMimeTypes.includes(mimeType);
  const isExtensionAllowed = allowedExtensions.includes(fileExtension);

  if (!isMimeAllowed || !isExtensionAllowed) {
    await createSecurityAlert(req, {
      userId: req.user?.id || null,
      alertType: "INVALID_FILE_UPLOAD",
      severity: "High",
      description: `Rejected file upload. Filename: ${file.originalname}, MIME type: ${file.mimetype}, extension: ${fileExtension}`,
    });

    return callback(
      new Error("Invalid file type. Only PDF, PNG, JPG, and JPEG files are allowed.")
    );
  }

  callback(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSizeMb * 1024 * 1024,
  },
  fileFilter,
});

const uploadDocumentFile = (req, res, next) => {
  upload.single("document")(req, res, async (error) => {
    if (error instanceof multer.MulterError) {
      await createSecurityAlert(req, {
        userId: req.user?.id || null,
        alertType: "FILE_UPLOAD_ERROR",
        severity: "Medium",
        description: `Multer upload error: ${error.message}`,
      });

      return res.status(400).json({
        status: "error",
        message: "File upload failed.",
        error: error.message,
      });
    }

    if (error) {
      return res.status(400).json({
        status: "error",
        message: "Invalid upload request.",
        error: error.message,
      });
    }

    next();
  });
};

module.exports = {
  uploadDocumentFile,
};