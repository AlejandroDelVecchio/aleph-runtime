import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // Solo permitimos peticiones POST por seguridad
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        // Vercel leerá tu clave secreta de una variable de entorno llamada GEMINI_API_KEY
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // En el entorno de Node.js del servidor, usamos el modelo estándar
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "Escribe un poema en prosa muy breve sobre el paso del tiempo y la tranquilidad.";
        
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Devolvemos el texto a nuestro frontend
        res.status(200).json({ poema: text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un error al generar el texto.' });
    }
}
