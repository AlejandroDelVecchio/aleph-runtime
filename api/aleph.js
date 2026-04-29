export default async function handler(req, res) {
  try {
    const prompt = `
Produce una visión simultánea compuesta por imágenes breves.
Enumera elementos concretos (íntimos, urbanos, históricos y cósmicos).
Sin explicación, solo enumeración.
    `;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // 🔍 Log completo (para debug en Vercel)
    console.log("Respuesta completa:", JSON.stringify(data, null, 2));

    // ❌ Si hay error de la API
    if (data.error) {
      return res.status(500).json({
        texto: "❌ Error de Gemini: " + data.error.message
      });
    }

    // ✅ Extraer texto de forma segura
    const texto =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No se generó texto";

    res.status(200).json({ texto });

  } catch (error) {
    console.error("Error general:", error);

    res.status(500).json({
      texto: "❌ Error en el servidor",
      error: error.message
    });
  }
}
