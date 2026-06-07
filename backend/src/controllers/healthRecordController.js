const { validationResult } = require("express-validator");
const pool = require("../config/db");
const {
  createActivityLog,
  createSecurityAlert,
} = require("../utils/auditLogger");

const createHealthRecord = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      await createSecurityAlert(req, {
        userId: req.user?.id || null,
        alertType: "INVALID_HEALTH_RECORD_INPUT",
        severity: "Medium",
        description: "Health record request rejected because input validation failed.",
      });

      return res.status(400).json({
        status: "error",
        message: "Validation failed.",
        errors: errors.array(),
      });
    }

    const {
      blood_pressure,
      blood_sugar,
      weight,
      height,
      body_temperature,
      symptoms,
      notes,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO health_records
      (user_id, blood_pressure, blood_sugar, weight, height, body_temperature, symptoms, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        blood_pressure || null,
        blood_sugar || null,
        weight || null,
        height || null,
        body_temperature || null,
        symptoms || null,
        notes || null,
      ]
    );

    await createActivityLog(req, {
      userId: req.user.id,
      activity: "CREATE_HEALTH_RECORD",
      description: "User created a new health record.",
      statusCode: 201,
    });

    return res.status(201).json({
      status: "success",
      message: "Health record created successfully.",
      data: {
        id: result.insertId,
        user_id: req.user.id,
        blood_pressure,
        blood_sugar,
        weight,
        height,
        body_temperature,
        symptoms,
        notes,
      },
    });
  } catch (error) {
    console.error("Create health record error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Internal server error during create health record.",
    });
  }
};

const getMyHealthRecords = async (req, res) => {
  try {
    const [records] = await pool.query(
      `SELECT 
        id,
        user_id,
        blood_pressure,
        blood_sugar,
        weight,
        height,
        body_temperature,
        symptoms,
        notes,
        recorded_at,
        created_at,
        updated_at
      FROM health_records
      WHERE user_id = ?
      ORDER BY recorded_at DESC`,
      [req.user.id]
    );

    await createActivityLog(req, {
      userId: req.user.id,
      activity: "VIEW_HEALTH_RECORDS",
      description: "User viewed personal health records.",
      statusCode: 200,
    });

    return res.json({
      status: "success",
      message: "Health records retrieved successfully.",
      data: records,
    });
  } catch (error) {
    console.error("Get health records error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Internal server error during get health records.",
    });
  }
};

const getAllHealthRecords = async (req, res) => {
  try {
    const [records] = await pool.query(
      `SELECT 
        health_records.id,
        health_records.user_id,
        users.name,
        users.email,
        health_records.blood_pressure,
        health_records.blood_sugar,
        health_records.weight,
        health_records.height,
        health_records.body_temperature,
        health_records.symptoms,
        health_records.notes,
        health_records.recorded_at
      FROM health_records
      JOIN users ON health_records.user_id = users.id
      ORDER BY health_records.recorded_at DESC`
    );

    await createActivityLog(req, {
      userId: req.user.id,
      activity: "ADMIN_VIEW_ALL_HEALTH_RECORDS",
      description: "Admin or doctor viewed all health records.",
      statusCode: 200,
    });

    return res.json({
      status: "success",
      message: "All health records retrieved successfully.",
      data: records,
    });
  } catch (error) {
    console.error("Get all health records error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Internal server error during get all health records.",
    });
  }
};

module.exports = {
  createHealthRecord,
  getMyHealthRecords,
  getAllHealthRecords,
};