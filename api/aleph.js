export default async function handler(req, res) {
  try {
    const prompt = `
Enumera imágenes simultáneas breves, concretas y heterogéneas (íntimas, urbanas, históricas, cósmicas), sin explicación.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("Respuesta completa:", JSON.stringify(data, null, 2));

    // 👇 Manejo de error explícito
    if (data.error) {
      return res.status(500).json({
        texto: "❌ " + data.error.message
      });
    }

    const texto =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ Sin texto generado";

    res.status(200).json({ texto });

  } catch (error) {
    console.error("Error general:", error);

    res.status(500).json({
      texto: "❌ Error en servidor",
      error: error.message
    });
  }
}
