import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("No se encontró la API Key en las variables de entorno.");
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const modelosResponse = await fetch(url);
        const modelosData = await modelosResponse.json();

        if (!modelosData.models) throw new Error("No se pudo obtener la lista de modelos.");

        const modeloValido = modelosData.models.find(m => 
            m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")
        );

        if (!modeloValido) throw new Error("La API Key no tiene acceso a modelos de texto.");

        const nombreModelo = modeloValido.name.replace('models/', '');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: nombreModelo });
        
        // --- PROMPT DE LOTES (5 VISIONES A LA VEZ) ---
        const prompt = `Actúa como Jorge Luis Borges describiendo el Aleph. 
        Genera 5 visiones distintas. Cada visión debe tener ESTRICTAMENTE entre 8 y 10 palabras. 
        Todas las visiones DEBEN comenzar obligatoriamente con la palabra "Vi". 
        Extrae las imágenes de sus cuentos y poemas.
        Devuelve ÚNICAMENTE las 5 frases, separadas por punto seguido. Sin comillas, sin números de lista y sin texto previo.`;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        // Convertimos el texto (separado por saltos de línea) en un arreglo de JavaScript
        const visionesArray = text.split('\n').filter(linea => linea.trim() !== '');

        // Devolvemos la lista completa
        res.status(200).json({ visiones: visionesArray });
        
    } catch (error) {
        console.error("Fallo detectado:", error.message);
        res.status(500).json({ error: error.message });
    }
}
