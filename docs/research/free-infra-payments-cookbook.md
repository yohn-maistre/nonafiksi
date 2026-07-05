# Free-Tier Infra & Payments Cookbook — Indonesian solo creator, pixel-RPG link-in-bio + playable stories

**Verified:** 2026-07-05, via live fetches (WebFetch) and searches. Every entry labeled VERIFIED (primary page fetched today) or UNVERIFIED (page blocked/JS-walled; secondary evidence cited and flagged).
**Product shape assumed:** static-first front end, small stateful edge backend, user accounts, KB-scale JSON docs per user, per-user energy/token counter, LLM gateway for NPC chat, one-time purchases in IDR.

---

## 1. PAYMENTS for an Indonesian individual (no PT) — ranked

### 1.1 Mayar.id — **VERIFIED** — best "real digital storefront" rail
- Receipt: https://mayar.id/pricing (fetched 2026-07-05)
- Plans: **Starter Rp 0/month** ("Cocok untuk anda yang baru memulai bisnis"), Business Rp 349K/month, Enterprise custom.
- Platform fee: **digital products 4%** (Starter) / 3% (Business); **payment links/invoicing 1.5%** (Starter) / 1%.
- Payment-channel fees on top: **QRIS 0.7%**, e-wallets 1.5%, bank VA Rp 4,000, cards "2.60% + Rp 2,000", minimarket Rp 5,000–7,500.
- One-time purchases: yes — digital products + payment links are the core product. Payouts to Indonesian banks (it's a domestic Xendit-style stack).
- Caveat: the pricing page does not explicitly state individual (perorangan) onboarding terms — sign-up flow will confirm; widely used by individual creators. That single detail: UNVERIFIED.

### 1.2 KaryaKarsa — **VERIFIED** — best thematic fit (paid stories/chapters)
- Receipt: https://help.karyakarsa.com/panduan-kreator/kebijakan-mengenai-gajiandikaryakarsa (fetched 2026-07-05)
- Creator keeps **"90% dari setiap transaksi"** (10% platform fee), before **bank transfer fee "Rp 5.500 (Indonesia)"**.
- Minimum withdrawal: **"saldo yang dapat ditarik sebesar 1000 Kakoin atau lebih"** (international banks: 2000 Kakoin).
- Individual creators monetizing stories is the whole platform (novels, chapters, supporter unlocks). Payout to Indonesian bank/e-wallet.
- Fit note: sell story access/support here; it is a platform page, not an API storefront — link out from the link-in-bio.

### 1.3 Trakteer.id — **VERIFIED** — best tips/donation rail
- Receipt: https://new.trakteer.id/feature-and-pricing (fetched 2026-07-05; trakteer.id 302→new.trakteer.id)
- **"Biaya platform hanya 5% dari setiap dukungan, selebihnya langsung jadi milikmu sepenuhnya."**
- Gateway fees (configurable to be paid by supporter or creator): QRIS 0.77%, OVO/DANA/LinkAja 1.65%, GoPay/ShopeePay 2%, bank VA Rp 4,000, BCA VA Rp 3,900, cards 3.4%, Trakteer Balance/Coin Rp 0.
- Withdrawal Rp 5,000/cairkan, min Rp 100,000 (from terms/help via search — https://new.trakteer.id/terms and https://help.trakteer.id/help-center/articles/3/... ; help article itself was JS-walled → those two numbers UNVERIFIED-direct).
- Individual signup with Indonesian bank/e-wallet payout ("Dapetin trakteeran dan cairkan langsung ke rekening atau e-wallet").

### 1.4 Saweria — **UNVERIFIED (site JS-obfuscated)** — streamer-style tips
- Attempted receipt: https://saweria.co/ (fetched 2026-07-05 — page content obfuscated/encoded; only payment logos visible: GOPAY, OVO, DANA, LINKAJA, QRIS).
- Secondary evidence (search, incl. IDN Media zendesk https://idnmediasupport.zendesk.com/hc/en-us/articles/28974933154585): ~5% admin fee per donation (OVO 6%), withdrawal fee Rp 5,000, minimum withdrawal Rp 50,000, plus Rp 10,000/month account maintenance fee if no activity for 6 months (since 2023-09-01). Treat all numbers as unconfirmed until fetched from source.

### 1.5 Lynk.id — **UNVERIFIED (403 on lynk.id)** — link-in-bio + digital products
- Attempted receipt: https://lynk.id/ → HTTP 403 (WAF). Pricing/FAQ pages not directly fetchable.
- Secondary evidence: official Lynk.id Threads reply (https://www.threads.com/@lynk.id/post/DFvICobSM9o): free account **5% transaction fee + Rp 5,000 withdrawal admin**; Pro account 3%, no withdrawal fee; min withdrawal Rp 100,000; processing ≤2 working days. Direct competitor to your own product — useful as fee benchmark.

### 1.6 Paddle (merchant of record) — **VERIFIED (country policy)** — the global option
- Receipt: https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle (fetched 2026-07-05): **"Paddle works with software businesses anywhere in the world with the exception of the unsupported countries listed below"** — 28 countries listed, **Indonesia is NOT on the unsupported list** → Indonesian sellers eligible.
- Individuals: per Paddle's verification help pages (via search: https://www.paddle.com/help/start/account-verification/what-is-business-verification), business verification "is not required for individuals or sole traders" — identity verification (ID document) applies instead. That page not fetched directly → UNVERIFIED-direct.
- MoR: Paddle handles global sales tax/VAT. Fees and Indonesian-bank payout mechanics not verified today. One-time purchases: yes (Paddle Billing one-time prices).
- Realistic role: the rail when you sell globally in USD, not the fastest to start this week.

### 1.7 itch.io — **VERIFIED** — perfect for the playable-story artifact itself
- Receipt: https://itch.io/docs/creators/payments (fetched 2026-07-05)
- Payouts via **"PayPal or Payoneer"** (collected mode); rev share is open: **"You (the seller) can decide what percentage of your sales will go towards itch.io, from 0% to 100%"** (default 10%); processor fee "$0.30 + 2.9%"; minimum payout "at least $5.00 USD"; funds available "7 days after the purchase date", payouts take "10 to 14 days"; $3 flat tax-verification fee.
- Non-US sellers: default **"30% withholding rate"** unless you provide a TIN and your country has a US tax treaty (Indonesia has one — provide NPWP in the W-8BEN to reduce it; exact treaty rate not verified today).
- No country restrictions documented; individuals fine. PayPal Indonesia can receive and withdraw to local banks.

### 1.8 Gumroad — **UNVERIFIED (help center JS-walled)**
- Attempted receipts: https://help.gumroad.com/article/13-getting-paid and .../152-can-i-use-gumroad-in-my-country and https://gumroad.gumroad.com/p/local-bank-account-support-in-more-countries — all returned login screens or title-only shells on 2026-07-05.
- Secondary evidence (search): Indonesia is included in Gumroad's direct-bank-transfer payout countries, PayPal as fallback; Payoneer NOT supported. Do not build on this until the country list is confirmed inside a real account.

### 1.9 Lemon Squeezy / Stripe Managed Payments — **UNVERIFIED (hard 403)** — not this week
- Attempted receipts: https://www.lemonsqueezy.com/ , /blog/2026-update , https://docs.lemonsqueezy.com/help/getting-started/supported-countries — all HTTP 403 on 2026-07-05; https://docs.stripe.com/managed-payments → 404.
- Secondary evidence (search): Stripe acquired Lemon Squeezy (2024-07, TechCrunch https://techcrunch.com/2024/07/26/stripe-acquires-payment-processing-startup-lemon-squeezy/); successor product **Stripe Managed Payments** entered public preview Feb 2026 at ~5% + $0.50. Merchant-country eligibility unknown; given Stripe's own Indonesia status (below), assume an Indonesian individual cannot onboard. Treat as closed.

### 1.10 Stripe direct — **VERIFIED: not GA in Indonesia**
- Receipt: https://stripe.com/global (fetched 2026-07-05): Indonesia listed as **"Preview"** — not generally available; requires contacting sales. An individual cannot just sign up today.

**Payments verdict:** this week, an Indonesian individual with only a KTP + bank account can start on **Mayar.id (Rp0 plan, 4% digital-product fee)** for real one-time IDR purchases, **KaryaKarsa (90/10)** for paid stories, and **Trakteer (5%)** for tips. **Paddle** is the verified-eligible global MoR when ready; Stripe/Lemon Squeezy are not options.

---

## 2. Free-tier stateful backend (edge, zero self-hosting)

### 2.1 Cloudflare Workers + KV + D1 — **VERIFIED** — the winner
- Workers free (https://developers.cloudflare.com/workers/platform/limits/): **100,000 requests/day** (reset midnight UTC), **10 ms CPU/invocation**, 100 Workers, 50 subrequests/request. At limit: **Error 1027**, configurable fail open/closed — a hard stop, **no billing possible without a card on file**.
- Workers KV free (https://developers.cloudflare.com/kv/platform/limits/): **100,000 reads/day, 1,000 writes/day** (and max 1 write/sec to the same key), **1 GB storage**, key ≤512 B, value ≤25 MiB.
- D1 free (https://developers.cloudflare.com/d1/platform/pricing/ + /limits/): **5 million rows read/day, 100,000 rows written/day, 5 GB total storage** (500 MB/database, 10 databases). At limit: "you will not be able to run queries against D1. D1 API will return errors" — **errors, not charges**.
- Auth story: none built in — bring OAuth (Section 4). Fit: JSON docs in KV or D1 TEXT column; **energy counters in D1** (KV's 1,000 writes/day + 1 write/sec/key would choke counters).

### 2.2 Supabase — **VERIFIED** — best batteries-included, one gotcha
- Receipt: https://supabase.com/pricing (fetched 2026-07-05): free plan = **500 MB database**, **50,000 monthly active users** (auth), **"Unlimited API requests"**, 5 GB egress, **500,000 edge function invocations**, **2 active projects**, and projects are **paused "after 1 week of inactivity"**.
- No card, no overage on free → no surprise bills; but the **auto-pause after 7 idle days** means a low-traffic toy can go dark until manually restored.

### 2.3 Deno Deploy — **VERIFIED** — fine, but product in transition
- Receipt: https://deno.com/deploy/pricing (fetched 2026-07-05): free = **1M requests/month, 1 GiB KV storage, 15 hours CPU/month**. Overage behavior on free not stated on page; platform is mid-migration ("Deploy Classic" vs new Deploy, some features "Currently unavailable"). Less predictable footing this year.

### 2.4 Vercel Hobby — **VERIFIED — disqualified for a paid product**
- Receipts: https://vercel.com/docs/limits and https://vercel.com/docs/plans/hobby (fetched 2026-07-05): 1M function invocations, 100 GB fast data transfer, 4 CPU-hrs, at limit "you will have to wait until 30 days have passed" (freeze, not billing). But: **"the Hobby plan restricts users to non-commercial, personal use only"** (fair-use guidelines). Selling anything on it violates ToS. Out.

**Backend verdict: Cloudflare Workers free + D1 (counters, users) + KV (JSON docs, sessions).** Hard daily stops, zero-billing-by-construction, no idle pausing, one platform.

---

## 3. LLM free tiers for the NPC/story gateway

### 3.1 Groq — **VERIFIED** — primary engine
- Receipt: https://console.groq.com/docs/rate-limits (fetched 2026-07-05), free plan, org-level, first-threshold-hit wins:
  - **llama-3.3-70b-versatile: 30 RPM, 1,000 RPD, 12K TPM, 100K TPD**
  - **llama-3.1-8b-instant: 30 RPM, 14,400 RPD, 6K TPM, 500K TPD**
- Commercial use on free tier: not stated on this page — UNVERIFIED; check ToS before charging users for NPC chat.

### 3.2 Google Gemini API — **VERIFIED (existence + data policy), numbers gated**
- Receipts: https://ai.google.dev/gemini-api/docs/pricing and /docs/rate-limits (fetched 2026-07-05).
- Free tier exists ("Free input & output tokens") for Gemini 3.5 Flash, 3.1 Flash-Lite, 3 Flash Preview, 2.5 Flash/Flash-Lite, embeddings. Grounded Google Search: "500 RPD free (limit shared for Flash and Flash-Lite)".
- **Per-model RPM/RPD are no longer printed on the docs page** — "Rate limits… can be viewed in Google AI Studio" (login required) → exact numbers UNVERIFIED today.
- Free-tier privacy: content is **"used to improve our products"** (paid tier is not). Don't send user-private story data on the free tier without disclosure.

### 3.3 OpenRouter :free models — **VERIFIED (with a rendering caveat)**
- Receipt: https://openrouter.ai/docs/api/reference/limits (fetched 2026-07-05). Page uses template variables; resolved values corroborated by OpenRouter's own help center (https://openrouter.zendesk.com/hc/en-us/articles/39501163636379): **20 requests/min** on :free models; **50 requests/day** with <$10 lifetime credits, **1,000 requests/day** after purchasing **$10** in credits (one-time, credits never expire). ~26–28 :free models incl. DeepSeek R1, Llama 3.3 70B, Qwen3 Coder.
- Great as the provider-agnostic fallback layer; the one-time $10 unlock is the best paid-adjacent deal in this list.

### 3.4 Cloudflare Workers AI — **VERIFIED** — in-platform fallback
- Receipt: https://developers.cloudflare.com/workers-ai/platform/pricing/ (fetched 2026-07-05): **"10,000 Neurons per day at no charge"**, resets 00:00 UTC, **operations fail with an error** past quota on free (paid: $0.011/1,000 Neurons). Example: Llama 3.2 1B = 2,457 neurons/M input tokens, 18,252/M output → roughly a few hundred short NPC exchanges/day on small models.

### 3.5 NVIDIA NIM (build.nvidia.com) — **renewing free tier (Yose-confirmed)** — fallback lane
- build.nvidia.com is a JS app; terms not directly fetchable. Secondary evidence (NVIDIA dev blog https://developer.nvidia.com/blog/access-to-nvidia-nim-now-available-free-to-developer-program-members/ + forums https://forums.developer.nvidia.com/t/nim-api-credits/305703) suggested a one-time ~1,000-credit pool at 40 RPM.
- **CORRECTION (source: Yose, direct experience, 2026-07-05): the free tier is always-free/renewing — NVIDIA's play is ecosystem lock-in, not a trial wall.** Supersedes the secondary-source consensus. Exact RPM/RPD still to be measured empirically when a key exists (keys-last rule). Promoted from evaluation-only to a real gateway fallback lane.

**LLM verdict:** gateway on a Worker with provider fallback: **Groq (8B fast lane / 70B quality lane) → Gemini Flash free → NVIDIA NIM → OpenRouter :free → Workers AI**. Combined ceiling ~15K+ NPC turns/day at Rp0.

---

## 4. Auth at Rp0

- **OAuth-only (GitHub/Google) on the Worker — recommended start.** No email infra at all: OAuth redirect → session token in KV. GitHub OAuth apps are free/unlimited; Google OAuth free. (Platform receipts: Section 2.1.) For a gamer/creator audience Google covers nearly everyone in Indonesia.
- **Supabase Auth — VERIFIED**: 50,000 MAU free (https://supabase.com/pricing) **but** magic-link email via the built-in provider is **"2 emails per hour"** (https://supabase.com/docs/guides/auth/rate-limits, fetched 2026-07-05) — unusable for real magic links without custom SMTP. OAuth providers through Supabase Auth don't hit that limit.
- **Resend (custom SMTP for magic links) — VERIFIED**: free plan **3,000 emails/month, "limited to 100 emails per day"**, 1 domain (https://resend.com/pricing, fetched 2026-07-05). 100 magic links/day is fine for early days; pair with Supabase Auth or a hand-rolled Worker flow.
- Cloudflare Access: employee/SSO gating for internal apps, not customer auth — not evaluated further (UNVERIFIED, out of scope).

---

## 5. Recommended free stack (Rp0/month at start)

1. **Static front end + API: Cloudflare Workers free** — 100K req/day hard stop, no card, no bill (https://developers.cloudflare.com/workers/platform/limits/).
2. **JSON docs + sessions: Workers KV** — 1 GB, 100K reads/day (https://developers.cloudflare.com/kv/platform/limits/).
3. **Users + energy counters: D1** — 100K row-writes/day, errors not charges (https://developers.cloudflare.com/d1/platform/pricing/).
4. **Auth: Google/GitHub OAuth on the Worker**, sessions in KV; add Resend magic links later (100/day free, https://resend.com/pricing).
5. **LLM gateway: Groq llama-3.1-8b-instant (14.4K RPD)** with 70B quality lane (https://console.groq.com/docs/rate-limits), fallback Gemini Flash free (https://ai.google.dev/gemini-api/docs/pricing) → OpenRouter :free → Workers AI 10K neurons/day.
6. **Payments: Mayar.id Rp0 plan, 4% + channel fee for one-time digital purchases (https://mayar.id/pricing); KaryaKarsa 90/10 for paid stories (https://help.karyakarsa.com/panduan-kreator/kebijakan-mengenai-gajiandikaryakarsa); Trakteer 5% tip jar (https://new.trakteer.id/feature-and-pricing).**
7. **Biggest first wall:** KV's **1,000 writes/day** — never put energy decrements in KV; they go in D1 (100K writes/day). Second wall: Groq 70B's 1,000 RPD → route casual NPC chat to the 8B lane, reserve 70B for story beats.
