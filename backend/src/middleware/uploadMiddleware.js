const multer = require("multer");

const maxFileSizeMb = parseInt(process.env.MAX_FILE_SIZE_MB || "5", 10);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSizeMb * 1024 * 1024,
  },
});

const uploadDocumentFile = (req, res, next) => {
  upload.single("document")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
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