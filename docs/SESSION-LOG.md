# Session log — newest first

Written for a reader with amnesia. Each entry: what happened, what's true
now, what's next.

## 2026-07-12 — simpang gang: the crossroads makes the mechanic spatial

Yose playtest verdict: PETA GANG zone by the warung was invisible/confusing.
Replaced with a **simpang**: horizontal crossroad band mid-street (engine
crossPath in GROUNDS.street, y214-240 — the horizontal-patrol NPC now walks
it), **MULUT GANG exits at both edges**, papan SIMPANG GANG signage at the
corner. Choosing a gang fades through the mouth and resurfaces at the simpang
with new tetangga. Future ladder when gangs have enough residents: each mouth
becomes a real side-scene (pocket streets per gang, then the RT segments of
the garis-minat design).

## 2026-07-11 (night) — v0.8.1: gang facets LIVE, /@ page = the card, BONGKAR RUMAH

Yose playtested v0.8 live (his QR scanned, /@yose renders, kunci flow held) and
asked for: gang facets now, /@ page styled like the persona card with a way to
walk in, and delete/reset (he speedran the interview into a one-letter link).
All shipped + curl-drilled green:

- **Gang facets**: rumah.facets column, whitelist self-labels only (penulis/
  musisi/kreator/dev/pedagang/perantau — profession/place/interest; religion/
  ethnicity/age NEVER, SARA rule). /api/jalan?gang=X facet filter, gang=acak
  random sample, bogus → default. Client: PETA GANG signpost+zone left of the
  warung door (interact placed >30px from zone so the popup can't shadow the
  menu), gang picker multi-toggle in ubah rumah ("GANG ✦ komunitasku"),
  street name swaps to the gang name. Streets are officially VIEWS.
- **/@ page is the card now**: tinta band, avatar plate (INITIAL for now — real
  pixel avatar/photos land with the R2 wave, Yose wants them customizable in
  the house), links, og meta, and **MASUK RUMAHNYA ✦ →
  nonafiksi.pages.dev/?kunjungi=handle** — the boot param walks a guest
  straight into that home (skips title). The linktree finally opens its door.
- **BONGKAR RUMAH**: /api/rumah/hapus (kunci-gated; deletes rumah + tamu
  rows; verified wrong-key 403 / real-key gone), double-confirm flow in ubah
  rumah, wipes nf_* localStorage and reloads to title. Fixes the "careless
  playthrough" problem: reset and re-interview.
- dchoices got max-height+scroll (menus grew to 8 items).
- @kirana seeded with facets penulis+perantau so Gang Penulis has a lit house.

**Known state**: Yose's own @yose exists with a junk one-letter link — he can
fix via UBAH RUMAH → TAUTAN → GANTI, or BONGKAR and redo. NIM_API_KEY still
pending. Next session queue (designed): R2 photo/polaroid wall + avatar on
card+page, Spotify corner, halaman notes, titip salam, Pak RT/warta,
embedding garis-minat batch.

## 2026-07-11 (later) — v0.8 SOCIAL CORE: kunci auth, buku tamu, Jalan v0, kampung-algorithm design

Same-day follow-up to v0.7. Yose's brainstorm ("neighbors change daily? or
fixed with overlap?") landed on the **kampung algorithm** design, logged here
as north star: 1D "garis minat" (embed personas, project to a line),
**fractional addresses** frozen at signup (new users insert BETWEEN nearest
neighbors — LexoRank-style, nobody ever moves, neighborhoods overlap by
construction), RT segments of 8-10 houses, rotating **pendatang** guest slots
for freshness, **Gang Tembusan** wormhole-alleys to far-but-kindred RTs.
LLM never ranks — embeddings rank, Nona narrates intros (aksara-cli doctrine).
v1 = nightly Actions batch; v0 (SHIPPED tonight) = kavling/signup order.

Shipped + verified live by curl drill (all 10 checks green):

- **Kunci auth (the hijack hole is CLOSED)**: first save of a handle mints a
  uuid kunci (sha256 → rumah.secret_hash, returned exactly once); updates
  need it (409 taken / 403 wrong); legacy NULL rows claimed by next writer
  (tes-v07 claimed, then tokenless rewrite correctly 409'd). /api/rumah/cek =
  recovery. /api/bangun token-gated. Client: kunci popup (clipboard copy,
  door-menu re-view), "Rumahku sudah ada — aku bawa kunci" recovery at Nona,
  409 auto-suffix.
- **Buku tamu**: POST /api/tamu open-write (IP brake, 280 chars, 200/owner
  cap, owner must exist), /api/tamu/baca kunci-gated. Client: door menu
  BUKU TAMU (owner reads), visitors write from a neighbor's door.
- **Jalan v0**: rumah.terdaftar opt-in (RT toggle in ubah rumah, unlisted by
  default per doctrine), GET /api/jalan → 4 neighbor PLOTS on street houses
  (rumah-a/merah/b/c), KETUK exits → knock dialog → **visit their real home**
  (generateHome from their persona + decor plan, read-only, buku-tamu write,
  exit back at their door). Lampu menyala glow for aktif (<48h) neighbors.
- **Polish**: arrow-key/Enter dialog selection (.chc.sel kunyit outline),
  kasur collider + street door gap tightened (clipping), jemuran redrawn
  (was reading as FIRE at night, Yose's favorite bug ever).
- Seeded demo neighbor **@kirana** (terdaftar) so first players find a lit
  house; drill rows unregistered.

**Parked designs (ready, next sessions)**: polaroid-wall gallery zoom +
R2 uploads (client-resize webp, 12/user, needs R2 binding); Spotify corner
(oEmbed, free, no key — verified 2026-07-11); halaman notes (D1); titip
salam (D1 relay via Nona); Pak RT NPC + papan pengumuman (detak-detik warta
surface); embedding batch. Instagram: NO free API exists (Basic Display dead
12/2024, replacement needs business accounts) — uploads are the honest path,
decided.

**Gang-facet design (Yose, same night)**: streets are VIEWS over the rumah
table, not places — one canonical home, but a house can appear on many
themed streets. Gang = entrance to a facet-street: Gang Penulis / Musisi /
Dev (profession), Gang Pesisir etc. (place), Gang Acak (daily random
sample). Facets are OPT-IN SELF-LABELS chosen in ubah rumah, never inferred
(SARA rule: profession/place/interest facets yes; religion/ethnicity never
as browsing categories; age skipped). Implementation is just
/api/jalan?gang=X WHERE facet — cheaper than embeddings and ships the
explore use-case sooner; the embedding garis-minat stays the default
Jalan Kenangan mix. Peta gang lives in the warung.

**Needs-from-Yose**: NIM_API_KEY still pending; phone playtest v0.8 (kunci
beat, knock on @kirana's door, buku tamu round-trip, arrow keys on desktop);
ledger unchanged.

## 2026-07-11 — 🟢 v0.7 "Malam Kedai": BACKEND LIVE, world alive, kedai bar, ubah rumah

**THE DEPLOY IS FIXED.** Yose repaired the CF token; full CI pipeline green
for the first time: Pages + D1 (bootstrapped, final schema) + Worker + DO all
live. Worker URL: **https://nonafiksi-api.giyaibo.workers.dev** (health,
rumah save/read, /@handle pages all verified by curl). Client now DEFAULTS
to the live worker (game.js NF_API fallback; localStorage nf_api overrides,
'off' forces offline). `web/_redirects` 302s nonafiksi.pages.dev/@handle →
worker, so the QR card URL is finally real.

v0.7 shipped (plan: ~/.claude/plans/hey-broski-good-to-structured-balloon.md):

- **Engine NPC brains** (engine.js stepNpc, all data-driven from scene JSON):
  horizontal patrol {x0,x1}, wander-and-pause {wander:[x,y,w,h]}, chase pairs
  {chase:'id',ox,oy}, 2-frame custom anim {anim,animMs}, strip-sheet animals
  {strip,fw,fh} with flip-x (Ninja animals are 2-frame side strips, NOT 4-dir
  — dog frames are 18px wide). New FX: birds (day V-flock) + butterfly. New
  DECOS: rakBotol (parametric sirup/kopi/jamu bottle shelf, paper labels —
  Yose's kedai-malam call: bar ENERGY, zero liquor coding). New MAPS:
  nonaBar0/1 (glass-polishing), gelas, gerobak, jemuran, anjing fallback.
- **Street lives**: kid chasing the Ninja dog, 2 chickens at the kios, walker
  crossing the path, wanderer, birds overhead, gerobak sate ("SEBENTAR —
  SALAT"), jemuran. **Player's house is VISIBLE** at the south end over the
  pulang exit; the papan beside it becomes their nameplate
  (placeHomeOnStreet). Exiting home lands AT the house (street 72,618) so
  the whole street unrolls on the walk north to the kedai.
- **Interview now TELEPORTS home** ("jalan pintas penulis" fade via api.goto)
  — the walk-home is optional flavor, not a chore. Posts reordered: rumah
  saved FIRST (bangun's rate limit lives on the row), then /api/bangun with
  handle, plan applied + persisted (localStorage nf_plan — LLM decor now
  survives reloads; buildRumah re-applies).
- **Kedai malam**: rakBotol shelf behind the bar, Nona polishing a glass
  (2-frame), 3rd stool + 3 new patrons, gelas on counter/table, menu adds
  Es Sirup + Wedang Jahe.
- **Ubah rumah** (door menu): links edit/add/delete (max 4), vibe, quote,
  display name (@handle immutable — it's the address), rebuild through the
  fade + saveRumah to worker.
- **Worker guards** (before NIM key lands): /api/bangun = per-IP brake
  (10/min, in-isolate Map), 4KB body cap, 5/day per handle in D1
  (bangun_day/bangun_count, charged on attempt, UTC day). /@handle links
  https-only (javascript: hole closed). rumah table pre-baked with
  secret_hash for tomorrow's claim-token auth (migration-free).
- **Assets**: Ninja dog + chicken re-fetched via itch download_url flow
  (CC0, SUMBER rows; full roster note: pack also has cow/horse/pig/parrot/
  frog etc.). build.py utf-8-explicit (Windows cp1252 fix) + new sheets;
  bundle 344KB.

**Scout verdicts logged**: voxel REJECTED (WebGL vs doctrine, kills the CC0
pipeline) — stay 16px pixel; free-VPS fallback ranking Deno Deploy → Render
→ Oracle Always Free (Fly/Railway no longer free) — CF free tier fine.
Bottles: no CC0 tavern pack exists; rakBotol custom was the right move
(Pop Shop Bottles pack = in-game-only license, unneeded).

**⚠️ ACCEPTED RISK (Yose's explicit call, fix TOMORROW)**: /api/rumah is an
open upsert — anyone can overwrite any @handle. Claim-token design is ready
(plan file "Tomorrow" section; schema already has secret_hash): first POST
mints a token, updates require it, /api/rumah/cek recovers. ~1-2h drop-in.

**Needs-from-Yose**: (1) NIM_API_KEY repo secret → re-run deploy → /api/bangun
lights up (guards already live); (2) phone playtest v0.7 at nonafiksi.pages.dev
— teleport beat, street life + own house + sign, kedai shelf reading
(sirup/jamu, his eye), ubah rumah + reload persistence, QR card scan from a
second phone; (3) unchanged ledger (domain, Mayar, paid asset tail, Bapa
Benny, song licensing).

## 2026-07-06 (arc 2) — v0.6: title screen, joystick, cafe makeover, QR card, Oligarki Bab 1, NIM home-builder

Yose's second vision dump executed same-day (plan:
/root/.claude/plans/fuzzy-chasing-sprout.md "Arc 2"):

- **Controls**: D-pad removed; floating thumb joystick spawns faint at the
  touch point anywhere on the screen (analog speed, deadzone 6px/28px clamp);
  one-time "GESER JEMPOLMU" hint (localStorage nf_hint). Ctx action button
  moved BELOW the canvas (it overlapped dialogs). Dialogs got a ✕ close.
- **Title screen**: canvas attract mode (street, slow camera drift) + MULAI /
  PULANG-KE-RUMAHMU / KREDIT; character select (boy/v1/v4/woman, walking
  previews, localStorage nf_char). First-timers now start IN the warung.
- **Warung v3**: checkerboard floor (engine `floorStyle:'checker'`, from
  Yose's reference screenshots), lounge corner (Ninja InteriorElements sofas
  + pouffe + TilesetInteriorFloor rug — crops verified visually), bookshelf/
  register/hanging-plants string-map sprites, bar stools, kucing with
  periksa. Catalog now 40 components.
- **Walk-home arc**: interview no longer teleports; pulang exit unlocks, first
  home entry offers the **QR profile card** (vendored Project Nayuki
  qrcodegen, MIT, author-compiled JS — functionally tested; SUMBER.md row).
  Card = canvas 384×640, avatar + nama + @handle + QR to
  nonafiksi.pages.dev/@handle, navigator.share with download fallback.
  Door menu re-shares anytime. Interview added a vibe question
  (hangat/rapi/ramai → generateHome varies).
- **Aksara returning-chat**: phase-keyed small talk pools, then menu with
  **choices + free-typed input** (engine `onfree`); typed text → curhat
  drawer (localStorage nf_curhat, capped 20) + POST /api/bicara when online.
  Curhat menu item unlocked as local-notebook version (honest framing).
- **Oligarki Bab 1**: 3 scenes (oli1 kantor dinas / oli2 restoran / oli3
  konferensi pers), play AS Pak Bakri (fiksi-komposit disclaimer popup,
  playerSheet swap), euphemism choices with varied deadpan replies,
  worsening-headline gag, Aksara colophon on return. Old kantor cuplikan
  scene removed.
- **Worker v2**: POST/GET /api/rumah (D1 `rumah` table, size caps),
  /@handle honest HTML pages (placeholder never lies 404), POST /api/bangun
  — NIM deepseek-v4-pro designs home decor, **deterministic validator gates
  everything** (catalog membership, bounds, door zone, cap 10); client
  applyPlan re-validates + falls back to deterministic generateHome. CI got
  an optional NIM_API_KEY secret-put step.
- **Research**: docs/research/npc-steering-cookbook.md (scout, receipts
  inside): NeMo Guardrails library CANNOT run on Workers; NemoGuard guard
  MODELS are callable via same NIM key; Groq strict json_schema only on
  gpt-oss models; Gemini = strongest Indonesian lane; full Nona system-
  prompt contract draft included.

**Deploy state**: run 28817911523 — Pages ✅ (v0.6 LIVE at
nonafiksi.pages.dev, verified strings in prod), D1 step ❌ (token still
lacks D1:Edit + Workers Scripts:Edit — Yose confirmed he'll add), Worker
skipped. When token is fixed: re-run workflow, everything bootstraps.
**Client API base**: localStorage `nf_api` (empty = offline mode); after
first successful worker deploy, hardcode the workers.dev URL in game.js and
add a Pages `_redirects` for /@handle → worker.

**Needs-from-Yose**: (1) token scopes ↑, (2) NIM_API_KEY as repo secret,
(3) playtest v06 (phone copy: nonafiksi-v06.html) — joystick feel, title,
cafe, card share, Oligarki; (4) unchanged ledger (domain ~1 month, Mayar,
paid asset tail ~$6.50, Bapa Benny, song licensing).

## 2026-07-05 (later) — Name confirmed; Nona Aksara; warungs are presses

Yose confirmed **NonaFiksi** as the product name and overturned (correctly)
the blanket Aksara-separation rule: the presskeeper character is **Nona
Aksara** — same Aksara at every warung press in the world, personification
of writing, communal-AI thesis in-world. Two guardrails hold: she's never
marketing copy (found, not advertised), and in-fiction she's presskeeper/
witness, never author (authorship = the teller; insulates her and the name
from all story content incl. the satire). Also decided: **warung SMB tier
= open your own story press** — patronage colophon + hub presence + venue
are one product ("buka warung, buka percetakan"); community presses same
mechanic. Constitution updated accordingly. Next unchanged: Wave-1 design
round, now including Nona Aksara's visual identity.

## 2026-07-05 — Conception day: brainstorm → constitution → repo

Four-turn brainstorm (Yose × Claude Fable) went from "what SaaS could sell
in a day" to the full concept: **a story press** — Persona Forge (URL →
receipts-backed character card = link-in-bio), Story Press (agent interview
→ playable JSON-manifest story), one pixel world with a warung hub, kopi
energy economy, flagship stories (oligarch satire; Zakheus Pakage under the
Zakheus rule), diegetic labeled sponsorship (patronage colophon model, no
billboards), warung SMB tier later.

State now:
- Constitution written: `.claude/NORTH-STAR.md` (concept, doctrine, waves,
  guardrails, ledgers). Read it first.
- Research verified with receipts (2 cookbooks in `docs/research/`):
  assets/engine (inkjs + canvas, zero-install browser asset pipeline) and
  infra/payments (CF Workers+D1+KV free, Groq-first LLM gateway, Mayar/
  KaryaKarsa/Trakteer payment rails for an Indonesian individual; Stripe/
  Lemon Squeezy confirmed closed). NIM entry corrected by Yose: renewing
  free tier, not one-time trial.
- Working title **nonafiksi** (Nona Fiksi / nonfiksi pun) — Yose has veto;
  repo renames in one command.
- Nothing built yet. No code. This was the talk-it-out phase, per house
  rules, and it's done.

Next: **Wave 1 design round** — card mock to award-bar standard + name
shortlist, Yose reacts by screenshot. Engine code only after design lands.

Needs-from-Yose right now: nothing blocking. Ledger lives in NORTH-STAR.

## 2026-07-05 (night) — Sidang Desain 01 shipped

Design round 01 published as an artifact (docs/design/round-01.html, fonts
embedded OFL woff2, fully self-contained): Nona Aksara's first pixel
portrait (24x28, sanggul + kunyit pen, kebaya tinta with kutubaru), the
Tinta & Kopi palette (6 tokens), Press Start 2P + VT323 type pairing, the
persona card mock (Yose as demo, CONTOH stamp, receipts under every stat,
kopi counter in the colophon), and three directions: A Percetakan Malam
(recommended — world dark warm wood, printed artifacts carry the light),
B Kertas Siang (paper world, ink voice), C Arkade CRT (arcade night,
riskiest). Signature interaction mocked: Nona's typewriter dialogue +
thought-bubble recap. Awaiting Yose screenshot reactions.

## 2026-07-05 (late night) — Proto Warung 01: the world is walkable

Yose reacted to Sidang Desain 01: loves the aesthetics/direction; asked for
a walkable side-view warung scene instead of a page ("people walking in to
a shop"), and whether a light lib is needed. Answer shipped as a PLAYABLE
prototype (docs/design/proto-warung-01.html + phone copy): 320x180 canvas,
zero libraries, vanilla rAF loop — night warung interior (window w/ moon,
stars, skyline; shelf jars; menu board; flickering hanging lamp; patron w/
steaming cup), full-body player sprite with 2-frame walk + flip, touch
(hold ◀ ▶) + keyboard controls, proximity-triggered BICARA with Nona Aksara
behind the bar, 3-line typewriter dialogue, kopi counter in HUD,
reduced-motion respected. Yose mid-build recap confirmed the core loop:
curhat at the bar → Nona retells → the retelling IS the playable story.
Also fixed: round-01 mojibake (missing <meta charset=utf-8> when opened as
local file — artifact wrapper adds it, local copies must carry their own).
Lib verdict logged: vanilla canvas for world; anime/gsap = DOM tweeners
(UI-only, later, maybe); three.js = WebGL 3D, against doctrine; if scenes
multiply → Kaplay/Kontra/LittleJS from the assets cookbook.
Delivery convention while laptop is serviced: every visual lands in
/mnt/internal-storage as a self-contained HTML.

## 2026-07-06 (small hours) — Proto Jalan Kisah + persona worlds + asset haul

Yose reacted to proto-01 running on his phone (loved it) with reference
screenshots (2x Eastward streets + a pixel-moods collage — saved to
docs/design/references/) and two direction shifts, both adopted:
(1) top-down 3/4 view instead of side-view — also solves the portrait-phone
dead-space his screenshot revealed; (2) "everyone gets their own world":
agents assemble each user's world from zone/component templates, stitched
with their stories, editable later (manifest edits, never pixels) — written
into NORTH-STAR under Persona Forge as Persona World. Grounding recorded:
Eastward is dense scene-based, NOT open world — our model is the "open
neighborhood" that grows; density over size.

Shipped proto-02 (docs/design/proto-jalan-kisah-01.html + phone copy):
portrait-native 180x320 canvas, top-down night street "Jalan Kisah" —
4-dir walking w/ collision, camera follow, warung facade + door with scene
transition into the bar interior, depth-sorted entities, bunting, lamp glow
pools, fireflies, cat on crate, 2 NPCs, Nona + dialogue inside. Still zero
libraries, ~500 lines.

Asset scout returned (docs/research/topdown-assets-cookbook.md, licenses
QUOTED with URLs): foundation = Ninja Adventure pack (CC0 incl. commercial,
East-Asian town/village/interiors/water + 50 NPCs + music); Kenney RPG
Urban + Roguelike City (CC0); OGA farming crops CC0 with RICE, CASSAVA,
COFFEE; forest + beach CC0 picks; LimeZu Serene Village CC-BY (one credit
line). DO-NOT-USE list: Sprout Lands free (non-commercial), Cainos/PIPOYA
(fine in-game, forbidden in public repos). AI-generated asset sites:
AVOID — license claims unbacked (AI output likely uncopyrightable, no
provenance); CC0 haul makes them unnecessary. Plan: palette-remap ingestion
(quantize all imports to Tinta & Kopi ramp) = style coherence across packs.

## 2026-07-06 (morning) — Proto Jalan Kenangan + real assets + backend scaffold

Street renamed JALAN KENANGAN (Yose, after the song — NOTE: an actual MIDI
medley of "Sepanjang Jalan Kenangan" needs composition licensing; original
chiptune inspired-by is the safe path. Parked.)

Shipped proto-03 (docs/design/proto-jalan-kenangan-01.html + phone copy,
221KB self-contained): REAL CC0 assets — Ninja Adventure houses/trees/
villagers/cat (downloaded via itch download_url flow, 89MB zip, extracted
5.2MB of needed sheets, zip deleted), palette-graded to Tinta & Kopi at
load with MALAM/ASLI toggle in the HUD (the remap pipeline, live). Bigger
characters via lower internal res (144x256, chars 16px native = ~11% screen
width vs 8% before). NPCs patrol with 4-dir walk anims. Known round-1
seams: sheet block coordinates eyeballed (houses certain, tree crop may
clip), NPC walk-direction row mapping unverified (DIRROW constant, one-line
fix), interior still procedural. Assets committed to web/assets/ with
SUMBER.md ledger (CC0-only rule).

Backend scaffolded per agent-memory research verdict (docs/research/
agent-memory-cookbook.md): Cloudflare Agents pattern — Worker routes +
NonaAgent Durable Object (per-user SQLite memory: episodic + distilled
facts, free plan new_sqlite_classes VERIFIED) + D1 canonical store
(users/kopi/stories with unlisted-by-default) + LLM gateway stub with
scripted Layer-0 fallback; guardrail reducer owns all state. PydanticAI
assigned to the GitHub Actions batch lane (distillation/compilation).
Mastra/LangGraph JS eliminated (Workers breakage, receipts in cookbook);
Letta disqualified (3-agent hosted cap). Deploy: scaffold + CI workflow
ready, blocked on ONE Yose action (docs/DEPLOY.md: Option A CF API token
recommended vs Option B public repo). Kenney city + OGA farm (rice/
cassava/coffee!) + beach sheets also in web/assets for next protos.

## 2026-07-06 (midday) — v0.4 FOUNDATION: the engine is data-driven

Plan approved (docs/PLAN.md) and Waves 0-2 + core of 3-4 shipped in one build
(dist/nonafiksi.html, 240KB single file; phone copy nonafiksi-v04-foundation
.html; also on claude.ai artifact).

Architecture now: web/engine.js (generic: loader + night-grade, phases,
FX registry incl. bunting/window/rays/smoke, DECOS parametrics, depth sort,
dialog with say/input/choices, periksa popups, collision, camera, custom
sprite MAPS) + web/catalog.json (28 components with tags — the .aksara
component catalog v0) + web/aksara/scenes.json (street/warung/kantor as
pure data) + web/game.js (wiring: onboarding interview, story menu) +
tools/build.py (single-file bundler) + tools/pngbox.py (pure-stdlib PNG
sprite-bbox finder — NO MORE eyeballed crops; house/tree coords now exact).

Playtest fixes IN: beyblade walk (cols=direction), dialog advance (LANJUT
button + tap-dialog), verified tree crops. Features IN: real-time day/night
(pagi/siang/sore/malam; sprites raw by day per Yose's ASLI verdict, graded
malam; window fx phase-aware with sun rays; phase override button in HUD),
cozy warung v2 (4 tables/chairs/steaming cups, cake rack, coffee machine,
big menu — all periksa-able; Nona in APRON), onboarding (first talk = name
+ link interview -> generates RUMAH: shareable-home v0 with link racks that
popup + OPEN, poster/frame/music placeholders honest-labeled), street
PULANG exit (locked until home built), Kisah menu (Oligarki cuplikan scene
playable w/ fictional-composite disclaimer; Zakheus + Curhat locked with
in-fiction reasons), persona in localStorage.

Known seams: chicken/dog sprites lost with deleted zip (re-fetch via
documented itch flow later); warung/kantor scene coords untuned; NPC walk
direction order unverified (DIRCOL constant); hosted mode needs a fetch
shim (Wave 5). Next: Yose playtest -> tune -> Wave 5 deploy on CF token.

## 2026-07-06 (afternoon) — 🚀 LIVE: nonafiksi.pages.dev + v0.5

Yose added CLOUDFLARE_API_TOKEN + ACCOUNT_ID as repo secrets himself. CI
pipeline (pages-first ordering) shipped the single-file build to
**https://nonafiksi.pages.dev** — the game is publicly playable. D1 +
Worker steps still FAIL: token lacks D1 scope (auth 10000; wrangler whoami
confirms valid Account token, Pages scope present). NEEDS-YOSE: edit token
at dash.cloudflare.com/profile/api-tokens -> add Account permissions
**D1:Edit** and **Workers Scripts:Edit** -> re-run deploy workflow; then
backend (kopi API + NonaAgent DO) goes live with zero further changes.

v0.5 shipped (also to phone as nonafiksi-v05.html): PHASE-AWARE GROUNDS —
green grass + tan path by day with subtle blue-white noon flecks, ember
darks at night; lamp glows/pools/fireflies now OFF by day, half-strength
at sore, full at malam (fixes the "always a dark filter" playtest verdict).
D-pad: ◀ ▶ at screen edges, ▼▲ centered; desktop gets arrows/WASD + E/
Enter/SPACE. Semantic catalog fixes from playtest screenshots (pngbox gave
exact boxes but wrong MEANINGS): market stall relabeled kios-jajan and
placed deliberately (periksa: bakso/sate/es teh), rock renamed batu,
proven top-row thatched houses restored, new pohon crop from leftmost
big tree. Fonts committed to web/fonts (CI-safe build).

Scout running: Indonesian biomes (kampung plank/stilt houses, sawah,
jungle, swamp, savannah, volcano backdrops, ruko/kota), cafe interior
packs from Yose's references (Penzilla, CaptainSkolot, LimeZu re-check),
pixel-editor/procgen/LPC tooling verdicts. Next wave when it lands:
modern-cozy warung interior + biome catalog expansion + editor decision.

## 2026-07-06 (afternoon 2) — Biome/cafe/tooling scout returned

Cookbook EXPANSION 2 appended (docs/research/topdown-assets-cookbook.md,
585 lines, licenses quoted). Verdicts: NO free stilt-house or rice-paddy
pack exists ANYWHERE — kampung = Ninja+Serene remaps + ~3 custom stilt
sprites; sawah = CC0 water autotile under owned CC0 rice sprites (recipe,
not gap). Savannah: LPC Baobabs CC-BY (botanically right for NTT). Volcano:
ansimuz Mountain Dusk parallax CC0 (one silhouette edit = Merapi). Kota:
+MetroCity chars CC0; sea/boats: Kenney Pirate Pack CC0. CAFE: Yose's
references BOTH fail — CaptainSkolot badge contradicts its own prose
(BY-NC-SA, DO-NOT-USE), Penzilla = paid per-project license (skip); stack
= Kenney Indoors + Ninja CC0 + Powered By Decaf (free commercial, private
store) + LimeZu $1.50 gold standard. TOOLING: no embeddable pixel-editor
lib exists -> build ours (~200 lines); LPC generator CC-BY-SA/GPL + 64px
-> skip; rot.js dungeon-shaped -> skip; ADOPT kchapelier/
wavefunctioncollapse (MIT) as optional agent-terrain brain; autotiling
vanilla. Paid tail parked to needs-from-Yose: LimeZu $1.50 + Hana Caraka
(Bagong Games, INDONESIAN-MADE) $4.99 ≈ $6.50 total.

## 2026-07-13 (early AM) — AKSARA ALIVE (LLM-live conversations) + rumah v2

**She speaks for herself now.** Yose's call: "no template outputs — everything
LLM generated", immersive failures ("hold on, I got a call"), GLM 5.2 on NIM
(his key landed; his ISP blocks NIM locally but the WORKER calls from
Cloudflare's edge — verified working from prod).

Worker (7 commits, all CI green, live-drilled):
- **LLM gateway** `llmChat()`: lane ladder GLM-5.2 (12s probe window) →
  qwen3-next-80b-a3b (35s) → gemini-2.5-flash (30s, when GOOGLE_API_KEY
  lands) → llama-3.1-8b floor (12s). Per-lane 90s circuit breaker (a dead
  queue never taxes every message); `<think>` stripped; all OpenAI-shaped.
  LIVE-MEASURED 2026-07-13 peak: GLM 524s (free-tier queue), llama-70b 503
  ResourceExhausted, qwen3-next ~17s/200tok, llama-8b 1.3s/200tok, gemma-3
  end-of-life 410. GLM stays primary and reclaims the mic when its queue
  clears.
- **/api/aksara** → NonaAgent DO per sesi (nf_sesi uuid): episodic table =
  her real memory (drilled: she recalled the interview items in a later
  visit unprompted). Contract {say,choices[{label,value}],expect,patch,done}
  with deterministic validator: say ≤260 + emoji scrub (only ☕ ✦ survive),
  ≤4 choices, patch whitelist (nama/links-https/vibe/facets-GANGS/quote≤90),
  templated opening rows as backstop (BUKA_BARU/BUKA_LAMA). choice values
  can be #commands: #ubah #kartu #oligarki #kunci #pergi (client dispatches
  locally). 60 turns/day per DO (in-fiction sleepy close), 20/min IP brake.
- **/api/llm/ping** — per-lane health from the edge (?model= catalog probe,
  ?max= real-generation timing, ms). This is how the queue truth was found.
- /api/bangun swapped onto the same gateway (deepseek retired). /api/health
  now reports `aksara: nim|gemini|mati`.
- Full interview drilled via curl end-to-end: buka → nama patch ("namaku
  Warsito, panggil saja Sito" → {nama:"Sito"}) → links+vibe patch → quote →
  done:true with complete accumulated patch. Returning-player buka greets
  by name with standard choices.

Client (game.js): AKSARA_LANE health probe at boot; live mode = kirim/render
loop (dialog steps built from her contract; expect:text ⇒ input, choices ⇒
buttons, both coexist via onfree); draftLLM accumulates interview patches →
commitInterview (claim → bangun → teleport, same path as before); returning
patches apply+save instantly (she can rename you in conversation). Failure
beats stay in fiction: TELEPON lines + retry; 2 strikes → she offers "PAKAI
BUKU CATATAN SAJA" (scripted flow, honest). Scripted wawancara survives ONLY
as boot-dark fallback.

Rumah v2 (engine generateHome + 7 new MAPS + catalog): whole house reads in
one glance (H224 < viewport, camY pinned). kasur-besar, lemari, meja-kerja
(w/ kursi), rak-tautan ×4 (proper bookshelves w/ nameplates = links),
jam-dinding, foto-string (polaroid wall, R2-wave teaser), buku-tamu on a
stand — buildRumah fills it with the latest 3 REAL guest notes via
/api/tamu/baca. New components are interior-tagged so Aksara's bangun
designer can place them too.

Gotcha logged: `node --check` on worker/index.js silently passes CommonJS
parse; esbuild caught a duplicate const it missed. Drill now copies to .mjs
first (memory updated).

Open on Yose: GOOGLE_API_KEY repo secret (slots in above the 8b floor);
phone playtest of the live interview; judge qwen's voice vs GLM's when the
queue clears (swap order is one line). Next waves queued: street generator
(per-viewer plots, warung-top grammar, y-culling, gapura + directional wipe
+ auto-open mouths), halaman decoration + kotak surat.
