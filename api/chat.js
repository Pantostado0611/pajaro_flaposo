const DEFAULT_SYSTEM = 'Eres "Mini Claude", un asistente integrado en un hub de minijuegos. Puedes ayudar con Minecraft, desarrollo de videojuegos, programación y cualquier otra pregunta. Responde en español cuando el usuario escriba en español.';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, system } = req.body || {};

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY no configurada en Vercel' });
  }

  // Convertir formato OpenAI → Gemini (user/assistant → user/model)
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system || DEFAULT_SYSTEM }] },
          contents,
          generationConfig: { maxOutputTokens: 1024 },
        }),
      }
    );

    const text = await response.text();

    if (!response.ok) {
      console.error('Gemini error:', response.status, text);
      return res.status(response.status).json({ error: `Gemini ${response.status}: ${text}` });
    }

    const data = JSON.parse(text);
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    res.json({ reply });

  } catch (err) {
    console.error('Handler error:', err);
    res.status(500).json({ error: err.message || 'Error interno' });
  }
};
