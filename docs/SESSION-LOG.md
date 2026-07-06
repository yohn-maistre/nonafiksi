# Session log — newest first

Written for a reader with amnesia. Each entry: what happened, what's true
now, what's next.

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
