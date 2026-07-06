// NonaFiksi API — Wave-3 scaffold. NOT yet deployed (docs/DEPLOY.md).
// Architecture per docs/research/agent-memory-cookbook.md:
//   Worker (routes, guardrails) → DO NonaAgent (per-user memory, SQLite)
//   → D1 (canonical store) → LLM gateway (Groq → Gemini → NIM → Workers AI)
// Guardrail invariant: the LLM only ever returns {dialogue, intent, mood};
// this Worker's deterministic reducer is the ONLY writer of game state.

const INTENTS = new Set(['none', 'serve_kopi', 'start_interview', 'recap']);

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/api/health') return json({ ok: true, warung: 'buka' });

    // kopi balance — D1 is the counter store (never KV: 1k writes/day wall)
    if (url.pathname === '/api/kopi' && req.method === 'GET') {
      const user = url.searchParams.get('user') ?? 'tamu';
      const row = await env.DB.prepare(
        'SELECT balance FROM kopi WHERE user_id = ?').bind(user).first();
      return json({ user, kopi: row?.balance ?? 1 }); // cangkir pertama kutraktir
    }

    // talk to Nona — proxied to the user's own Durable Object
    if (url.pathname === '/api/bicara' && req.method === 'POST') {
      const { user = 'tamu', text = '' } = await req.json();
      const stub = env.NONA.get(env.NONA.idFromName(user));
      return stub.fetch('https://do/bicara', {
        method: 'POST', body: JSON.stringify({ text }) });
    }
    return json({ error: 'jalan buntu' }, 404);
  }
};

export class NonaAgent {
  constructor(state, env) {
    this.state = state; this.env = env;
    state.storage.sql.exec(`CREATE TABLE IF NOT EXISTS episodic(
      id INTEGER PRIMARY KEY, at TEXT DEFAULT CURRENT_TIMESTAMP,
      role TEXT, text TEXT);
    CREATE TABLE IF NOT EXISTS facts(
      id INTEGER PRIMARY KEY, fact TEXT, source_episode_id INTEGER)`);
  }
  async fetch(req) {
    const { text } = await req.json();
    const sql = this.state.storage.sql;
    sql.exec('INSERT INTO episodic(role, text) VALUES (?, ?)', 'user', text);
    // memory injection: distilled facts only, hard-capped (Groq 100K TPD wall)
    const facts = [...sql.exec('SELECT fact FROM facts ORDER BY id DESC LIMIT 12')];
    const out = await this.llm(text, facts.map(f => f.fact));
    sql.exec('INSERT INTO episodic(role, text) VALUES (?, ?)', 'nona', out.dialogue);
    return json(out);
  }
  async llm(text, facts) {
    // gateway stub — wave 3 wires Groq/Gemini/NIM/Workers AI fallback chain.
    // Until then Nona answers from script (Layer 0 always works):
    const out = { dialogue: 'Hmm… ceritakan lagi. Aku mencatat. ✦',
                  intent: 'none', mood: 'tenang' };
    return INTENTS.has(out.intent) ? out : { ...out, intent: 'none' };
  }
}

const json = (o, s = 200) => new Response(JSON.stringify(o),
  { status: s, headers: { 'content-type': 'application/json' } });
