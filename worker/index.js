// NonaFiksi API — Worker (routes, guardrails) → DO NonaAgent (per-user memory)
// → D1 (canonical store) → LLM gateway (NIM deepseek → scripted fallback).
// Guardrail invariant: the LLM only ever returns constrained JSON; this
// Worker's deterministic validator/reducer is the ONLY writer of game state.
// Steering receipts: docs/research/npc-steering-cookbook.md

import CATALOG from '../web/catalog.json';

const INTENTS = new Set(['none', 'serve_kopi', 'start_interview', 'recap']);
const HANDLE = /^[a-z0-9-]{1,24}$/;
// gang facets — opt-in SELF-labels only (profession/place/interest; never
// religion/ethnicity/age — SARA rule). Streets are views over the rumah table.
const GANGS = ['penulis', 'musisi', 'kreator', 'dev', 'pedagang', 'perantau'];
const facetsCol = (p) => { const f = ((p || {}).facets || [])
  .filter(x => GANGS.includes(x)).slice(0, 6);
  return f.length ? ',' + f.join(',') + ',' : ''; };

const sha256hex = async (s) => {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
};

// per-isolate IP brake (best-effort: resets on isolate eviction, which is fine —
// it exists to stop dumb loops, not determined attackers; D1 daily cap does the rest)
const IPS = new Map();
const ipOk = (ip) => {
  const now = Date.now(); const e = IPS.get(ip) || { n: 0, at: now };
  if (now - e.at > 60000) { e.n = 0; e.at = now; }
  e.n++; if (IPS.size > 2000) IPS.clear(); IPS.set(ip, e);
  return e.n <= 10;
};
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

    // rumah: save + serve — this is what makes the QR card URL REAL.
    // Claim-token model: first save of a handle MINTS a kunci (uuid), returned
    // exactly once; every later write must present it. Legacy rows (secret_hash
    // NULL, pre-auth era) are claimed by their next writer.
    if (url.pathname === '/api/rumah' && req.method === 'POST') {
      const b = await req.json().catch(() => null);
      if (!b || !HANDLE.test(b.handle || '')) return json({ error: 'handle tidak sah' }, 400);
      const persona = JSON.stringify(b.persona || {});
      const manifest = JSON.stringify(b.manifest || {});
      if (persona.length > 2048 || manifest.length > 32768)
        return json({ error: 'terlalu besar' }, 413);
      const terdaftar = b.terdaftar ? 1 : 0;
      const row = await env.DB.prepare(
        'SELECT secret_hash FROM rumah WHERE handle=?').bind(b.handle).first();
      const facets = facetsCol(b.persona);
      if (!row) {
        const token = crypto.randomUUID();
        await env.DB.prepare(`INSERT INTO rumah(handle,persona,manifest,secret_hash,terdaftar,facets,updated_at)
          VALUES(?,?,?,?,?,?,datetime('now'))`)
          .bind(b.handle, persona, manifest, await sha256hex(token), terdaftar, facets).run();
        return json({ ok: true, url: '/@' + b.handle, token, baru: true });
      }
      if (!row.secret_hash) {
        const token = crypto.randomUUID();
        await env.DB.prepare(`UPDATE rumah SET persona=?,manifest=?,secret_hash=?,terdaftar=?,facets=?,
          updated_at=datetime('now') WHERE handle=?`)
          .bind(persona, manifest, await sha256hex(token), terdaftar, facets, b.handle).run();
        return json({ ok: true, url: '/@' + b.handle, token, baru: true });
      }
      if (!b.token) return json({ error: 'sudah dipakai' }, 409);
      // comparing HASHES (attacker can't choose the stored preimage) blunts
      // string-compare timing; good enough for a game kunci.
      if (await sha256hex(String(b.token)) !== row.secret_hash)
        return json({ error: 'kunci salah' }, 403);
      await env.DB.prepare(`UPDATE rumah SET persona=?,manifest=?,terdaftar=?,facets=?,
        updated_at=datetime('now') WHERE handle=?`)
        .bind(persona, manifest, terdaftar, facets, b.handle).run();
      return json({ ok: true, url: '/@' + b.handle });
    }

    // bongkar: token-gated full delete (rumah + its buku tamu)
    if (url.pathname === '/api/rumah/hapus' && req.method === 'POST') {
      const b = await req.json().catch(() => ({}));
      const row = await env.DB.prepare(
        'SELECT secret_hash FROM rumah WHERE handle=?').bind(String(b.handle || '')).first();
      if (!row) return json({ error: 'belum ada' }, 404);
      if (!row.secret_hash || !b.token ||
          await sha256hex(String(b.token)) !== row.secret_hash)
        return json({ error: 'kunci salah' }, 403);
      await env.DB.prepare('DELETE FROM tamu WHERE handle=?').bind(b.handle).run();
      await env.DB.prepare('DELETE FROM rumah WHERE handle=?').bind(b.handle).run();
      return json({ ok: true, dibongkar: true });
    }

    // recovery: handle + kunci → full persona/manifest (new phone, wiped browser)
    if (url.pathname === '/api/rumah/cek' && req.method === 'POST') {
      const b = await req.json().catch(() => ({}));
      if (!HANDLE.test(b.handle || '') || !b.token) return json({ error: 'kurang lengkap' }, 400);
      const row = await env.DB.prepare(
        'SELECT persona,manifest,secret_hash FROM rumah WHERE handle=?').bind(b.handle).first();
      if (!row || !row.secret_hash || await sha256hex(String(b.token)) !== row.secret_hash)
        return json({ error: 'kunci salah' }, 403);
      return json({ ok: true, handle: b.handle, persona: JSON.parse(row.persona),
        manifest: JSON.parse(row.manifest) });
    }

    // buku tamu: anyone may write (brake + caps); only the kunci-holder reads
    if (url.pathname === '/api/tamu' && req.method === 'POST') {
      if (!ipOk(req.headers.get('cf-connecting-ip') || '?'))
        return json({ error: 'pelan-pelan ☕' }, 429);
      const b = await req.json().catch(() => ({}));
      if (!HANDLE.test(b.handle || '')) return json({ error: 'handle tidak sah' }, 400);
      const nama = String(b.nama || 'tamu').slice(0, 24);
      const pesan = String(b.pesan || '').trim().slice(0, 280);
      if (!pesan) return json({ error: 'pesan kosong' }, 400);
      const owner = await env.DB.prepare(
        'SELECT handle FROM rumah WHERE handle=?').bind(b.handle).first();
      if (!owner) return json({ error: 'belum ada' }, 404);
      const n = await env.DB.prepare(
        'SELECT COUNT(*) c FROM tamu WHERE handle=?').bind(b.handle).first();
      if ((n?.c ?? 0) >= 200) return json({ error: 'buku tamunya penuh' }, 429);
      await env.DB.prepare(
        "INSERT INTO tamu(handle,nama,pesan,at) VALUES(?,?,?,datetime('now'))")
        .bind(b.handle, nama, pesan).run();
      return json({ ok: true });
    }
    if (url.pathname === '/api/tamu/baca' && req.method === 'POST') {
      const b = await req.json().catch(() => ({}));
      const row = await env.DB.prepare(
        'SELECT secret_hash FROM rumah WHERE handle=?').bind(String(b.handle || '')).first();
      if (!row?.secret_hash || !b.token ||
          await sha256hex(String(b.token)) !== row.secret_hash)
        return json({ error: 'kunci salah' }, 403);
      const rs = await env.DB.prepare(
        'SELECT id,nama,pesan,at FROM tamu WHERE handle=? ORDER BY id DESC LIMIT 40')
        .bind(b.handle).all();
      return json({ ok: true, catatan: rs.results || [] });
    }

    // jalan: opted-in neighbors. Default = kavling (signup) order; ?gang=X
    // filters by facet (streets are views); ?gang=acak = serendipity sample.
    // The embedding "garis minat" replaces the default ORDER BY later.
    if (url.pathname === '/api/jalan' && req.method === 'GET') {
      const me = url.searchParams.get('me') || '';
      const gang = url.searchParams.get('gang') || '';
      let q = `SELECT handle,persona,updated_at FROM rumah
        WHERE terdaftar=1 AND handle!=? ORDER BY rowid ASC LIMIT 8`;
      const binds = [me];
      if (gang === 'acak') q = q.replace('ORDER BY rowid ASC', 'ORDER BY RANDOM()');
      else if (GANGS.includes(gang)) {
        q = `SELECT handle,persona,updated_at FROM rumah
          WHERE terdaftar=1 AND handle!=? AND facets LIKE ? ORDER BY rowid ASC LIMIT 8`;
        binds.push('%,' + gang + ',%'); }
      const rs = await env.DB.prepare(q).bind(...binds).all();
      const now = Date.now();
      return json({ tetangga: (rs.results || []).map(r => { let p = {};
        try { p = JSON.parse(r.persona); } catch (e) {}
        const at = new Date(String(r.updated_at || '').replace(' ', 'T') + 'Z').getTime();
        return { handle: r.handle, nama: p.nama || r.handle,
          aktif: Number.isFinite(at) && (now - at) < 48 * 3600e3 }; }) });
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

    // /@handle — the persona card as a page; honest placeholder, never a 404 lie
    if (url.pathname.startsWith('/@')) {
      const h = url.pathname.slice(2).toLowerCase();
      if (!HANDLE.test(h)) return html(page('ALAMAT?', '?', 'Alamat tidak dikenal.'), 404);
      const row = await env.DB.prepare(
        'SELECT persona FROM rumah WHERE handle=?').bind(h).first().catch(() => null);
      if (!row) return html(page('@' + esc(h), '☕',
        'Rumah ini belum tersambung ke percetakan. Pemiliknya mungkin masih menyeduh kopi.'));
      const p = JSON.parse(row.persona);
      const nama = p.nama || h;
      const links = (p.links || []).filter(l => /^https?:\/\//i.test(l.url || '')).map(l =>
        `<a href="${esc(l.url)}" rel="noopener">${esc(l.label || l.url)} ▸</a>`).join('');
      const masuk = `<a class="go" href="https://nonafiksi.pages.dev/?kunjungi=${esc(h)}">` +
        `MASUK RUMAHNYA ✦</a>`;
      return html(page(esc(nama.toUpperCase().slice(0, 16)),
        esc(nama[0] || '?').toUpperCase(), '@' + esc(h), links + masuk));
    }

    // bangun: Aksara designs the home via LLM; deterministic validator gates it.
    // No key / any failure → {fallback:true} and the client builds deterministically.
    // Cost guards (NIM quota is real money-shaped): per-IP soft brake, 4KB body cap,
    // and a per-handle daily cap of 5 charged on ATTEMPT (fail-closed). The handle's
    // rumah row must already exist — the client always saves the home first.
    if (url.pathname === '/api/bangun' && req.method === 'POST') {
      if (!env.NIM_API_KEY) return json({ fallback: true, reason: 'kunci belum ada' });
      if (!ipOk(req.headers.get('cf-connecting-ip') || '?'))
        return json({ error: 'pelan-pelan ☕' }, 429);
      const raw = await req.text();
      if (raw.length > 4096) return json({ error: 'terlalu besar' }, 413);
      let b; try { b = JSON.parse(raw); } catch { b = {}; }
      const h = String(b.handle || '');
      if (!HANDLE.test(h)) return json({ fallback: true, reason: 'handle dulu' });
      const row = await env.DB.prepare(
        'SELECT secret_hash,bangun_day,bangun_count FROM rumah WHERE handle=?').bind(h).first();
      if (!row) return json({ fallback: true, reason: 'rumah belum tercatat' });
      if (!row.secret_hash || !b.token ||
          await sha256hex(String(b.token)) !== row.secret_hash)
        return json({ fallback: true, reason: 'butuh kunci rumah' });
      const today = new Date().toISOString().slice(0, 10); // UTC day; WIB skews the
      const used = row.bangun_day === today ? row.bangun_count : 0; // reset hour, fine v0.7
      if (used >= 5)
        return json({ error: 'mesin cetak perlu istirahat — besok lagi ☕' }, 429);
      await env.DB.prepare('UPDATE rumah SET bangun_day=?, bangun_count=? WHERE handle=?')
        .bind(today, used + 1, h).run();
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
// the /@ page IS the card: tinta band, avatar plate (initial for now — real
// pixel avatars/photos come with the R2 wave), links, and a door into the game.
const page = (title, ava, sub, links) => `<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — NonaFiksi</title>
<meta property="og:title" content="${title} — NonaFiksi">
<meta property="og:description" content="${sub || 'cerita yang dicetak hangat'}">
<style>body{background:#1a120d;color:#f2e8d5;font-family:monospace;display:flex;
align-items:center;justify-content:center;min-height:100vh;margin:0;padding:14px;box-sizing:border-box}
.c{width:340px;max-width:94vw;border:4px solid #3a2a1c;box-shadow:8px 8px 0 #000;
background:#f2e8d5;color:#1a120d;text-align:center;padding-bottom:16px}
.band{background:#303b7a;height:92px;position:relative;margin-bottom:52px}
.ava{position:absolute;left:50%;bottom:-40px;transform:translateX(-50%);width:80px;height:80px;
background:#f2e8d5;border:4px solid #1a120d;font-size:44px;line-height:76px;font-weight:bold;color:#303b7a}
h1{font-size:19px;letter-spacing:1px;margin:6px 0 2px}
.h{color:#303b7a;font-weight:bold;margin:0 0 14px}
a{display:block;background:#fffdf6;color:#1a120d;padding:11px;margin:8px 14px;
text-decoration:none;border:2px solid #1a120d;box-shadow:3px 3px 0 rgba(0,0,0,.35);font-weight:bold}
a.go{background:#e3a62f}
.f{color:#c4553b;font-size:10px;margin-top:14px;letter-spacing:1px}</style>
<div class="c"><div class="band"><div class="ava">${ava || '✦'}</div></div>
<h1>${title}</h1><p class="h">${sub || ''}</p>${links || ''}
<a href="https://nonafiksi.pages.dev">MAIN NONAFIKSI ▸</a>
<p class="f">NONAFIKSI ✦ CERITA YANG DICETAK HANGAT</p></div>`;
