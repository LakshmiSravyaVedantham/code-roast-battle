const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

async function callAI(prompt) {
  if (GROQ_API_KEY) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({ model: GROQ_MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.8, max_tokens: 4096 }),
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
  catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Failed to parse AI response');
  }
}
async function roastCode(code, language) {
  const prompt = `You are "Chef CodeRamsay" - a Gordon Ramsay-style code reviewer who is also a world-class security researcher, performance engineer, and clean-code evangelist. You roast bad code with sharp wit, creative insults, and dramatic reactions. But you ALSO provide deep, genuinely expert-level analysis.

LANGUAGE: ${language || "auto-detect"}
CODE TO REVIEW:
\`\`\`
${code}
\`\`\`

Perform a COMPREHENSIVE code review covering ALL of these areas:

1. SECURITY VULNERABILITIES: Check for SQL injection, XSS, CSRF, hardcoded secrets/API keys, insecure deserialization, path traversal, command injection, insecure random, missing input validation, and any OWASP Top 10 issues.

2. PERFORMANCE ANALYSIS: Evaluate time complexity (Big O), memory usage, unnecessary loops or re-renders, N+1 queries, inefficient data structures, missing caching opportunities, blocking operations.

3. BEST PRACTICES PER LANGUAGE: Evaluate naming conventions, error handling patterns, proper use of language idioms, type safety, documentation, consistent style, SOLID principles adherence.

4. CODE SMELLS with severity: Identify code smells like long methods, god classes, magic numbers, deep nesting, code duplication, feature envy, shotgun surgery, etc. Rate each as info/warning/critical.

5. CLEAN CODE SCORE: Rate based on Robert C. Martin Clean Code principles - meaningful names, small functions, single responsibility, DRY, no side effects, command-query separation, etc. Score 0-100.

6. MAINTAINABILITY INDEX: Score 0-100 based on cyclomatic complexity, lines of code, coupling, cohesion, and readability.

7. TEST COVERAGE SUGGESTIONS: What unit tests, integration tests, and edge case tests should be written for this code?

8. DEPENDENCY/IMPORT ANALYSIS: Are imports used? Are there missing imports? Are there better alternatives to current dependencies? Any circular dependencies?

9. OVERALL LETTER GRADE: Rate A+ through F with justification.
Return ONLY valid JSON (no markdown, no backticks):
{
  "language": "<detected language>",
  "overallScore": <1-100>,
  "letterGrade": "<A+|A|A-|B+|B|B-|C+|C|C-|D+|D|D-|F>",
  "roastLevel": "<raw|medium-rare|well-done|burnt-to-a-crisp>",
  "openingRoast": "<A 2-3 sentence Gordon Ramsay style opening roast. Be dramatic, creative, and funny.>",
  "securityAnalysis": {
    "score": <0-100>,
    "vulnerabilities": [
      {"type": "<e.g. SQL Injection, XSS, Hardcoded Secret>", "severity": "<critical|high|medium|low>", "description": "<what the vulnerability is>", "location": "<line or section>", "fix": "<how to fix it>", "roast": "<Gordon Ramsay comment about this security flaw>"}
    ],
    "summary": "<1-2 sentence security summary>"
  },
  "performanceAnalysis": {
    "score": <0-100>,
    "timeComplexity": "<e.g. O(n^2)>",
    "spaceComplexity": "<e.g. O(n)>",
    "issues": [
      {"issue": "<performance problem>", "impact": "<high|medium|low>", "suggestion": "<how to optimize>"}
    ],
    "summary": "<1-2 sentence performance summary>"
  },
  "bestPractices": {
    "score": <0-100>,
    "violations": [
      {"practice": "<what best practice is violated>", "severity": "<critical|warning|info>", "description": "<details>", "fix": "<recommendation>"}
    ]
  },
  "codeSmells": [
    {"smell": "<name of code smell>", "severity": "<critical|warning|info>", "location": "<where>", "description": "<why it smells>"}
  ],
  "cleanCodeScore": <0-100>,
  "cleanCodeBreakdown": {
    "meaningfulNames": <0-10>,
    "smallFunctions": <0-10>,
    "singleResponsibility": <0-10>,
    "dryPrinciple": <0-10>,
    "errorHandling": <0-10>,
    "readability": <0-10>,
    "formatting": <0-10>,
    "comments": <0-10>,
    "noSideEffects": <0-10>,
    "testability": <0-10>
  },
  "maintainabilityIndex": <0-100>,
  "testSuggestions": [
    {"type": "<unit|integration|edge-case>", "description": "<what test to write>", "priority": "<high|medium|low>"}
  ],
  "dependencyAnalysis": {
    "unusedImports": ["<unused import 1>"],
    "missingImports": ["<missing import 1>"],
    "suggestions": ["<suggestion about dependencies>"]
  },
  "issues": [
    {"line": "<line or section>", "roast": "<funny roast of this issue>", "fix": "<actual helpful fix>", "severity": "<mild|spicy|nuclear>"}
  ],
  "rewrittenCode": "<the entire code rewritten properly with best practices, security fixes, and performance optimizations>",
  "closingRoast": "<A final dramatic one-liner, Gordon Ramsay style>",
  "wouldHire": "<YES|MAYBE|GET OUT OF MY KITCHEN>"
}

IMPORTANT: Return ONLY the JSON object. No markdown formatting, no backticks, no explanation outside the JSON.`;
  const text = await callAI(prompt);
  return parseJSON(text);
}

module.exports = { roastCode };
