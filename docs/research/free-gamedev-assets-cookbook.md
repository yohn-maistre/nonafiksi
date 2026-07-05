# Free game-dev assets cookbook — text-forward pixel RPG on a phone

Compiled 2026-07-05. Constraint set: Termux/PRoot Debian host (~3.6GB RAM,
storage >90% full), static deploy (GitHub Pages / Cloudflare Pages), no heavy
build toolchains. Game shape: branching narrative + pixel portraits/scenes/UI,
one engine, multiple storyline packs (Indonesian/Papuan settings).

**Verification labels** (honest-labels doctrine):
- `[URL✓]` = URL returned HTTP 200 on 2026-07-05 via curl from this host.
- `[license: check-on-download]` = license claim from prior knowledge; confirm
  on the asset page before bundling. Deep per-pack itch.io license crawl is
  PENDING (session-limit cut the scout; rerun after 6pm UTC if wanted).

## 1. Pixel art packs (best-first)

1. **Kenney.nl** — https://kenney.nl/assets `[URL✓]` — the gold standard;
   essentially everything CC0 `[license: check-on-download]`. Relevant packs to
   pull: *Pixel UI Pack*, *Tiny Town*, *Tiny Dungeon*, *RPG Urban Pack*,
   *Input Prompts* (for touch/keyboard hints). Small downloads (a few MB each)
   — storage-friendly. Fit: UI chrome, prototyping tiles. Generic style — fine
   for the oligarch storyline's offices/city, NOT for cultural content.
2. **OpenGameArt.org** — https://opengameart.org `[URL✓]` — filter by license
   (CC0 / CC-BY 3.0/4.0). Search terms that worked historically: "tropical
   tileset", "jungle tileset", "village", "portrait pixel". Every download page
   states its license explicitly — record it per asset in our own ledger.
   Fit: gap-filler for vegetation/terrain closer to Papuan highlands than
   Euro-fantasy defaults.
3. **itch.io free packs** — https://itch.io/game-assets/free/tag-pixel-art
   `[URL✓]` — huge pool, but "free" ≠ "free license": many forbid
   redistribution or commercial use. Rule: only packs whose page states
   CC0/CC-BY or "commercial use OK"; save a screenshot/quote of the license
   text into our ledger at download time. Deep crawl pending.

## 2. Fonts (Latin coverage = full Indonesian support)

- **Press Start 2P** — https://fonts.google.com/specimen/Press+Start+2P
  `[URL✓]` — OFL. Chunky 8-bit display font; headings/logo, tiring for body.
- **VT323** — https://fonts.google.com/specimen/VT323 `[URL✓]` — OFL. Terminal
  monospace; ideal for long narrative text, very readable at small sizes —
  right choice for a text-forward game on phone screens.
- Also on Google Fonts (OFL, same site): *Silkscreen*, *Pixelify Sans* — spot
  check specimens when choosing. Self-host the woff2 (static deploy, no CDN
  dependency).

## 3. Audio (music + SFX)

- **jsfxr** — https://sfxr.me `[URL✓]` — in-browser retro SFX generator;
  output is yours. Zero storage cost until export. First stop for blips/hits.
- **BeepBox** — https://beepbox.co `[URL✓]` — in-browser chiptune tracker;
  compositions are your own work. Runs fine in a phone browser. Music without
  downloading a single pack.
- **Kenney audio packs** — under https://kenney.nl/assets `[URL✓]` — *Interface
  Sounds*, *RPG Audio*; CC0 `[license: check-on-download]`.
- **Freesound** — https://freesound.org `[URL✓]` — use the license filter
  (CC0 only, to skip attribution bookkeeping); ambience layers (forest, rain,
  crowd). Account needed to download (free).

Generator-first strategy (jsfxr + BeepBox) is the storage-cheapest and gives
the game a coherent original sound instead of stock-pack déjà vu.

## 4. Engine / libs (ranked for our constraints)

1. **inkjs** — https://github.com/y-lohse/inkjs `[URL✓]` — JS runtime for
   Inkle's Ink narrative language. THE right core for branching-story games:
   story logic lives in `.ink` files (writable in any editor on this phone),
   compiled to JSON, played by a ~small runtime. Storyline packs = ink files.
   No build step required beyond ink→json compile (inklecate or inkjs compiler).
2. **Plain canvas/DOM + vanilla JS** — zero dependency, zero build, total
   control; for a text-forward game with pixel portraits this honestly covers
   it. Pair with inkjs and you're done.
3. **Kontra.js** — https://github.com/straker/kontra `[URL✓]` — micro game lib
   (built for js13k, i.e. ~kb-scale); use only if we add real 2D scenes.
4. **LittleJS** — https://github.com/KilledByAPixel/LittleJS `[URL✓]` — tiny,
   fast WebGL-backed engine; more capable, still light. WebGL on budget phones
   is a risk (our own doctrine: dot-grid plates over WebGL) — bench first.
5. **Kaplay** — https://kaplayjs.com `[URL✓]` — friendliest API, heavier than
   Kontra/LittleJS. Fallback if DX matters more than bytes.
6. **Twine** — https://twinery.org `[URL✓]` — great for prototyping branches
   in-browser, but Ink scales better to multi-storyline structure; use Twine
   only for sketching.
7. **Bitsy** — https://www.bitsy.org `[URL✓]` — charming micro-RPG maker;
   too constrained for the real game, excellent for a teaser/proof vignette.

## 5. Art & map tools that run here

- **Piskel** — https://www.piskelapp.com `[URL✓]` — pixel-art editor in the
  browser, works on phone; exports spritesheets/PNG. Primary art tool.
- **SpriteFusion** — https://www.spritefusion.com `[URL✓]` — web-based tilemap
  editor, exports JSON; replaces desktop Tiled (which is too heavy to install
  here — standing rule: don't install).
- jsfxr + BeepBox (above) round out the all-in-browser toolchain: **zero
  installs needed for the entire asset pipeline.**

## 6. Hosting / save data

- **GitHub Pages** — already proven in this portfolio; static game = perfect.
- **Cloudflare Pages limits** —
  https://developers.cloudflare.com/pages/platform/limits/ `[URL✓]` — read
  this page at deploy time for current free-tier numbers (limits change;
  citing stale numbers violates our own receipt rule).
- **Saves**: `localStorage` first (text RPG state is tiny — KBs). Export/import
  save as a copyable string for device moves. No backend until players demand
  cross-device sync; then evaluate Workers KV free tier against the limits
  page above.

## 7. What no free pack will cover (custom-or-nothing)

- **Mee/Papuan cultural art for the Zakheus Pakage storyline**: portraits,
  honai architecture, dress, landscape identity. Stock "tribal" asset packs
  are a stereotype trap — do NOT adapt generic packs for this. Path: custom
  pixel art (Piskel, drawn from photo references + family guidance), or a
  commissioned Papuan artist when there's budget. This is identity-bearing
  content; treat like a cited fact, not a texture.
- **Oligarch-storyline specifics**: Jakarta skyline, government-office
  interiors, Indonesian visual props (warung, ojek, banners). Kenney's urban
  packs get 70% there; the telling details are custom.
- **Portraits in a consistent style** across both storylines — one artist
  hand (yours/Piskel or commissioned), never mixed packs.

## If we start tomorrow — the stack

1. Engine: **inkjs + vanilla JS/canvas**, no build step, no installs.
2. Story: `.ink` files per storyline pack; oligarch chapter first.
3. Fonts: **VT323** body + **Press Start 2P** display, self-hosted OFL woff2.
4. UI/props: **Kenney** CC0 packs (verify license line on each download).
5. Terrain/vegetation gap-fill: **OpenGameArt** CC0/CC-BY only, ledgered.
6. Portraits: custom in **Piskel**, one consistent hand.
7. SFX: **jsfxr**; music: **BeepBox** — original, zero downloads.
8. Maps (if needed): **SpriteFusion** JSON.
9. Deploy: GitHub Pages; saves in localStorage with export-string.
10. Asset ledger file in-repo from day one: every asset row = source URL +
    license + date (the game gets a `sumber` page too — house doctrine).
