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

        // --- EL NUEVO PROMPT BORGIANO (STACCATO) ---
        const prompt = `Actúa como Jorge Luis Borges describiendo lo que ve al asomarse al Aleph. 
        Genera una única visión que tenga ESTRICTAMENTE entre 8 y 10 palabras en total. Ni una más, ni una menos. 
        La frase DEBE comenzar obligatoriamente con la palabra "Vi". 
        Utiliza imágenes y símbolos de los cuentos de Borges. Utiliza una sintaxis impecable, enumeraciones paradójicas y adjetivos precisos pero inusuales. 
        El ritmo debe ser rápido y visual.
        Evita adjetivación redundante y metáforas obvias.
        Debes extraer las imágenes directamente de los cuentos y poemas de Borges. Por ejemplo: la rosa amarilla de Giambattista Marino, el compás, el astrolabio, los tigres transparentes, el disco de Odín, el mapa del Imperio del tamaño del Imperio, las ruinas circulares, las monedas de hierro, los hexágonos de la biblioteca, la espada de un sajón, un patio de arrabal en 1890, el rostro de Beatriz Viterbo.
        No expliques ni comentes.
        Escribe en español rioplatense neutro.
        Devuelve ÚNICAMENTE la frase de 8 a 10 palabras, sin comillas, sin puntos suspensivos y sin explicaciones previas.`;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim(); // .trim() quita espacios o saltos de línea sobrantes

        res.status(200).json({ vision: text });

    } catch (error) {
        console.error("Fallo detectado:", error.message);
        res.status(500).json({ error: error.message });
    }
}
