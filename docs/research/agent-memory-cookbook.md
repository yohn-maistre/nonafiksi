# NonaFiksi Agent-Memory Cookbook
**Research date: 2026-07-05/06 · every claim carries its URL · labels: VERIFIED (fetched today) / UNVERIFIED (memory or secondary source)**

Mission: pick the agent architecture with persistent memory for NonaFiksi — pixel-RPG story press where
Nona Aksara interviews users across sessions, compiles story manifests; NPC agents with per-character
memory; LLM output strictly `{dialogue, intent∈allowlist, mood}`, never mutating game state directly.

Hard constraints: Rp0/month, Cloudflare Workers Free + D1 + KV + Workers AI runtime, Groq-primary
gateway, no servers, no paid tiers, Python only in GitHub Actions batch, low-RAM phone dev.

---

## 0. Verdict (rankings for OUR constraints)

| Rank | Option | Fit | One-liner |
|---|---|---|---|
| 1 | **Cloudflare Agents SDK (`agents` npm) + SQLite-backed Durable Objects** | ✅ deploy | DO-per-character with embedded SQLite IS the memory model we wanted; free plan now includes SQLite DOs; WebSockets + state sync free. Caveat: pre-1.0 (v0.17.3) — pin the version. |
| 2 | **Roll-your-own Worker + D1 + Vectorize + Workers AI embeddings** | ✅ canonical store | Not instead of #1 — *alongside* it. D1 stays the canonical cross-character store (manifests, ledger); Vectorize free tier covers semantic recall. |
| 3 | **PydanticAI (Python, GitHub Actions batch lane only)** | ✅ batch | Structured-output king for nightly story compilation + memory distillation; matches Yose's detak-detik pattern. Not a runtime option (Python can't run on Workers). |
| 4 | **Vercel AI SDK (`ai` pkg)** | ✅ as a library, not an architecture | The LLM-call layer inside #1 (streaming, `generateObject` + zod). No memory system of its own. |
| 5 | Mastra | ⚠️ risky | Rich memory features but a history of breaking on Workers (D1Store bugs), heavy build/deployer chain. Skip for now, revisit post-1.x stability on Workers. |
| 6 | LangGraph JS | ❌ | Checkpointers (Postgres/Redis) break in Workers; no D1 checkpointer exists. |
| 7 | Letta (MemGPT) | ❌ | Hosted free tier = 3 agents with managed state (we need one per user + per NPC); self-host = a server = violates constraint. |
| 8 | Flowise / Langflow visual builders | ❌ | Node/Docker servers (Langflow wants 2 GB+ RAM); cloud free tiers are toys (Flowise: 100 predictions/mo). |

---

## 1. The free-tier ledger (all VERIFIED today at the pricing pages)

| Resource | Free-plan limit (exact quote) | Source |
|---|---|---|
| **Durable Objects** | Free plan included, but **"Only Durable Objects with SQLite storage backend are available"**. Requests **"100,000 / day"**, duration **"13,000 GB-s / day"**, SQL rows read **"5 million / day"**, rows written **"100,000 / day"**, SQL stored data **"5 GB (total)"** | https://developers.cloudflare.com/durable-objects/platform/pricing/ — VERIFIED |
| **D1** | Rows read **"5 million / day"**, rows written **"100,000 / day"**, storage **"5 GB (total)"** | https://developers.cloudflare.com/d1/platform/pricing/ — VERIFIED |
| **KV** | Reads **"100,000 / day"**, writes **"1,000 / day"**, deletes 1,000/day, lists 1,000/day, storage 1 GB; "All limits reset daily at 00:00 UTC" | https://developers.cloudflare.com/kv/platform/pricing/ — VERIFIED |
| **Workers AI** | **"10,000 Neurons per day at no charge"**. Embeddings: `@cf/baai/bge-m3` = **1,075 neurons / M input tokens** (≈9.3M embed-tokens/day free); `@cf/baai/bge-base-en-v1.5` = 6,058 n/M. Fallback LLM `@cf/meta/llama-3.1-8b-instruct` = 25,608 n/M in + 75,147 n/M out (≈ ~100K free 8B tokens/day) | https://developers.cloudflare.com/workers-ai/platform/pricing/ — VERIFIED |
| **Vectorize** | On free plan: **"30 million queried vector dimensions / month"**, **"5 million stored vector dimensions"**; index count not billed. FAQ: "the Workers free tier will always include the ability to prototype and experiment with Vectorize for free" | https://developers.cloudflare.com/vectorize/platform/pricing/ — VERIFIED |
| **Groq (gateway primary)** | Free tier, `llama-3.3-70b-versatile`: **30 RPM, 1,000 RPD, 12,000 TPM, 100,000 TPD**, org-level | https://console.groq.com/docs/rate-limits — VERIFIED |

Budget interpretation for NonaFiksi:
- **Vectorize sizing**: bge-m3 is 1024-dim → 5M stored dims ≈ **~4,880 stored memory vectors**; 30M queried dims/mo ≈ ~29K queries/mo (~975/day). Fine for launch scale; distillation (keeping only distilled facts vectorized, not every raw answer) is what keeps us under it.
- **KV writes (1,000/day) are the tightest number on the whole stack** → KV is for read-heavy config/flags only, never per-message state.
- **Groq 100K tokens/day** is the real conversation ceiling → memory injection must be token-budgeted (see §8) and Workers AI llama-3.1-8b is the free fallback tier.
- DO + D1 row-write budgets are separate pools (100K/day each) — using both effectively doubles the write ceiling.

---

## 2. Option 1 — Cloudflare Agents SDK + Durable Objects (WINNER)

**What it is.** First-party framework by Cloudflare Inc. (`agents` on npm): each Agent class instance
is a SQLite-backed Durable Object with "durable identity, local SQL storage, real-time connections,
scheduled work, and recoverable execution" (https://developers.cloudflare.com/agents/ — VERIFIED).

**Stability in 2026.** npm registry (VERIFIED via registry.npmjs.org 2026-07-06): latest **v0.17.3,
published 2026-06-30**; releases 0.16.2→0.17.3 across June 2026 — very actively maintained, but
**still 0.x semver, so no API-stability guarantee**. Treat as production-usable (Cloudflare ships it
first-party) but **pin the exact version** and read changelogs before bumping. Repo:
https://github.com/cloudflare/agents.

**Free plan compatibility.** VERIFIED by composition: Agents are configured as Durable Objects with
`"migrations": [{ "tag": "v1", "new_sqlite_classes": ["MyAgent"] }]` — i.e. **SQLite-backed DOs**
(https://developers.cloudflare.com/agents/api-reference/configuration/ — VERIFIED), and SQLite-backed
DOs are exactly what the free plan includes (§1). The Agents docs never say "free plan" explicitly
(checked limits + config pages) — label the composed claim itself: VERIFIED-by-composition.

**Memory pattern — the reason it wins.** Per the state docs
(https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/ — VERIFIED):
- `this.setState()` "Saves to SQLite (persistent)" **and** "Broadcasts to all connected clients" — NPC mood/relationship state syncs to the pixel-RPG client for free.
- `this.sql\`SELECT ...\`` — "Every individual Agent instance has its own SQL (SQLite) database that runs within the same context as the Agent itself", access "effectively zero-latency". This is literally the "DO per user/NPC with embedded SQLite" pattern from the brief, as a supported first-party primitive.
- Limits (https://developers.cloudflare.com/agents/platform/limits/ — VERIFIED): "Max state stored per unique Agent" = **1 GB**; ~250K+ agent definitions; 30s CPU per request/WS message.

**WebSocket/dialogue fit.** Native WebSocket server per agent + React `useAgent()` hook with
`onStateUpdate` — an interview is a long-lived socket to `NonaAksaraAgent` named by `user_id`;
each NPC conversation is a socket to `NpcAgent` named `npc:{npc_id}:{user_id}`. Scheduling API
(`this.schedule`) covers "Nona follows up tomorrow" beats.

**Guardrails stay ours.** The SDK doesn't impose an output format — LLM call (via `ai` +
`generateObject`/zod or plain fetch to the gateway) returns `{dialogue, intent, mood}`; a
deterministic reducer inside the DO validates `intent` against the allowlist and is the ONLY code
that touches game state. The LLM never gets a write path. No framework needed or wanted here.

**Honest cons.** 0.x churn; DO-embedded SQLite is per-object (cross-character queries need D1 —
see §3, use both); vendor lock-in to CF (acceptable: the whole stack already is); free-plan DO
requests share the 100K/day pool with everything else.

## 3. Option 2 — Roll-your-own: Worker + D1 + Vectorize + Workers AI

The zero-dependency doctrine option, assessed honestly: **it's not a rival, it's the other half.**

- **D1 as canonical store** (VERIFIED limits §1): `user_memory(user_id, kind, content, source_episode_id, updated_at)`, `episodes(...)`, `npc_state(...)`, `story_manifests(...)`. D1 is queryable across ALL users/NPCs (analytics, story compilation input, admin) — DO-embedded SQLite is not. Also reachable over HTTP REST API from GitHub Actions (`/accounts/{id}/d1/database/{id}/query` — UNVERIFIED today, known-stable endpoint) which the batch lane needs.
- **Vectorize for semantic recall** (VERIFIED free tier §1) + **bge-m3 embeddings** (VERIFIED cost §1 — ~9.3M free embed-tokens/day, effectively unlimited for us). Vectorize stores id+metadata; text lives in D1 (one fact, one owner).
- **What rolling your own costs you vs the SDK**: you hand-build WebSocket session routing, hibernation handling, per-conversation isolation, scheduling, and client state sync — several hundred lines of undifferentiated plumbing the SDK already ships, from the same vendor, on the same primitives. The SDK is a thin layer over DOs; abandoning it later costs little. **Verdict: use plain-Workers discipline for the HTTP/API surface and D1 schema, use the SDK for the conversational cores.**

## 4. Option 3 — TypeScript agent frameworks on Workers

### Mastra (mastra.ai) — rich memory, shaky Workers story
- Memory system is genuinely the best-featured of the group (https://mastra.ai/docs/memory/overview — VERIFIED): message history (resource/thread), **working memory** ("Stores persistent, structured user data such as names, preferences, and goals"), **semantic recall**, **observational memory** (compresses old messages into "dense observations").
- Has `CloudflareDeployer` + `D1Store` (https://mastra.ai/reference/storage/cloudflare-d1 — VERIFIED to exist).
- BUT the Workers track record: **Issue #6487 "D1Store doesn't work in Cloudflare Workers — Both REST API and Binding approaches fail"** (binding hit `"Disallowed operation called within global scope"`; closed as "Released in alpha") — https://github.com/mastra-ai/mastra/issues/6487 — VERIFIED. Plus #8782 "Using Mastra with Cloudflare Bindings does not work" (https://github.com/mastra-ai/mastra/issues/8782 — VERIFIED to exist, not read in full). Requires its own `mastra build` + generated wrangler config; D1 1 MiB row limit bites attachment-bearing messages.
- Bundle size on Workers: UNVERIFIED, but the framework pulls a large dependency graph; Workers free script limit is 3 MB gzipped (UNVERIFIED today; paid is "up to 10 MB" per https://developers.cloudflare.com/agents/platform/limits/ — VERIFIED). **Verdict: skip. Its memory taxonomy is worth stealing (see §8), its runtime is not worth the risk on the free plan.**

### Vercel AI SDK (`ai` package) — yes, but it's a layer, not an architecture
- Workers compat VERIFIED: Cloudflare maintains its own provider, `workers-ai-provider` (https://github.com/cloudflare/workers-ai-provider, docs https://developers.cloudflare.com/workers-ai/configuration/ai-sdk/), and the Agents SDK itself lists `ai` in its dev/peer deps (npm registry — VERIFIED). Caveat: no `process.env` on Workers → use `create*` factory functions with bindings.
- No memory/persistence system of its own — it's model calls, streaming, tool calls, and **`generateObject` with zod schemas**, which is exactly the guardrail enforcement mechanism for `{dialogue, intent, mood}`. **Verdict: adopt inside Option 1 as the model-call + structured-output layer, pointed at the Groq gateway (OpenAI-compatible provider) with workers-ai-provider fallback.**

### LangGraph JS — disqualified on Workers
- Docs moved to docs.langchain.com. Persistence = checkpointers; the shipped ones are Memory (non-durable), SQLite (`better-sqlite3` — native module, cannot run on Workers), Postgres, Redis.
- **Postgres and Redis checkpointers break in Cloudflare Workers** — https://github.com/langchain-ai/langgraphjs/issues/1692 (Sept 2025, "Workers runtime canceled requests due to hung code") — VERIFIED via search result summary (UNVERIFIED in full text). No D1 checkpointer exists as of today (searched; only LangChain's D1-backed *chat memory* exists, a different, non-LangGraph abstraction: https://blog.cloudflare.com/langchain-support-for-workers-ai-vectorize-and-d1/). Writing our own D1 checkpointer = adopting a heavy framework AND writing its storage layer. **Verdict: no.**

## 5. Option 4 — Letta (MemGPT): disqualified, with receipt

https://docs.letta.com/letta-code/pricing — VERIFIED:
- Hosted ("Constellation") free tier: **"up to three agents with managed state"**. NonaFiksi needs one Nona-agent per user plus per-NPC agents — dead on arrival at 3.
- Pro $20/mo (20 stateful agents), API plan $20/mo base + "$0.10 / active agent / mo" — violates Rp0.
- Self-hosting is open source but requires a running server (Docker/Postgres) — violates the no-server constraint.
**Verdict: disqualified. Its *ideas* (core memory blocks vs archival memory, agent-edited memory) inform §8.**

## 6. Option 5 — PydanticAI: the batch lane (GitHub Actions)

https://pydantic.dev/docs/ai/overview/ — VERIFIED (ai.pydantic.dev 301s there now):
- Structured output: streams structured output "with immediate validation"; output "guaranteed to be" the schema type, with automatic reflection/retry on validation failure — the schema-validation king claim holds. Ideal for compiling `StoryManifest` pydantic models from raw episodes.
- Providers: **Groq explicitly listed**, plus OpenAI-compatible custom endpoints → same gateway keys as the runtime.
- Memory: "Messages and chat history" only — **no built-in long-term memory store; you persist it yourself.** For us that's a feature: the nightly job reads episodes from D1 (HTTP API), distills facts, writes `user_memory` rows + embeds via Workers AI REST → Vectorize. Matches Yose's detak-detik Python-newsroom-on-Actions pattern exactly.
**Verdict: adopt for the two batch jobs — nightly story compilation and memory distillation. Never in the request path.**

## 7. Option 6 — Flowise / Langflow: dismissed, with receipt

Both are open-source **Node/Docker server applications**: Flowise needs Node + a DB and self-hosting starts ~$6–9/mo on VPSes; its cloud free tier is "2 flows, 100 predictions per month, 5 MB storage" (https://www.lindy.ai/blog/flowise-pricing, https://flowiseai.com/ — secondary sources, UNVERIFIED at vendor pricing page). Langflow "requires a minimum of 2048MB RAM" self-hosted (https://servercompass.app/templates/langflow — secondary, UNVERIFIED). Either way: a server, or a toy quota, and nothing for per-character SQL memory or Workers deployment. **Dismissed.**

## 8. Memory design — patterns worth building (2025–2026 consensus)

Sources: https://machinelearningmastery.com/beyond-short-term-memory-the-3-types-of-long-term-memory-ai-agents-need/ ·
https://redis.io/blog/long-term-memory-architectures-ai-agents/ ·
https://arxiv.org/pdf/2602.06052 (memory-mechanisms survey) ·
https://atlan.com/know/episodic-memory-ai-agents/ — all consulted via search 2026-07-06; framing below synthesized from them.

**Memory kinds → tables (one fact, one owner):**
1. **Episodic** — raw, append-only, time-indexed: every interview Q/A pair, every notable NPC exchange. `episodes(id, user_id, agent_id, role, content, ts)` in D1. Never summarized-in-place: write-time-only distillation "collapses distinct episodes into semantic generalizations, destroying the episodic signal" (survey framing above). Raw episodes are also the story-compiler's source material — for a story press, episodes ARE the product inventory.
2. **Semantic / distilled facts** — "user's father is from Deiyai", "afraid of dogs since childhood": `user_memory(id, user_id, kind, content, confidence, source_episode_id, updated_at)`. Each fact keeps its receipt (`source_episode_id`) — citation-or-silence applies to memories too. These are what get embedded into Vectorize.
3. **Relationship / NPC state** — structured columns, not prose: `npc_state(npc_id, user_id, affinity_int, mood, flags_json, last_seen)`. Lives in the NPC's DO state (hot, synced to client) and mirrors to D1 on session end (cold, queryable).
4. **Working memory** — the live conversation buffer inside the DO; dies or compacts at session end.

**Write-time vs read-time — do both, at different times:**
- **Write-time (cheap, synchronous)**: append the episode; let the LLM's structured output optionally flag `memory_candidate: true` on an answer. No LLM summarization in the request path (latency + Groq TPD budget).
- **Batch-time (nightly, PydanticAI on Actions)**: progressive consolidation — distill flagged/new episodes into semantic facts, merge duplicates, decay stale ones, embed into Vectorize. This is the "read-before-reasoning, write-after-acting loop" with consolidation moved off-peak — the hybrid the 2025 literature converged on.
- **Read-time (RAG)**: on session open, load ALL of `npc_state` + top-N pinned facts (recency/confidence); per turn, Vectorize top-k (k=3–5) semantic facts against the user's last message.

**Token budget for memory injection** (derived from VERIFIED Groq free limits, §1): with 12,000 TPM / 100,000 TPD, a turn should stay ≤ ~2.5K tokens total. Budget: system+guardrails ~400, pinned facts + npc_state ~300, retrieved semantic memories ~400–600 (hard cap), rolling dialogue window ~800–1,000. Never inject raw episodes at read time — only distilled facts; episodes are for the compiler.

## 9. Recommended architecture (the free stack)

```
 pixel-RPG client (Astro/Svelte + canvas)
      │  WebSocket (dialogue, state sync via useAgent-style client)
      ▼
┌─ Cloudflare Worker (free plan) ─────────────────────────────────────────┐
│                                                                          │
│  routes/api (plain Worker: auth, manifests, admin)                       │
│      │                                                                   │
│  ┌───▼──────────────── agents SDK (pin v0.17.x) ──────────────────────┐  │
│  │ NonaAksaraAgent (DO per user)      NpcAgent (DO per npc:user pair) │  │
│  │  • this.sql: working buffer,        • this.state: {affinity, mood, │  │
│  │    interview progress                 flags} → auto-synced to game │  │
│  │  • this.schedule: follow-ups        • same guardrail reducer       │  │
│  │  ── guardrail reducer: zod-validate {dialogue, intent, mood};      │  │
│  │     intent ∉ allowlist → drop; reducer alone mutates game state ── │  │
│  └───────┬──────────────────────────────────────────┬─────────────────┘  │
│          │ LLM call (ai pkg / fetch)                 │ memory I/O         │
│          ▼                                          ▼                    │
│   [ gateway Worker ]                    [ D1 ]  episodes · user_memory   │
│   Groq free (llama-3.3-70b)                     npc_state · manifests    │
│    └─fallback→ Workers AI llama-3.1-8b   [ Vectorize ] fact vectors      │
│    (10K neurons/day)                     [ Workers AI ] bge-m3 embeds    │
│                                          [ KV ] config/flags (read-only) │
└──────────────────────────────────────────────────────────────────────────┘
      ▲ nightly, via D1 HTTP API + gateway
┌─ GitHub Actions (batch lane, Python) ────────────────────────────────────┐
│  PydanticAI jobs: (a) memory distillation: episodes → user_memory facts  │
│  → embed → Vectorize upsert   (b) story compiler: episodes → validated   │
│  StoryManifest models → D1                                               │
└──────────────────────────────────────────────────────────────────────────┘
```

## 10. Wave-3 build order (5 lines)

1. Scaffold Worker with pinned `agents@0.17.x`; wrangler config with `new_sqlite_classes: [NonaAksaraAgent, NpcAgent]`; deploy hello-agent to free plan to prove the DO free tier empirically.
2. D1 schema migration: `episodes`, `user_memory`, `npc_state`, `story_manifests` (+ indexes on user_id, ts) — canonical store before any LLM wiring.
3. Guardrail reducer + gateway client: zod schema `{dialogue, intent, mood}`, intent allowlist table, Groq→Workers-AI fallback; golden tests with canned LLM JSON (runs on the phone, no network).
4. NonaAksaraAgent interview loop end-to-end: WebSocket session → episodes to D1 → read-time memory injection (pinned facts, empty at first) → client renders dialogue + mood.
5. Batch lane: PydanticAI distillation Action (episodes → facts → bge-m3 → Vectorize) + story compiler skeleton; then NpcAgent is a thin variant of Nona with `npc_state` in `this.state`.
