// NonaFiksi API — Worker (routes, guardrails) → DO NonaAgent (per-user memory)
// → D1 (canonical store) → LLM gateway (NIM deepseek → scripted fallback).
// Guardrail invariant: the LLM only ever returns constrained JSON; this
// Worker's deterministic validator/reducer is the ONLY writer of game state.
// Steering receipts: docs/research/npc-steering-cookbook.md

import CATALOG from '../web/catalog.json';

const INTENTS = new Set(['none', 'serve_kopi', 'start_interview', 'recap']);
const HANDLE = /^[a-z0-9-]{1,24}$/;
const CORS = { 'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type' };

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (url.pathname === '/api/health') return json({ ok: true, warung: 'buka' });

    // kopi balance — D1 is the counter store (never KV: 1k writes/day wall)
    if (url.pathname === '/api/kopi' && req.method === 'GET') {
      const user = url.searchParams.get('user') ?? 'tamu';
      const row = await env.DB.prepare(
        'SELECT balance FROM kopi WHERE user_id = ?').bind(user).first();
      return json({ user, kopi: row?.balance ?? 1 }); // cangkir pertama kutraktir
    }

    // rumah: save + serve — this is what makes the QR card URL REAL
    if (url.pathname === '/api/rumah' && req.method === 'POST') {
      const b = await req.json().catch(() => null);
      if (!b || !HANDLE.test(b.handle || '')) return json({ error: 'handle tidak sah' }, 400);
      const persona = JSON.stringify(b.persona || {});
      const manifest = JSON.stringify(b.manifest || {});
      if (persona.length > 2048 || manifest.length > 32768)
        return json({ error: 'terlalu besar' }, 413);
      await env.DB.prepare(`INSERT INTO rumah(handle,persona,manifest,updated_at)
        VALUES(?,?,?,datetime('now'))
        ON CONFLICT(handle) DO UPDATE SET persona=excluded.persona,
          manifest=excluded.manifest, updated_at=excluded.updated_at`)
        .bind(b.handle, persona, manifest).run();
      return json({ ok: true, url: '/@' + b.handle });
    }
    if (url.pathname === '/api/rumah' && req.method === 'GET') {
      const h = url.searchParams.get('handle') || '';
      if (!HANDLE.test(h)) return json({ error: 'handle tidak sah' }, 400);
      const row = await env.DB.prepare(
        'SELECT persona,manifest,updated_at FROM rumah WHERE handle=?').bind(h).first();
      return row ? json({ handle: h, persona: JSON.parse(row.persona),
        manifest: JSON.parse(row.manifest), updated_at: row.updated_at })
        : json({ error: 'belum ada' }, 404);
    }

    // /@handle — human-readable rumah page; honest placeholder, never a 404 lie
    if (url.pathname.startsWith('/@')) {
      const h = url.pathname.slice(2).toLowerCase();
      if (!HANDLE.test(h)) return html(page('ALAMAT?', 'Alamat tidak dikenal.'), 404);
      const row = await env.DB.prepare(
        'SELECT persona FROM rumah WHERE handle=?').bind(h).first().catch(() => null);
      if (!row) return html(page('@' + esc(h),
        'Rumah ini belum tersambung ke percetakan. Pemiliknya mungkin masih menyeduh kopi. ☕'));
      const p = JSON.parse(row.persona);
      const links = (p.links || []).map(l =>
        `<a href="${esc(l.url)}" rel="noopener">${esc(l.label || l.url)} ▸</a>`).join('');
      return html(page('RUMAH ' + esc((p.nama || h).toUpperCase()),
        '@' + esc(h) + ' — dicetak hangat di NonaFiksi.', links));
    }

    // bangun: Aksara designs the home via LLM; deterministic validator gates it.
    // No key / any failure → {fallback:true} and the client builds deterministically.
    if (url.pathname === '/api/bangun' && req.method === 'POST') {
      if (!env.NIM_API_KEY) return json({ fallback: true, reason: 'kunci belum ada' });
      const b = await req.json().catch(() => ({}));
      const plan = await bangunRumah(b.persona || {}, env).catch(() => null);
      return plan ? json({ plan }) : json({ fallback: true, reason: 'mesin cetak tersedak' });
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

// ---- LLM home designer (NIM deepseek) + the validator that actually rules ----
const INTERIOR = Object.entries(CATALOG)
  .filter(([, c]) => (c.tags || []).includes('interior') && !c.fxOnly)
  .map(([k, c]) => ({ id: k, w: c.w || 16, h: c.h || 16, flat: !!c.flat }));

async function bangunRumah(p, env) {
  const sys = 'Kamu Nona Aksara, penjaga percetakan, mendesain interior rumah pixel ' +
    '144x224 untuk tamu barumu. Komponen tersedia (HANYA ini): ' +
    INTERIOR.map(c => c.id).join(', ') + '. Balas HANYA JSON valid, tanpa teks lain: ' +
    '{"placements":[{"component":"...","x":INT,"y":INT}],"quote":"..."} — ' +
    'aturan: x 6..126, y 70..200, maksimal 10 placements, JANGAN area pintu ' +
    '(x 50..94 dengan y>=185); quote maks 90 karakter, hangat, bahasa Indonesia, ' +
    'terasa pribadi untuk tamu ini.';
  const r = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + env.NIM_API_KEY,
      'content-type': 'application/json' },
    body: JSON.stringify({ model: 'deepseek-ai/deepseek-v4-pro',
      temperature: 0.8, max_tokens: 600,
      messages: [{ role: 'system', content: sys },
        { role: 'user', content: 'Tamu: ' + JSON.stringify({ nama: p.nama,
          vibe: p.vibe, links: (p.links || []).map(l => l.label) }) }] }) });
  if (!r.ok) throw new Error('nim ' + r.status);
  const d = await r.json();
  let txt = (d.choices?.[0]?.message?.content || '').replace(/```json|```/g, '').trim();
  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('no json');
  const plan = JSON.parse(m[0]);
  const ids = new Set(INTERIOR.map(c => c.id));
  const out = (plan.placements || [])
    .filter(pl => ids.has(pl.component)
      && Number.isFinite(pl.x) && Number.isFinite(pl.y)
      && pl.x >= 6 && pl.x <= 126 && pl.y >= 70 && pl.y <= 200
      && !(pl.x >= 50 && pl.x <= 94 && pl.y >= 185))
    .slice(0, 10)
    .map(pl => ({ component: pl.component, x: pl.x | 0, y: pl.y | 0 }));
  if (!out.length) throw new Error('kosong');
  return { placements: out, quote: String(plan.quote || '').slice(0, 90) };
}

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
    // gateway stub — next wave wires the full chain per npc-steering-cookbook.md
    // (system-prompt contract + json schema + validator). Layer 0 always works:
    const out = { dialogue: 'Hmm… ceritakan lagi. Aku mencatat. ✦',
                  intent: 'none', mood: 'tenang' };
    return INTENTS.has(out.intent) ? out : { ...out, intent: 'none' };
  }
}

// ---- helpers ----
const json = (o, s = 200) => new Response(JSON.stringify(o),
  { status: s, headers: { 'content-type': 'application/json', ...CORS } });
const html = (b, s = 200) => new Response(b,
  { status: s, headers: { 'content-type': 'text/html;charset=utf-8' } });
const esc = s => String(s).replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const page = (title, sub, links) => `<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — NonaFiksi</title>
<style>body{background:#1a120d;color:#f2e8d5;font-family:monospace;display:flex;
align-items:center;justify-content:center;min-height:100vh;margin:0}
.c{max-width:420px;padding:24px;border:3px solid #3a2a1c;box-shadow:6px 6px 0 #000;
background:#2a1d14;text-align:center}h1{color:#e3a62f;font-size:18px;letter-spacing:1px}
p{color:#e4d5b8;line-height:1.6}a{display:block;background:#f2e8d5;color:#1a120d;
padding:10px;margin:8px 0;text-decoration:none;border:2px solid #000;font-weight:bold}
.f{color:#c4553b;font-size:11px;margin-top:18px}</style>
<div class="c"><h1>${title}</h1><p>${sub}</p>${links || ''}
<a href="https://nonafiksi.pages.dev">MAIN NONAFIKSI ▸</a>
<p class="f">NONAFIKSI ✦ cerita yang dicetak hangat</p></div>`;
