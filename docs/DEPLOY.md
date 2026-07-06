# Deploy — pre-shaped options (nothing installed on the phone, ever)

Status 2026-07-06: NOT deployed yet. Scaffold is ready (wrangler.toml,
worker/, .github/workflows/deploy.yml). Blocked on ONE Yose action.

## Option A — Cloudflare (recommended: matches the whole architecture)
1. Yose: create a Cloudflare account (free) + API token
   (template "Edit Cloudflare Workers") — ~5 min, phone browser works.
2. Yose: `gh secret set CLOUDFLARE_API_TOKEN` (or repo Settings → Secrets).
3. Then (Claude, via CI): run the Deploy workflow → creates D1
   (`wrangler d1 create nonafiksi`), paste database_id into wrangler.toml,
   apply schema, deploy Worker + Pages. Static game on Pages, API on the
   Worker, all Rp0 (hard-stop free tiers, receipts in
   docs/research/free-infra-payments-cookbook.md).

## Option B — GitHub Pages now (static only, no API)
Free GH Pages needs a PUBLIC repo. Flips the brand public early; no
backend, so kopi/memory stay mocked. Fine as a preview mirror later.

Verdict: A. It's one signup + one token, and it unlocks the real
architecture (Workers + D1 + Durable Objects + Workers AI fallback).
