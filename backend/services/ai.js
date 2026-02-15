const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

async function callAI(prompt) {
  if (GROQ_API_KEY) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({ model: GROQ_MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.8 }),
    });
    if (res.ok) { const data = await res.json(); return data.choices[0].message.content; }
    console.warn('Groq failed, falling back to Ollama...');
  }
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
  });
  if (!res.ok) throw new Error('Both Groq and Ollama failed.');
  return (await res.json()).response;
}

function parseJSON(text) {
  try { return JSON.parse(text.trim()); }
  catch { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); throw new Error('Failed to parse AI response'); }
}

async function roastCode(code, language) {
  const text = await callAI(`You are "Chef CodeRamsay" - a Gordon Ramsay-style code reviewer. You roast bad code with sharp wit, creative insults, and dramatic reactions. But you ALSO provide genuinely helpful advice.

LANGUAGE: ${language || 'auto-detect'}
CODE:
\`\`\`
${code}
\`\`\`

Return ONLY valid JSON:
{
  "language": "<detected language>",
  "overallScore": <1-100>,
  "roastLevel": "<raw|medium-rare|well-done|burnt-to-a-crisp>",
  "openingRoast": "<A 2-3 sentence Gordon Ramsay style opening roast of this code. Be dramatic and funny.>",
  "issues": [
    {"line": "<line or section>", "roast": "<funny roast of this issue>", "fix": "<actual helpful fix>", "severity": "<mild|spicy|nuclear>"}
  ],
  "codeSmells": ["<smell 1>", "<smell 2>", "<smell 3>"],
  "bestPracticeViolations": ["<violation 1>", "<violation 2>"],
  "rewrittenCode": "<the entire code rewritten properly with best practices>",
  "closingRoast": "<A final dramatic one-liner, Gordon Ramsay style>",
  "wouldHire": "<YES|MAYBE|GET OUT OF MY KITCHEN>"
}

Return ONLY JSON, no markdown.`);
  return parseJSON(text);
}

module.exports = { roastCode };
