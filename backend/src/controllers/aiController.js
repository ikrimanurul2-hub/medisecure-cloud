const pool = require("../config/db");
const { analyzeHealthDataWithGemini } = require("../services/geminiService");
const {
  createActivityLog,
  createSecurityAlert,
} = require("../utils/auditLogger");

const analyzeHealthRecord = async (req, res) => {
  try {
    const healthRecordId = req.params.healthRecordId;

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
        recorded_at
      FROM health_records
      WHERE id = ?
      LIMIT 1`,
      [healthRecordId]
    );

    if (records.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Health record not found.",
      });
    }

    const healthRecord = records[0];

    const isOwner = healthRecord.user_id === req.user.id;
    const isAdminOrDoctor =
      req.user.role_name === "admin" || req.user.role_name === "doctor";

    if (!isOwner && !isAdminOrDoctor) {
      await createSecurityAlert(req, {
        userId: req.user.id,
        alertType: "UNAUTHORIZED_AI_ANALYSIS_ACCESS",
        severity: "High",
        description:
          "User attempted to analyze health record that does not belong to them.",
      });

      return res.status(403).json({
        status: "error",
        message: "Forbidden. You cannot analyze this health record.",
      });
    }

    const aiResult = await analyzeHealthDataWithGemini(healthRecord);

    const inputSummary = `
Tekanan darah: ${healthRecord.blood_pressure || "-"}
Gula darah: ${healthRecord.blood_sugar || "-"}
Berat badan: ${healthRecord.weight || "-"}
Tinggi badan: ${healthRecord.height || "-"}
Suhu tubuh: ${healthRecord.body_temperature || "-"}
Gejala: ${healthRecord.symptoms || "-"}
Catatan: ${healthRecord.notes || "-"}
`.trim();

    const [insertResult] = await pool.query(
      `INSERT INTO ai_analysis_results
      (user_id, health_record_id, input_summary, analysis_result, risk_level, recommendation, ai_provider)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        healthRecord.user_id,
        healthRecord.id,
        inputSummary,
        aiResult.analysis_result,
        aiResult.risk_level,
        aiResult.recommendation,
        "Gemini API",
      ]
    );

    await createActivityLog(req, {
      userId: req.user.id,
      activity: "AI_ANALYSIS_REQUEST",
      description: `User requested AI analysis for health_record_id: ${healthRecord.id}`,
      statusCode: 201,
    });

    return res.status(201).json({
      status: "success",
      message: "AI analysis generated successfully.",
      data: {
        id: insertResult.insertId,
        health_record_id: healthRecord.id,
        risk_level: aiResult.risk_level,
        analysis_result: aiResult.analysis_result,
        recommendation: aiResult.recommendation,
        ai_provider: "Gemini API",
      },
    });
  } catch (error) {
    console.error("AI analysis error:", error.message);

    await createSecurityAlert(req, {
      userId: req.user?.id || null,
      alertType: "AI_ANALYSIS_ERROR",
      severity: "Medium",
      description: `AI analysis failed: ${error.message}`,
    });

    return res.status(500).json({
      status: "error",
      message: "Internal server error during AI analysis.",
      error: error.message,
    });
  }
};

const getMyAiResults = async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT 
        ai_analysis_results.id,
        ai_analysis_results.health_record_id,
        ai_analysis_results.input_summary,
        ai_analysis_results.analysis_result,
        ai_analysis_results.risk_level,
        ai_analysis_results.recommendation,
        ai_analysis_results.ai_provider,
        ai_analysis_results.created_at
      FROM ai_analysis_results
      WHERE ai_analysis_results.user_id = ?
      ORDER BY ai_analysis_results.created_at DESC`,
      [req.user.id]
    );

    return res.json({
      status: "success",
      message: "AI analysis results retrieved successfully.",
      data: results,
    });
  } catch (error) {
    console.error("Get AI results error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Internal server error during get AI results.",
    });
  }
};

module.exports = {
  analyzeHealthRecord,
  getMyAiResults,
};