const DEFAULT_SYSTEM = 'Eres "Mini Claude", un asistente integrado en un hub de minijuegos. Puedes ayudar con Minecraft, desarrollo de videojuegos, programación y cualquier otra pregunta. Responde en español cuando el usuario escriba en español.';

const MODEL = 'gemini-3.8-flash';
const MAX_RETRIES = 4;
const sleep = ms => new Promise(r => setTimeout(r, ms));

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

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: system || DEFAULT_SYSTEM }] },
    contents,
    generationConfig: { maxOutputTokens: 8192, thinkingConfig: { thinkingLevel: 'low' } },
  });

  try {
    let lastText = '';
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (attempt > 0) await sleep(1500 * attempt);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal: AbortSignal.timeout(45000) }
      );

      lastText = await response.text();

      if (response.status === 503 || response.status === 429) continue;

      if (!response.ok) {
        console.error('Gemini error:', response.status, lastText);
        return res.status(response.status).json({ error: `Gemini ${response.status}: ${lastText}` });
      }

      const data = JSON.parse(lastText);
      const parts = data.candidates?.[0]?.content?.parts || [];
      const reply = parts.filter(p => !p.thought && p.text).map(p => p.text).join('');
      return res.json({ reply });
    }

    return res.status(503).json({ error: 'Gemini saturado, intenta de nuevo en unos segundos.' });

  } catch (err) {
    console.error('Handler error:', err);
    if (err.name === 'TimeoutError') return res.status(504).json({ error: 'Gemini tardó demasiado, intenta de nuevo.' });
    res.status(500).json({ error: err.message || 'Error interno' });
  }
};
