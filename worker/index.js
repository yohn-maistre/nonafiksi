// NonaFiksi API — Worker (routes, guardrails) → DO NonaAgent (per-user memory)
// → D1 (canonical store) → LLM gateway (NIM GLM → Gemini → honest 'mati').
// Guardrail invariant: the LLM only ever returns constrained JSON; this
// Worker's deterministic validator/reducer is the ONLY writer of game state.
// Steering receipts: docs/research/npc-steering-cookbook.md

import CATALOG from '../web/catalog.json';

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
const ipOk = (ip, cap) => {
  const now = Date.now(); const e = IPS.get(ip) || { n: 0, at: now };
  if (now - e.at > 60000) { e.n = 0; e.at = now; }
  e.n++; if (IPS.size > 2000) IPS.clear(); IPS.set(ip, e);
  return e.n <= (cap || 10);
};

// ---- LLM gateway: NIM (GLM) primary → Gemini fallback. Both speak the
// OpenAI chat shape, so a lane swap is just url+model+key. When every lane
// is dead the CALLER decides the fiction — never a silent template swap.
// tms = per-lane patience: GLM's free-tier queue 524s at peak (live-verified
// 2026-07-13) and a hot queue never answers fast, so it gets a short probe
// window; the workhorse lanes get room to actually generate.
const NIM_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
// Lane ladder, quality-first (live-measured 2026-07-13, 200-token gen):
// GLM-5.2 524s at peak so it gets a short probe window and reclaims the mic
// when its queue clears (breaker re-probes 90s); qwen3-next (3B active) did
// ~17s; llama-8b (1.3s) is the never-dark floor. Gemini slots in above the
// floor once GOOGLE_API_KEY lands.
// Each lane carries q (quality rank, lower=better) and s (speed rank). The
// 'cepat' tier (onboarding — short structured turns, first impression must
// feel instant) sorts by speed; default (deep chat — her voice matters most)
// sorts by quality. gemini-flash ranks high in BOTH, so it leads once its key
// lands. GLM-5.2 524s at peak → short probe + 90s breaker; it reclaims the mic
// when its queue clears.
// q = quality rank, s = speed rank, iv = onboarding rank (lower=first). The
// 'wawancara' tier (onboarding) SKIPS GLM to the back: its 524 wastes a 12s
// probe and llama-8b can't hold the patch-JSON discipline, so qwen leads
// (reliable patches + good voice), gemini takes over once its key lands.
// Default (deep chat) is quality-first; GLM reclaims the mic when free.
const LANES = (env, tier) => {
  const all = [
    env.NIM_API_KEY && { lane: 'nim', tms: 12000, q: 1, s: 5, iv: 4,
      url: NIM_URL, key: env.NIM_API_KEY, model: 'z-ai/glm-5.2' },
    env.NIM_API_KEY && { lane: 'nim-qwen', tms: 35000, q: 2, s: 3, iv: 2,
      url: NIM_URL, key: env.NIM_API_KEY, model: 'qwen/qwen3-next-80b-a3b-instruct' },
    env.GOOGLE_API_KEY && { lane: 'gemini', tms: 30000, q: 2, s: 1, iv: 1,
      url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      key: env.GOOGLE_API_KEY, model: 'gemini-2.5-flash' },
    env.NIM_API_KEY && { lane: 'nim-kilat', tms: 12000, q: 4, s: 2, iv: 3,
      url: NIM_URL, key: env.NIM_API_KEY, model: 'meta/llama-3.1-8b-instruct' },
  ].filter(Boolean);
  if (tier === 'wawancara') return all.sort((a, b) => a.iv - b.iv);
  if (tier === 'cepat') return all.sort((a, b) => a.s - b.s || a.q - b.q);
  return all.sort((a, b) => a.q - b.q || a.s - b.s);
};
// circuit breaker (per-isolate): a lane that just failed rests 90s so a dead
// NIM queue doesn't tax every message with a full timeout before the fallback
const DOWN = new Map();
async function llmChat(env, messages, opts = {}) {
  let err = new Error('tanpa kunci');
  for (const L of LANES(env, opts.tier)) {
    if ((DOWN.get(L.lane) || 0) > Date.now()) { err = new Error(L.lane + ' istirahat'); continue; }
    try {
      const ctl = new AbortController();
      const tid = setTimeout(() => ctl.abort('lambat'), opts.timeoutMs || L.tms || 18000);
      const r = await fetch(L.url, { method: 'POST', signal: ctl.signal,
        headers: { authorization: 'Bearer ' + L.key, 'content-type': 'application/json' },
        body: JSON.stringify({ model: L.model, temperature: opts.temperature ?? 0.85,
          max_tokens: opts.maxTokens || 500, messages }) });
      clearTimeout(tid);
      if (!r.ok) throw new Error(L.lane + ' ' + r.status);
      const d = await r.json();
      const txt = String(d.choices?.[0]?.message?.content || '')
        .replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      if (!txt) throw new Error(L.lane + ' kosong');
      DOWN.delete(L.lane);
      return { text: txt, lane: L.lane };
    } catch (e) { DOWN.set(L.lane, Date.now() + 90000); err = e; }
  }
  throw err;
}
// Robust JSON extraction: models sometimes wrap the object in prose or (when
// max_tokens clips them) leave it truncated mid-array. Walk to the balanced
// close if there is one; otherwise repair by closing the open string/brackets.
const jsonOut = (txt) => {
  let s = String(txt).replace(/```json|```/g, '');
  const i = s.indexOf('{');
  if (i < 0) throw new Error('no json');
  s = s.slice(i);
  const stack = []; let inStr = false, esc = false, end = -1;
  for (let j = 0; j < s.length; j++) {
    const c = s[j];
    if (esc) { esc = false; continue; }
    if (c === '\\' && inStr) { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '{' || c === '[') stack.push(c === '{' ? '}' : ']');
    else if (c === '}' || c === ']') { stack.pop(); if (!stack.length) { end = j; break; } }
  }
  let cand = end >= 0 ? s.slice(0, end + 1) : s;
  try { return JSON.parse(cand); } catch (e) {}
  // truncated: close an open string, drop a dangling comma/partial key, seal
  if (inStr) cand += '"';
  cand = cand.replace(/,\s*$/, '').replace(/:\s*$/, ':null')
    .replace(/,\s*"[^"]*$/, '');
  for (let k = stack.length - 1; k >= 0; k--) cand += stack[k];
  return JSON.parse(cand);
};
const CORS = { 'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type' };

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (url.pathname === '/api/health') return json({ ok: true, warung: 'buka',
      aksara: env.NIM_API_KEY ? 'nim' : (env.GOOGLE_API_KEY ? 'gemini' : 'mati') });

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
      if (!LANES(env).length) return json({ fallback: true, reason: 'kunci belum ada' });
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

    // lane diagnostics: which LLM lanes are alive, seen FROM Cloudflare's edge
    // (Yose's ISP blocks NIM; this answers "does prod see it?"). Tiny prompt,
    // hard brake — it exists for humans debugging, not traffic.
    if (url.pathname === '/api/llm/ping') {
      if (!ipOk((req.headers.get('cf-connecting-ip') || '?') + '#ping', 3))
        return json({ error: 'pelan-pelan' }, 429);
      const mo = (url.searchParams.get('model') || '').slice(0, 64); // NIM catalog probe
      const mx = Math.min(400, +url.searchParams.get('max') || 10); // real-sized gen test
      const out = [];
      for (const L of LANES(env)) {
        if (mo && L.lane === 'gemini') continue; // model probes target NIM only
        const model = (L.lane !== 'gemini' && mo) ? mo : L.model;
        if (out.some(o => o.model === model)) continue;
        const t0 = Date.now();
        try {
          const r = await fetch(L.url, { method: 'POST',
            headers: { authorization: 'Bearer ' + L.key, 'content-type': 'application/json' },
            body: JSON.stringify({ model, max_tokens: mx,
              messages: [{ role: 'user', content: mx > 10
                ? 'Ceritakan sebuah warung kopi di kampung dalam bahasa Indonesia, sekitar 150 kata.'
                : 'Balas satu kata: halo' }] }) });
          const body = (await r.text()).slice(0, 220);
          out.push({ lane: L.lane, model, status: r.status, ms: Date.now() - t0,
            ok: r.ok, cuplikan: r.ok ? undefined : body });
        } catch (e) { out.push({ lane: L.lane, model, ms: Date.now() - t0, gagal: String(e) }); }
      }
      return json({ lanes: out.length ? out : 'tanpa kunci' });
    }

    // aksara: the LIVE conversation — one DO per session (the DO is her memory
    // of you). Body: {sesi, pesan?|buka?, state}. Reply: validated contract
    // {say, choices, expect, patch, done}. All lanes dead → {mati} (client
    // stays in fiction: "ada telepon"). Brake is softer than bangun's: a chat
    // turn every few seconds is normal, 20/min is not.
    if (url.pathname === '/api/aksara' && req.method === 'POST') {
      if (!LANES(env).length) return json({ mati: true });
      if (!ipOk((req.headers.get('cf-connecting-ip') || '?') + '#aks', 20))
        return json({ sibuk: true,
          say: '(Warung sedang ramai — Nona melayani meja lain dulu.) ☕' }, 429);
      const raw = await req.text();
      if (raw.length > 4096) return json({ error: 'terlalu besar' }, 413);
      let b; try { b = JSON.parse(raw); } catch { b = {}; }
      const sesi = String(b.sesi || '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64);
      if (!sesi) return json({ error: 'sesi?' }, 400);
      const stub = env.NONA.get(env.NONA.idFromName(sesi));
      return stub.fetch('https://do/aksara', {
        method: 'POST', body: JSON.stringify(b) });
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
  const res = await llmChat(env, [{ role: 'system', content: sys },
    { role: 'user', content: 'Tamu: ' + JSON.stringify({ nama: p.nama,
      vibe: p.vibe, links: (p.links || []).map(l => l.label) }) }],
    { temperature: 0.8, maxTokens: 600 });
  const plan = jsonOut(res.text);
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

// ---- Aksara alive: persona prompt + the validator that actually rules ----
// The LLM writes her WORDS; this code owns every consequence. patch keys are
// whitelisted, urls re-checked, choices clamped — she can never hallucinate
// a malformed house into D1.
const sysAksara = (st) => {
  const jam = Number.isFinite(+st.jam) ? +st.jam : 12;
  const who = st.baru
    ? 'Tamu di depanmu BELUM TERCATAT — belum punya rumah di NonaFiksi.'
    : `Tamu lama: ${String(st.nama || '?').slice(0, 24)} (@${String(st.handle || '?')
        .slice(0, 24)}), kunjungan ke-${(+st.visits || 0) + 1}.`;
  const TANYA = {
    nama: 'tanyakan nama panggilannya.',
    link: 'minta SATU tautan yang paling mewakili dirinya (IG, toko, portofolio, apa saja).',
    vibe: 'tanyakan suasana rumah yang ia mau: hangat, rapi, atau ramai.',
    quote: 'minta satu kalimat/kutipan untuk dinding rumahnya (boleh ia lewati).',
    penutup: 'TUTUP dengan hangat dan dramatis: kau menutup buku catatan, mesin cetak menyala, rumahnya sedang dicetak halaman demi halaman. Sambut ia masuk.',
  };
  const tahap = TANYA[st.tahap] ? st.tahap : 'nama';
  const tugas = st.baru
    // Onboarding: the WARUNG draws the buttons (client-owned, always correct),
    // so she must NOT invent choices — just one warm line + a patch. This kills
    // the "example-answer-as-a-button" bug and keeps turns short/fast.
    ? `TUGAS: kau sedang menuliskan tamu BARU jadi warga. Bicaralah HANGAT & SANGAT SINGKAT (maks 2 kalimat pendek). Dari pesan terakhir tamu, EKSTRAK yang bisa jadi patch: sebuah nama→patch{"nama"}, sebuah tautan→patch{"links":[{"label","url"}]}, sebuah kutipan→patch{"quote"}. Lalu ${TANYA[tahap]}
JANGAN pernah menuliskan "choices" — tombol sudah disediakan warung. JANGAN mengulang yang sudah dijawab. JANGAN menaruh contoh jawaban sebagai pilihan.`
    : `TUGAS: temani tamu lama. Sekarang jam ${jam} (${String(st.fase || '?').slice(0, 8)}). Sapa sesuai konteks (malam-malam masih di sini? sering mampir? lama tak muncul?). Kau boleh: bergosip warung (ada tamu berjas licin yang ceritanya kau simpan di laci — kalau ia penasaran, tawarkan #oligarki), mendengarkan curhat (tanggapi hangat dan SPESIFIK terhadap ceritanya, jangan menggurui), menawarkan #ubah atau #kartu. Kalau tamu minta ganti nama/tautan/suasana/kutipan → konfirmasi singkat lalu KIRIM patch-nya. Pesan "(tamu masuk warung)" = giliran pembuka: sapaan segar 1-2 kalimat + choices standar: KABAR WARUNG? / AKU MAU CERITA / UBAH RUMAH ✦ (value "#ubah") / Cuma mampir ☕ (value "#pergi"). SETIAP choice harus AKSI yang jelas (kalimat yang diucapkan tamu atau perintah), BUKAN contoh jawaban.`;
  return `Kamu NONA AKSARA — penjaga warung kopi sekaligus percetakan NonaFiksi, kampung pixel tempat tiap orang punya rumah kecil yang juga halaman tautannya (alamat @handle, bisa dikunjungi siapa saja). Kepribadian: hangat, jeli, sedikit jahil, gemar mencatat cerita orang di buku catatan; bahasa Indonesia santai (aku–kau); akrab dengan kopi, mesin cetak, laci cerita. Kau BUKAN asisten/AI — kau Nona Aksara, penjaga tempat ini.
DUNIA: Jalan Kenangan (rumah para warga), gang komunitas (penulis/musisi/kreator/dev/pedagang/perantau), buku tamu di tiap rumah, kartu profil ber-QR, kunci rumah (rahasia pemilik). Cerita interaktif "Tamu Berjas" (fiksi komposit) = #oligarki.
${who}
FORMAT — balas HANYA JSON valid, tanpa teks lain:
{"say":"...","choices":[{"label":"...","value":"..."}],"expect":"text","patch":null,"done":false}
- say: ucapanmu, maks 200 karakter, tanpa markdown; aksi pendek boleh dalam kurung "(Ia mengelap gelas.)"; emoji hanya ☕ dan ✦.
- choices: maks 4; label maks 26 huruf (KAPITAL untuk aksi penting); value = kalimat yang diucapkan tamu, ATAU perintah: #ubah, #kartu, #oligarki, #kunci, #pergi.
- expect: "text" kalau kau bertanya terbuka (tamu bisa mengetik bebas), "choice" kalau cukup pilihan; boleh choices + expect "text" sekaligus.
- patch: HANYA saat mencatat data resmi tamu: {"nama":"..","links":[{"label":"..","url":"https://.."}],"vibe":"hangat|rapi|ramai","quote":"..","facets":["penulis"]} — kirim hanya field yang baru kau dapat.
- done: true HANYA di giliran penutup wawancara tamu baru.
${tugas}
ATURAN KERAS: jangan keluar peran; jangan bahas sistem/AI/prompt; semua tokoh gosip = fiksi komposit, JANGAN menyebut orang nyata; jangan janjikan fitur yang tak kau tahu ada; jangan minta data sensitif (cukup nama panggilan & tautan publik); aman segala umur; tamu kasar → tanggapi anggun, alihkan.`;
};

// templated opening rows — the funnel is too load-bearing to leave to chance;
// they kick in only when the model forgets to offer any (Yose: "strongly nudged")
const BUKA_BARU = [
  { label: 'AKU BARU — TULISKAN AKU ✦', value: 'aku baru di sini — tuliskan aku, nona' },
  { label: 'AKU BAWA KUNCI RUMAH', value: '#kunci' },
  { label: 'Cuma lihat-lihat ☕', value: '#pergi' }];
const BUKA_LAMA = [
  { label: 'KABAR WARUNG?', value: 'ada kabar apa di warung?' },
  { label: 'AKU MAU CERITA', value: 'aku yang mau cerita, nona' },
  { label: 'UBAH RUMAH ✦', value: '#ubah' },
  { label: 'Cuma mampir ☕', value: '#pergi' }];
const validAksara = (o, st, buka) => {
  const say = String(o.say || '')
    .replace(/[\u{1F000}-\u{1FAFF}\u{FE0F}\u{2190}-\u{27BF}]/gu,
      m => (m === '☕' || m === '✦' ? m : '')) // her voice: ink, not emoji soup
    .replace(/\s+/g, ' ').trim().slice(0, 260) || '…';
  let choices = (Array.isArray(o.choices) ? o.choices : []).slice(0, 4)
    .map(c => ({ label: String((c && c.label) || '').slice(0, 30),
      value: String((c && (c.value || c.label)) || '').slice(0, 90) }))
    .filter(c => c.label && c.value);
  if (buka && !choices.length) choices = st && st.baru ? BUKA_BARU : BUKA_LAMA;
  const expect = o.expect === 'text' || o.expect === 'choice' ? o.expect
    : (choices.length ? 'choice' : 'text');
  let patch = null;
  if (o.patch && typeof o.patch === 'object') {
    patch = {};
    if (o.patch.nama) patch.nama = String(o.patch.nama).slice(0, 24);
    if (Array.isArray(o.patch.links)) {
      const ls = o.patch.links.slice(0, 4).map(l => {
        let u = String((l && l.url) || '').trim().slice(0, 200);
        if (u && !/^https?:\/\//i.test(u)) u = 'https://' + u;
        return { label: String((l && l.label) || 'Tautan').slice(0, 20), url: u };
      }).filter(l => /^https?:\/\/[^\s]+\.[^\s]+/i.test(l.url));
      if (ls.length) patch.links = ls;
    }
    if (['hangat', 'rapi', 'ramai'].includes(o.patch.vibe)) patch.vibe = o.patch.vibe;
    if (o.patch.quote) patch.quote = String(o.patch.quote).slice(0, 90);
    if (Array.isArray(o.patch.facets)) {
      const f = o.patch.facets.filter(x => GANGS.includes(x)).slice(0, 6);
      if (f.length) patch.facets = f;
    }
    if (!Object.keys(patch).length) patch = null;
  }
  return { say, choices, expect, patch, done: !!o.done };
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
    const url = new URL(req.url);
    const b = await req.json().catch(() => ({}));
    const sql = this.state.storage.sql;
    if (url.pathname === '/aksara') {
      // daily turn cap per session (episodic timestamps double as the counter);
      // the close stays in fiction — she gets sleepy, the API never shows
      const today = new Date().toISOString().slice(0, 10);
      const c = [...sql.exec(
        "SELECT COUNT(*) c FROM episodic WHERE role='tamu' AND at>=?", today)][0];
      if ((c?.c ?? 0) >= 60) return json({ tutup: true,
        say: '(Ia menguap kecil, menutup buku catatannya.) Sudah cukup cerita untuk hari ini — besok kita lanjutkan ya. Kursimu kusimpan. ☕' });
      const st = b.state || {};
      const pesan = b.buka ? '(tamu masuk warung)' : String(b.pesan || '').slice(0, 500);
      if (!pesan.trim()) return json({ error: 'pesan kosong' }, 400);
      sql.exec('INSERT INTO episodic(role,text) VALUES(?,?)', 'tamu', pesan);
      // her memory of you: the last 16 turns of YOUR DO — she remembers what
      // you told her last week because it literally never left her notebook
      const hist = [...sql.exec(
        'SELECT role,text FROM episodic ORDER BY id DESC LIMIT 16')].reverse();
      const messages = [{ role: 'system', content: sysAksara(st) },
        ...hist.map(h => ({ role: h.role === 'nona' ? 'assistant' : 'user',
          content: h.text }))];
      try {
        // onboarding = fast tier + tight token budget (short structured turns,
        // first impression must feel instant); deep chat = quality tier, roomier
        const out = await llmChat(this.env, messages,
          st.baru ? { maxTokens: 220, tier: 'wawancara' } : { maxTokens: 320 });
        const v = validAksara(jsonOut(out.text), st, !!b.buka);
        sql.exec('INSERT INTO episodic(role,text) VALUES(?,?)', 'nona', JSON.stringify(v));
        return json({ ...v, lane: out.lane });
      } catch (e) {
        // lane died mid-chat → client keeps it in fiction ("ada telepon") + retry
        return json({ macet: true, galat: b.debug ? String(e).slice(0, 200) : undefined }, 503);
      }
    }
    // legacy curhat drawer (/bicara): keep every trusted story, ack in character
    const text = String(b.text || '').slice(0, 500);
    sql.exec('INSERT INTO episodic(role, text) VALUES (?, ?)', 'user', text);
    return json({ dialogue: 'Kucatat, kata demi kata. ✦', intent: 'none', mood: 'tenang' });
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
