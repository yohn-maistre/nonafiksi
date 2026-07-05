# NORTH-STAR — NonaFiksi (working title)

Read this first, every session. This is the constitution: concept, doctrine,
architecture, waves, ledgers. The session log (`docs/SESSION-LOG.md`) says
where we actually are; this file says where we're going and what never bends.

## The one-liner

**A story press.** An agent (Nona) interviews you — about your links, your
life, your warung — and presses the answers into a playable, shareable
pixel-RPG artifact. Your bio page is a character card; your journey is a
playable story; both live in one world with a warung at its center.

The name is the thesis: **Nona Fiksi** ("Miss Fiction") reads as *nonfiksi*
(non-fiction) — real stories, pressed through a fiction machine. Works in
English ears too ("nona-fiction"). NAME PENDING-YOSE (see ledger).

## What it is (the five organs)

1. **Persona Forge** — drop your URLs; agents read your actual content and
   forge a character card: pixel portrait (layered sprite parts, one
   consistent style), stats derived from *verifiable* public data with
   receipts on hover ("Craft 14 — 214 commits in 2025"), links as inventory
   items, bio in game-voice. Card = your link-in-bio page at `site/@handle`
   = your playable character = the OG share image. **One persona JSON, four
   renderings — one fact, one owner.**
2. **Story Press** — Nona interviews you (characters, decision points,
   place, stakes — a tabletop-GM session), recaps ("so your story goes
   something like this…"), and the thought-bubble opens on your finished
   playable story. **Signature interaction: the recap → thought-bubble
   reveal.** Stories compile to JSON manifests (scenes, branches, text,
   components from the shared library). **A story is data, never code.**
   Users compose from existing components like LEGO — coherent style for
   free, KB-scale storage, one renderer plays everything.
3. **The world** — warung kopi hub; personas walk it; your page is your
   kios. Flagship stories: *the oligarch chapter* (satire, fictional
   composites ONLY — UU ITE) and *the Zakheus Pakage chapter* (see the
   Zakheus rule). Flagships are manifests #1 and #2 — they eat the same
   dogfood as user stories.
4. **Kopi economy** — energy = cangkir kopi, a stored persistent balance.
   Free forever: playing stories, basic card. Costs kopi: pressing a story,
   LLM-NPC free chat, re-forges. 1 free story per account. Buying kopi =
   traktir. **Energy is an honest proxy for compute cost, disclosed in the
   colophon — never a dark pattern.** Never tax playing shared stories
   (that's the acquisition loop).
5. **Discovery** — later: the world map (stories glowing where they happen;
   coarse city-level location, optional `place` field in the manifest from
   day one), seasonal events fed by detak-detik's cited public data,
   guestbook-as-mini-quest.

## Doctrine (house rules, inherited and binding)

- **Citation-or-silence**: no stat without a receipt; unverifiable = shown
  as "unappraised". Absence is content.
- **Honest labels**: sponsored content marked, AI-driven characters
  disclosed in the colophon, quota exhaustion degraded *inside the fiction*
  ("the warung owner is dozing off") but documented outside it.
- **One fact, one owner**: persona JSON and story manifest are single
  sources; every surface renders from them.
- **Constraint is the style**: budget-phone rendering is the audience
  (Indonesia) and the aesthetic — crisp pixel plates, system-light, no
  WebGL until benched.
- **The Zakheus rule (non-negotiable)**: real historical people get
  scripted-only, sourced dialogue — no LLM improvisation on a real life.
  Zakheus chapter ships only with family blessing (Bapa Benny), custom
  art (never stock "tribal" packs — stereotype trap), honest framing
  ("a dramatization based on…"). Honai imagery reserved for Papuan
  content, never generic decoration.
- **Brand separation**: the Aksara name (PT Abstraksi civic project,
  government-facing) stays OFF this product's public brand — oligarch
  satire must never splash on the Nabire track. Quiet bridge only: the
  story-manifest format may be called `.aksara` (the script that carries
  stories) — PENDING-YOSE.

## Sponsorship / warung tier (the ads answer)

Principle: **diegetic, labeled, additive.** A sponsor pays to EXIST in the
world, never to interrupt it. No billboards.

1. **Patronage colophon** (best): story title cards carry "dicetak di
   Warung X" — the 500-year-old printer's-colophon model. Elegant, honest,
   no fiction break.
2. **Sponsored kopi**: energy packs "courtesy of Warung X"; refreshment
   items from real, labeled places.
3. **Presence in the hub**: sponsor's real warung as a place in the warung
   square; their shop-NPC grounded in their real menu/hours/prices
   (klerk-style citation guardrails) — this IS the SMB warung tier, and
   quietly an Aksara-pattern demo (first-layer service NPC).
4. **NEVER inject sponsors into user stories** (consent/control: no brand
   cameo in someone's breakup story). Curated flagship cameos only, with
   sponsor sign-off.

## Architecture (receipts in docs/research/)

- **Static world** (GitHub Pages / CF Pages) + **one Cloudflare Worker +
  D1 + KV** (free tier: hard-stops, structurally cannot surprise-bill).
  **Wall #1: KV allows 1,000 writes/day — kopi decrements live in D1
  (100K writes/day), never KV.**
- **Engine**: inkjs + vanilla JS/canvas, no build step. Fonts VT323 (body)
  + Press Start 2P (display), self-hosted OFL. Art: Piskel (browser);
  audio: jsfxr + BeepBox (original, zero downloads); maps: SpriteFusion.
  Zero installs for the whole asset pipeline.
- **LLM gateway** (provider-agnostic, on the Worker): Groq 8B fast lane
  (14.4K req/day) / 70B quality lane (1K req/day — story beats only) →
  Gemini Flash free → NVIDIA NIM (renewing free tier, Yose-confirmed) →
  OpenRouter :free → Workers AI. Fallback floor is always Layer 0 scripted.
- **NPC guardrails**: L0 scripted Ink spine (plot lives here, always
  works) → L1 grounding in character card + scene doc → L2 output contract
  `{dialogue, intent∈allowed, mood}` validated by the engine (LLM can talk,
  never mutate state; player input is data, red-team before launch) → L3
  quota-as-fiction degradation.
- **Auth**: Google/GitHub OAuth on the Worker, sessions in KV; Resend
  magic links later (100/day free).
- **Payments**: Mayar.id Rp0 plan (one-time IDR digital purchases, 4%),
  KaryaKarsa (paid stories, 90/10), Trakteer (tips, 5%); Paddle later for
  global USD; itch.io for the game artifact (file NPWP W-8BEN to cut the
  30% US withholding).
- **Moderation**: UGC unlisted by default (share-by-link); public shelf/map
  requires agent review + Yose editorial approval (UU ITE + SARA surface).

## Waves (each sellable alone; any wave can be the last)

1. **Persona Forge standalone** — landing + drop-URL → card page + OG
   image; pay once to claim handle (Mayar). The money wave. **Opens with a
   design round: card mock + name shortlist, Yose reacts by screenshot.**
2. **The warung** — manifest-driven engine, hub scene, play-as-persona,
   oligarch chapter 1, 100% scripted (zero LLM cost/risk).
3. **Living NPCs + kopi** — gateway, guardrails L0–L3, first stateful
   backend (D1), energy economy, voice demo on our own pages.
4. **Story Press beta** — invite-only UGC, Nona interviews (Claude-driven
   in dev/beta, gateway in prod), Yose as editor of the public shelf.
5. **The horizon** — world map, seasonal events (detak-detik data),
   guestbook quests, warung SMB tier, **Zakheus chapter on its own
   unhurried craft track**.

## Ledger — needs-from-Yose (in order; keys/signups LAST)

1. Name verdict (NonaFiksi recommended; also on the table: Catatan
   Terpinggir homage, Kisah/Warung Kisah; Aksara reserved for civic;
   Fable collides with the Xbox RPG franchise trademark — dropped).
2. React to Wave-1 card mock + design round (screenshots).
3. Payment rail confirmation: Mayar signup (verify perorangan onboarding
   fine print), domain choice.
4. Editorial review of first public stories (Wave 4).
5. Keys: Groq, Gemini, NIM, Resend — after the build needs them.
6. Bapa Benny conversation re: Zakheus chapter (Wave 5, done with love,
   no deadline).

## Parked tangents (they WILL come back)

- detak-detik premium adjacents (API / custom briefs / researcher exports —
  never paywall the paper itself).
- Aksara crossover: warung-tier NPC as CARE-as-Code demo surface.
- Voice tier (Google AI Studio live voice as premium "talk to the NPC").
- `.aksara` manifest extension naming.
- Domain availability check (with rail decision).
- Flagship story titles (Catatan-Pinggir-flavored title for the oligarch
  chapter?).

## Research shelf

- `docs/research/free-gamedev-assets-cookbook.md` — assets/engine/tools,
  17 URLs verified 2026-07-05.
- `docs/research/free-infra-payments-cookbook.md` — payments (Indonesian
  individual), backend, LLM tiers, auth; verified 2026-07-05 with receipts;
  NIM entry carries Yose's correction.
