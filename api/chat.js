const DEFAULT_SYSTEM = 'Eres "Mini Claude", un asistente integrado en un hub de minijuegos. Puedes ayudar con Minecraft, desarrollo de videojuegos, programación y cualquier otra pregunta. Responde en español cuando el usuario escriba en español.';

// Si el principal está saturado o tarda, se alterna con el de respaldo
const MODELS = ['gemini-3.8-flash', 'gemini-flash-latest'];
const ATTEMPT_TIMEOUT = 20000;
const DEADLINE = 55000;
const MAX_ATTEMPTS = 5;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Lee el cuerpo de un 429 de Gemini: qué cuota se agotó y cuánto esperar
function parse429(text) {
  let details = [];
  try { details = JSON.parse(text).error?.details || []; } catch {}
  const quotaId = details.flatMap(d => d.violations || []).map(v => v.quotaId || '').join(' ');
  const delay = details.find(d => d.retryDelay)?.retryDelay;
  return {
    daily: /PerDay/i.test(quotaId),
    perMinute: /PerMinute/i.test(quotaId),
    waitSec: delay ? Math.ceil(parseFloat(delay)) : null,
  };
}

// Segundos hasta la próxima medianoche en hora del Pacífico (reinicio de la cuota diaria)
function secondsToPacificMidnight() {
  const now = new Date();
  const [h, m, sec] = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(now).split(':').map(Number);
  return 86400 - ((h % 24) * 3600 + m * 60 + sec);
}

function formatWait(sec) {
  if (sec < 90) return `${sec} s`;
  if (sec < 3600) return `${Math.ceil(sec / 60)} min`;
  const h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
  return m ? `${h} h ${m} min` : `${h} h`;
}

function quotaMessage(infos) {
  const resetUtc = new Date(Date.now() + secondsToPacificMidnight() * 1000).toISOString().slice(11, 16);
  // Si algún modelo solo tiene límite por minuto, ese es el que se libera antes
  const minute = infos.filter(i => i.perMinute && !i.daily);
  if (!infos.some(i => i.daily || i.perMinute)) {
    return `Gemini: límite de cuota alcanzado (429). Espera un minuto; si sigue, es el límite diario (se reinicia a las ${resetUtc} UTC).`;
  }
  if (minute.length) {
    const waits = minute.map(i => i.waitSec).filter(Boolean);
    const wait = waits.length ? Math.min(...waits) : 60;
    return `Gemini: límite por minuto alcanzado. Espera ${formatWait(wait)} y vuelve a intentar.`;
  }
  return `Gemini: límite diario de tu API key agotado. Se reinicia en ${formatWait(secondsToPacificMidnight())} (${resetUtc} UTC, medianoche hora del Pacífico).`;
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

  const makeBody = model => JSON.stringify({
    systemInstruction: { parts: [{ text: system || DEFAULT_SYSTEM }] },
    contents,
    generationConfig: {
      maxOutputTokens: 8192,
      ...(model.startsWith('gemini-3') ? { thinkingConfig: { thinkingLevel: 'low' } } : {}),
    },
  });

  const start = Date.now();
  let lastStatus = 0;
  let lastText = '';

  // Modelos que ya dieron 429: no se reintentan (cada intento gasta cuota)
  const limited = new Set();
  const quotaInfos = [];

  for (let attempt = 0; attempt < MAX_ATTEMPTS && Date.now() - start < DEADLINE - 3000; attempt++) {
    const available = MODELS.filter(m => !limited.has(m));
    if (!available.length) break;
    if (attempt > 1) await sleep(1500 * (attempt - 1));
    const model = available[attempt % available.length];
    const timeout = Math.min(ATTEMPT_TIMEOUT, DEADLINE - (Date.now() - start));
    if (timeout < 3000) break;

    let response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: makeBody(model), signal: AbortSignal.timeout(timeout) }
      );
      lastText = await response.text();
    } catch (err) {
      if (err.name === 'TimeoutError') { lastStatus = 504; console.warn(`${model}: timeout`); continue; }
      console.error('Handler error:', err);
      return res.status(500).json({ error: err.message || 'Error interno' });
    }

    lastStatus = response.status;
    if (response.status === 429) { console.warn(`${model}: 429`, lastText); limited.add(model); quotaInfos.push(parse429(lastText)); continue; }
    if ([500, 503].includes(response.status)) { console.warn(`${model}: ${response.status}`); continue; }

    if (!response.ok) {
      console.error('Gemini error:', model, response.status, lastText);
      return res.status(response.status).json({ error: `Gemini ${response.status} (${model}): ${lastText}` });
    }

    const data = JSON.parse(lastText);
    const parts = data.candidates?.[0]?.content?.parts || [];
    const reply = parts.filter(p => !p.thought && p.text).map(p => p.text).join('');
    if (!reply) { lastStatus = 502; lastText = data.candidates?.[0]?.finishReason || 'respuesta vacía'; continue; }
    return res.json({ reply });
  }

  if (lastStatus === 429) {
    return res.status(429).json({ error: quotaMessage(quotaInfos) });
  }
  if (lastStatus === 504) {
    return res.status(504).json({ error: 'Gemini tardó demasiado, intenta de nuevo.' });
  }
  return res.status(503).json({ error: `Gemini no disponible (${lastStatus}), intenta de nuevo en unos segundos.` });
};
