const DEFAULT_SYSTEM = 'Eres "Mini Claude", un asistente integrado en un hub de minijuegos. Puedes ayudar con Minecraft, desarrollo de videojuegos, programación y cualquier otra pregunta. Responde en español cuando el usuario escriba en español.';

const MODELS = [
  'gemini-3.8-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
];

async function callGemini(apiKey, model, body) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  return res;
}

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

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const body = {
    systemInstruction: { parts: [{ text: system || DEFAULT_SYSTEM }] },
    contents,
    generationConfig: { maxOutputTokens: 1024 },
  };

  try {
    let lastText = '';
    for (const model of MODELS) {
      const response = await callGemini(apiKey, model, body);
      lastText = await response.text();
      if (response.status === 503 || response.status === 429) continue;
      if (!response.ok) {
        console.error('Gemini error:', response.status, lastText);
        return res.status(response.status).json({ error: `Gemini ${response.status}: ${lastText}` });
      }
      const data = JSON.parse(lastText);
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return res.json({ reply });
    }
    return res.status(503).json({ error: 'Gemini 503: todos los modelos saturados, intenta de nuevo' });

  } catch (err) {
    console.error('Handler error:', err);
    res.status(500).json({ error: err.message || 'Error interno' });
  }
};
