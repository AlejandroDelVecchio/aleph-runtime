import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // Solo permitimos peticiones POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error("No se encontró la API Key en las variables de entorno de Vercel.");
        }
        
        // 1. Buscamos el modelo dinámicamente (Igual que hicimos en el frontend)
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const modelosResponse = await fetch(url);
        const modelosData = await modelosResponse.json();

        if (!modelosData.models) {
            throw new Error("No se pudo obtener la lista de modelos desde Google.");
        }

        const modeloValido = modelosData.models.find(m => 
            m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")
        );

        if (!modeloValido) {
            throw new Error("La API Key no tiene acceso a modelos de generación de texto.");
        }

        const nombreModelo = modeloValido.name.replace('models/', '');

        // 2. Inicializamos la IA con el modelo correcto que acabamos de encontrar
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: nombreModelo });

        const prompt = "Escribe un poema en prosa muy breve sobre el paso del tiempo y la tranquilidad.";
        
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // 3. Devolvemos el poema con un código de éxito (200)
        res.status(200).json({ poema: text });

    } catch (error) {
        // 4. Si algo falla, ahora enviamos el mensaje de error EXACTO para saber qué pasa
        console.error("Fallo detectado:", error.message);
        res.status(500).json({ error: error.message });
    }
}
