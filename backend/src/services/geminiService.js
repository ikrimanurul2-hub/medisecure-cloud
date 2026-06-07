const axios = require("axios");

const extractJsonFromText = (text) => {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    return null;
  }
};

const analyzeHealthDataWithGemini = async (healthRecord) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey || apiKey === "your-gemini-api-key") {
    throw new Error("Gemini API key is not configured.");
  }

  const prompt = `
Kamu adalah AI Health Assistant untuk aplikasi MediSecure Cloud.

Tugas kamu:
1. Analisis data kesehatan pengguna secara umum.
2. Tentukan tingkat risiko: Rendah, Sedang, atau Tinggi.
3. Berikan rekomendasi umum yang aman.
4. Jangan memberikan diagnosis medis final.
5. Tambahkan peringatan agar pengguna berkonsultasi dengan tenaga kesehatan jika gejala berat atau berlanjut.

Data kesehatan pengguna:
- Tekanan darah: ${healthRecord.blood_pressure || "Tidak diisi"}
- Gula darah: ${healthRecord.blood_sugar || "Tidak diisi"}
- Berat badan: ${healthRecord.weight || "Tidak diisi"}
- Tinggi badan: ${healthRecord.height || "Tidak diisi"}
- Suhu tubuh: ${healthRecord.body_temperature || "Tidak diisi"}
- Gejala: ${healthRecord.symptoms || "Tidak diisi"}
- Catatan tambahan: ${healthRecord.notes || "Tidak diisi"}

Kembalikan jawaban hanya dalam format JSON valid seperti ini:
{
  "risk_level": "Rendah/Sedang/Tinggi",
  "analysis_result": "ringkasan analisis kesehatan secara umum",
  "recommendation": "rekomendasi umum dan aman untuk pengguna"
}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await axios.post(
    url,
    {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500,
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );

  const rawText =
    response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const parsed = extractJsonFromText(rawText);

  if (!parsed) {
    return {
      risk_level: "Sedang",
      analysis_result: rawText || "AI berhasil merespons, tetapi format output tidak sesuai JSON.",
      recommendation:
        "Gunakan hasil ini sebagai informasi awal dan konsultasikan dengan tenaga kesehatan apabila gejala berlanjut.",
    };
  }

  const allowedRiskLevels = ["Rendah", "Sedang", "Tinggi"];

  return {
    risk_level: allowedRiskLevels.includes(parsed.risk_level)
      ? parsed.risk_level
      : "Sedang",
    analysis_result:
      parsed.analysis_result ||
      "Analisis awal berhasil dibuat berdasarkan data kesehatan pengguna.",
    recommendation:
      parsed.recommendation ||
      "Konsultasikan dengan tenaga kesehatan apabila gejala berlanjut atau memburuk.",
  };
};

module.exports = {
  analyzeHealthDataWithGemini,
};