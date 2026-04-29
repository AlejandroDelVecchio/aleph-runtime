export default async function handler(req, res) {
  try {
    const prompt = `
Produce una enumeración de visiones simultáneas, breve y concreta.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    console.log("Respuesta completa:", JSON.stringify(data, null, 2));

    const texto =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No se generó texto";

    res.status(200).json({ texto });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ texto: "Error en el servidor" });
  }
}
