# Session log — newest first

Written for a reader with amnesia. Each entry: what happened, what's true
now, what's next.

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
