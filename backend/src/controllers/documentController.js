const path = require("path");

const pool = require("../config/db");
const {
  createActivityLog,
  createSecurityAlert,
} = require("../utils/auditLogger");

const {
  uploadFileToSupabase,
  createSignedUrl,
} = require("../services/supabaseStorageService");

const getAllowedFileTypes = () => {
  return (process.env.ALLOWED_FILE_TYPES || "application/pdf,image/png,image/jpeg")
    .split(",")
    .map((item) => item.trim());
};

const getAllowedExtensions = () => {
  return (process.env.ALLOWED_FILE_EXTENSIONS || "pdf,png,jpg,jpeg")
    .split(",")
    .map((item) => item.trim().toLowerCase());
};

const sanitizeFileName = (fileName) => {
  return fileName
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9.\-_]/g, "")
    .toLowerCase();
};

const uploadMedicalDocument = async (req, res) => {
  try {
    if (!req.file) {
      await createSecurityAlert(req, {
        userId: req.user?.id || null,
        alertType: "FILE_UPLOAD_EMPTY",
        severity: "Medium",
        description: "Upload request rejected because no file was provided.",
      });

      return res.status(400).json({
        status: "error",
        message: "No file uploaded.",
      });
    }

    const file = req.file;
    const allowedFileTypes = getAllowedFileTypes();
    const allowedExtensions = getAllowedExtensions();

    const originalFileName = file.originalname;
    const safeOriginalName = sanitizeFileName(originalFileName);
    const extension = path.extname(originalFileName).replace(".", "").toLowerCase();

    const isMimeAllowed = allowedFileTypes.includes(file.mimetype);
    const isExtensionAllowed = allowedExtensions.includes(extension);

    if (!isMimeAllowed || !isExtensionAllowed) {
      await createSecurityAlert(req, {
        userId: req.user?.id || null,
        alertType: "SUSPICIOUS_FILE_UPLOAD",
        severity: "Critical",
        description: `Rejected file upload. File type: ${file.mimetype}, extension: ${extension}`,
      });

      return res.status(400).json({
        status: "error",
        message: "File type is not allowed. Only PDF, PNG, JPG, and JPEG are allowed.",
      });
    }

    const uploadedFile = await uploadFileToSupabase(file, req.user.id);

    const storageProvider = process.env.STORAGE_PROVIDER || "Supabase Storage";
    const storagePath = uploadedFile.storagePath;
    const storedFileName = uploadedFile.storedFileName;

    const [result] = await pool.query(
      `INSERT INTO medical_documents
      (user_id, original_file_name, stored_file_name, file_type, file_size, storage_provider, storage_path, upload_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'uploaded')`,
      [
        req.user.id,
        safeOriginalName,
        storedFileName,
        file.mimetype,
        file.size,
        storageProvider,
        storagePath,
      ]
    );

    await createActivityLog(req, {
      userId: req.user.id,
      activity: "UPLOAD_DOCUMENT",
      description: `User uploaded medical document to Supabase Storage: ${originalFileName}`,
      statusCode: 201,
    });

    return res.status(201).json({
      status: "success",
      message: "Medical document uploaded successfully to Supabase Storage.",
      data: {
        id: result.insertId,
        original_file_name: safeOriginalName,
        stored_file_name: storedFileName,
        file_type: file.mimetype,
        file_size: file.size,
        storage_provider: storageProvider,
        storage_path: storagePath,
      },
    });
  } catch (error) {
    console.error("Upload document error:", error.message);

    await createSecurityAlert(req, {
      userId: req.user?.id || null,
      alertType: "DOCUMENT_UPLOAD_ERROR",
      severity: "High",
      description: `Document upload failed: ${error.message}`,
    });

    return res.status(500).json({
      status: "error",
      message: "Internal server error during document upload.",
      error: error.message,
    });
  }
};

const getMyDocuments = async (req, res) => {
  try {
    const [documents] = await pool.query(
      `SELECT
        id,
        original_file_name,
        stored_file_name,
        file_type,
        file_size,
        storage_provider,
        storage_path,
        upload_status,
        uploaded_at,
        created_at
      FROM medical_documents
      WHERE user_id = ?
      ORDER BY uploaded_at DESC`,
      [req.user.id]
    );

    const documentsWithSignedUrl = await Promise.all(
      documents.map(async (document) => {
        const signedUrl = await createSignedUrl(document.storage_path);

        return {
          ...document,
          signed_url: signedUrl,
        };
      })
    );

    await createActivityLog(req, {
      userId: req.user.id,
      activity: "VIEW_MEDICAL_DOCUMENTS",
      description: "User viewed personal medical documents.",
      statusCode: 200,
    });

    return res.json({
      status: "success",
      message: "Medical documents retrieved successfully.",
      data: documentsWithSignedUrl,
    });
  } catch (error) {
    console.error("Get documents error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Internal server error during get documents.",
      error: error.message,
    });
  }
};

module.exports = {
  uploadMedicalDocument,
  getMyDocuments,
};