# NonaFiksi — Foundation Plan ("get the hard stuff out of the way")

## Context

Three playable protos in, Yose's playtest (screenshots 2026-07-06) surfaced 2 bugs
and a full product vision: cozy day/night world, the HOME as the shareable
linktree, onboarding through Nona's interview, story unlocks, per-user URLs, and
a paid resident-AI character. This plan fixes the bugs, lays the engine + backend
foundation so that ANY future model/session can build features as data + small
patches, and sequences the product waves. Constitution: `.claude/NORTH-STAR.md`.
Research receipts: `docs/research/*.md` (infra/payments, agent-memory, top-down
assets). Repo: `~/workspace/code/nonafiksi` (all code so far authored this
session; protos in `docs/design/`, assets + ledger in `web/assets/`).

## Wave 0 — Playtest fixes (proto-03 patch, same file pattern)

1. **Beyblade NPCs**: Ninja `Walk.png` (64×64) is **columns = direction, rows =
   frame** — current code has it inverted (`drawChar` in proto uses
   `x=(frame%4)*16, y=DIRROW[dir]*16`). Swap: `x=DIRCOL[dir]*16, y=frame*16`,
   direction order verify in playtest (start with down/up/left/right, one-line
   constant fix if shuffled). OldWoman uses SpriteSheet.png — keep frame (0,0).
2. **Stuck dialogue**: context button is hidden while `st.dlgOn` and the ▼ has no
   handler → phone players can't advance. Fix: (a) while `dlgOn`, ctx button stays
   visible as `▼ LANJUT` (calls `adv()`), (b) `pointerdown` on the whole dialog
   box also advances, (c) after last line, dialog closes and ctx returns.
3. **Tree crop clipping** (visible in screenshot): re-crop tree block from
   TilesetNature (isolated canopy+trunk, no neighbor bleed); fix warung counter
   colliders (player can stand "inside" counter gap).

## Wave 1 — Engine foundation (the real deliverable)

Refactor proto-03 into `web/` as a small manifest-driven engine. **After this
wave, worlds/stories are DATA — other models build by writing JSON + tiny draw
helpers, not by re-authoring the engine.**

- `web/index.html` — shell (HUD, canvas, dialog, D-pad, popup layer).
- `web/engine.js` — extracted from proto-03 (loader + palette-grade, input,
  camera, colliders, depth-sorted ents, dialogue, scene switch, interact).
- `web/catalog.json` — **the component catalog** (NORTH-STAR "world grammar"):
  `{id, sheet, sx, sy, w, h, collider?, interact?: {type: text|link|popup},
  tags: [kampung|kota|interior|nature|...]}`. Seed with everything used so far
  (houses, trees, bushes, lamps, tables, counter, jars…) + new cafe set.
- `web/aksara/*.json` — scene manifests (`jalan-kenangan`, `warung`,
  `rumah-template`): `{worldType, size, ground, placements:[{component,x,y,
  props?}], npcs, exits, talkZones, lines}`. Engine renders any valid manifest
  (validate on load, fail loud with the offending entry).
- **Interactivity (Pokémon rule)**: `periksa` action on any component with
  `interact` — DOM popup (title/body/thumbnail/OPEN link). One popup system
  serves signs, racks, posters, cake display, everything.
- **Day/night, real-time**: phase from device clock (pagi 5-10, siang 10-15,
  sore 15-18, malam 18-5) + HUD override toggle (keep for design review).
  Per-phase grade: siang ≈ light grade preserving pack vibrancy (playtest
  screenshot shows ASLI reads great in daylight), sore = amber bias, malam =
  current Tinta&Kopi ramp + ember glows. Implemented as 2-3 RAMP variants in
  the existing `gradeImg` (cheap: pre-grade per phase at load).
- Protos stay in `docs/design/` as history; new builds ship from `web/` via the
  same inject-to-single-file script (keep phone-copy delivery to
  `/mnt/internal-storage/nonafiksi/`).

## Wave 2 — Cozy pass (his cafe vision, pure content once Wave 1 lands)

- **Warung v2** (edit `aksara/warung.json` + catalog additions): more tables +
  chairs + plates/cups (Ninja `Interior/Elements.png` — extract from scratchpad
  `assets/ninja/`, still on disk), big menu board, **cake display rack, coffee
  machine, Aksara-in-apron sprite variant** — 3 custom string-map sprites drawn
  in-palette (same technique as the Nona portrait, `spr()` helper).
- Sun rays through left windows during pagi/siang (diagonal alpha gradients),
  hearth-ember lighting at malam (deeper flicker, warm pools).
- Street cozy: chimney smoke particles, window lights per phase, more props
  (crates, sacks, chickens from Ninja Animal folder).

## Wave 3 — RUMAH: the shareable linktree home (the product core)

- `rumah-template.aksara.json`: home interior; **link racks** = display tables;
  `periksa` → popup with link preview + OPEN. Posters/quotes = wall components
  with text. Music = `<audio>` element v1. YouTube = thumbnail + embedded
  iframe in popup (works on real domain; blocked inside claude.ai artifacts —
  note in popup fallback). **Instagram: NO free API (Basic Display deprecated)
  — v1 is user-uploaded photos + link-out; never fake it** (honest-labels).
- **Aksara-built preset**: `persona.json` → home manifest generator (start as a
  deterministic JS function; later the interview agent fills persona.json).
- Editing v1 = swap presets + rearrange racks (manifest editor UI). Full pixel
  editor = parked (NORTH-STAR tangent ledger).
- Door → depart menu overlay: Jalan Kenangan / locked story slots.

## Wave 4 — Onboarding + story unlocks

First visit: spawn on Jalan Kenangan → cafe → scripted interview (dialog box
gains an input mode: name, handle, links — no LLM needed for v1) →
"kubangun rumahmu" → fade → generated home. Nona's menu unlocks: **Oligarki
ch.1** (scripted manifest, composite characters only — UU ITE), **Zakheus**
slot shown locked ("ditulis dengan restu keluarga"), **Curhat** greyed until
backend (token-gated). All flows = manifests + dialog scripts, zero backend.

## Wave 5 — Backend live (needs the ONE Yose action)

- Deploy per `docs/DEPLOY.md` Option A: Yose creates CF API token → gh secret →
  run `.github/workflows/deploy.yml` → `wrangler d1 create` → paste id in
  `wrangler.toml` → apply `worker/schema.sql` → Worker live.
- **Per-user URLs, the honest architecture**: `*.pages.dev` wildcards per user
  are NOT a thing. v1 = path routing `nonafiksi.pages.dev/@yose` (Worker
  serves home manifest by handle). The SAME Worker already parses
  host+path, so when Yose buys a domain (~1 month, ~US$10/yr): wildcard DNS
  `*.nonafiksi.id` → Worker route → `yose.nonafiksi.id` with ZERO migration.
  Manifests in **D1** (KV's 1k writes/day wall — receipts in infra cookbook);
  user photos later in **R2 (verify current free-tier limits before wiring)**.
- Auth: GitHub/Google OAuth on the Worker, sessions in KV (reads are fine).
- Kopi/token accounting in D1 (schema committed); curhat = NonaAgent DO
  (committed scaffold) + Groq gateway with scripted Layer-0 fallback.
- PydanticAI batch lane: Actions workflow skeleton for nightly memory
  distillation + story compilation (mirrors detak-detik pattern).

## Wave 6 — "Penjaga": the paid resident AI

Resident character in any place (home/garden/forest/warung) grounded in the
owner's persona + links content: klerk-style citation guardrails, chat first,
voice later (premium). One component, two markets (personal + SMB warung tier).
Requires Wave 5. Token-metered; never on the public free path.

## Assets to add (all sources already licensed-verified)

From scratchpad `assets/ninja/pack/` (extract more, add rows to
`web/assets/SUMBER.md`): `Interior/Elements.png` (furniture/food), animals
(Chicken, Dog), 2-3 more villagers. Kenney city + OGA farm/beach sheets already
committed for kota/sawah/pantai world types.

## Verification

- `node --check` on engine/worker; playtest via `/mnt/internal-storage/
  nonafiksi/` single-file builds + Yose screenshot rounds (walk dirs, tree
  crops, dialog advance, day/night phases).
- After deploy: `gh run watch --exit-status`, then curl `/api/health`,
  `/api/kopi`, `/api/bicara` on the live Worker; report URL + SHA.
- Each wave: commit + session-log entry (amnesia-reader style) before moving on.

## Needs-from-Yose (in order)

1. Wave-0/1/2 screenshot reactions (esp. day-phase grades: your ASLI street
   shot suggests daylight should keep pack vibrancy — confirm).
2. CF API token when Wave 5 starts (5 min, unblocks deploy).
3. Domain decision in ~1 month (`nonafiksi.id`? enables wildcard subdomains).
4. Later, keys-last: Mayar, Groq/Gemini keys, Resend.
5. Parked: "Sepanjang Jalan Kenangan" medley = composition licensing; original
   inspired-by chiptune (BeepBox) is the safe path.

**Execution order: 0 → 1 → 2 → 3 → 4 (all phone-testable, no keys) → 5 → 6.**
