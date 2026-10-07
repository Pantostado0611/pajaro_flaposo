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

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY no configurada en Vercel' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        max_tokens: 1024,
        messages: [
          { role: 'system', content: system || DEFAULT_SYSTEM },
          ...messages,
        ],
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error('Groq error:', response.status, text);
      return res.status(response.status).json({ error: `Groq ${response.status}: ${text}` });
    }

    const data = JSON.parse(text);
    const reply = data.choices?.[0]?.message?.content ?? '';
    res.json({ reply });

  } catch (err) {
    console.error('Handler error:', err);
    res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
};
