# Ramji Sridaran — Personal Portfolio

> Live: [ramji-sridaran.github.io](https://ramji-sridaran.github.io)  
> API: [ramji-sridaran.vercel.app](https://ramji-sridaran.vercel.app)

A personal portfolio website with an AI-powered chatbot assistant. Built entirely with vanilla HTML/CSS/JavaScript on the frontend and a Node.js serverless function on Vercel for the AI backend.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   GitHub Pages (Static Host)                │
│                 ramji-sridaran.github.io                    │
│                                                             │
│  index.html  ──┬──  js/script.js       (UI logic)          │
│                ├──  js/chatbot-ai.js   (chatbot frontend)   │
│                └──  css/ (5 theme files + 4 base files)     │
└─────────────────────────┬───────────────────────────────────┘
                          │ POST /api/chat
                          │ (cross-origin fetch)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Vercel (Serverless Function)               │
│                 ramji-sridaran.vercel.app                   │
│                                                             │
│   api/chat.js                                               │
│      │                                                      │
│      ├── Rate Limiter  (burst: 8/10s, window: 25/min)       │
│      ├── FAQ Cache     (5-min TTL, first-turn only)         │
│      │                                                      │
│      └── AI Cascade:                                        │
│           1. DeepSeek V4 Flash (~$0.27/M tokens)           │
│           2. Groq           (openai/gpt-oss-120b, free tier)  │
│           3. OpenAI         (gpt-4.1-nano, paid fallback)   │
│           4. Local Fallback (rule-based, always available)  │
└─────────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   api.deepseek.com  api.groq.com  api.openai.com
```

---

## Hosting Split

| What | Where | Why |
|---|---|---|
| HTML / CSS / JS / Assets | GitHub Pages | Free static hosting, auto-deploys on push |
| AI serverless function | Vercel | Serverless Node.js runtime, keeps API keys secret |
| Contact form submissions | Web3Forms | No backend needed, free tier |
| Fonts | Google Fonts CDN | `Poppins` + `Inter` |

GitHub Pages **cannot run server-side code** — it only serves files. The chatbot frontend detects the current domain at runtime and points to Vercel for AI:

```js
// js/chatbot-ai.js
if (hostname.includes('vercel.app'))  → /api/chat           (same-origin)
if (hostname === 'localhost')         → http://localhost:3000/api/chat
else (github.io or any domain)        → https://ramji-sridaran.vercel.app/api/chat
```

---

## Project Structure

```
portfolio/
├── index.html                    # Single-page app, all sections
│
├── js/
│   ├── script.js                 # Theme switcher, timeline, flowchart viewer,
│   │                             #   zoom/pan, project navigation, dynamic years
│   └── chatbot-ai.js             # Chatbot UI, API calls, fallback responses,
│                                 #   online/offline status, provider attribution
│
├── api/
│   └── chat.js                   # Vercel serverless function
│                                 #   DeepSeek → Groq → OpenAI → fallback chain
│                                 #   Rate limiting, FAQ cache, provider metadata
│
├── css/
│   ├── styles-dark.css           # Dark theme  (default)
│   ├── styles-light.css          # Light theme
│   ├── styles-dark-compact.css   # Dark compact
│   ├── styles-light-compact.css  # Light compact
│   ├── styles-bw-compact.css     # Black & white compact
│   ├── chatbot.css               # Chatbot widget base styles
│   ├── chatbot-enhanced.css      # Chatbot enhanced styles
│   ├── about-enhanced.css        # About section enhancements
│   ├── creative-enhancements.css # Animations, decorative effects
│   └── flowchart-viewer.css      # Flowchart modal viewer
│
├── Resources/
│   ├── diagrams/                 # SVG architecture diagrams (used in modal)
│   │   ├── Databridge.svg
│   │   ├── BigDataMigration.svg
│   │   ├── RetailCloudMigration.svg
│   │   ├── IoT_Flow.svg
│   │   └── ChatBot.svg
│   ├── images/profile/           # Profile photo
│   │   └── Ramji.png
│   ├── documents/resume/         # Downloadable resumes
│   │   ├── Ramji_Sridaran_12_Years.pdf      (concise)
│   │   └── Ramji_Sridaran_Detailed_New.pdf  (detailed)
│   ├── certifications/           # Certification badge images
│   └── unused/                   # Old/personal files (not deployed)
│
├── vercel.json                   # Vercel routing config + CORS headers
├── package.json                  # npm scripts, dev dependencies
└── .env                          # Local API keys (gitignored, never committed)
```

---

## Page Sections

| Section | Description |
|---|---|
| **Home / Hero** | Name, title, stats, CTA buttons, two resume download buttons |
| **About** | Bio, tech philosophy, skills overview |
| **Skills** | Tagged skills by category (Language, Data, DevOps, etc.) |
| **Certifications** | SnowPro, Oracle, AI/ML certifications with badge images |
| **Projects** | 6 project cards with bullet descriptions, tech tags, and flowchart viewer |
| **Experience** | Timeline of employment history |
| **Contact** | Contact details + Web3Forms-powered message form |

---

## Flowchart Viewer

Clicking a project diagram opens a full-screen modal with:
- SVG rendered as `<img>` (not `<iframe>`) for correct scaling
- Zoom in/out via buttons or `Ctrl/Cmd + scroll`
- Previous / Next project navigation
- Sidebar with company name, period, and project description
- Themed correctly for all 5 CSS themes

---

## Theme System

Five themes, toggled via a dropdown in the navbar:

| Theme | CSS File |
|---|---|
| Dark (default) | `styles-dark.css` |
| Light | `styles-light.css` |
| Dark Compact | `styles-dark-compact.css` |
| Light Compact | `styles-light-compact.css` |
| B&W Compact | `styles-bw-compact.css` |

The active theme CSS file is swapped dynamically by updating `<link id="theme-stylesheet">`. Theme preference is saved to `localStorage`.

---

## AI Chatbot

### Frontend (`js/chatbot-ai.js`)
- Floating chat widget, always visible
- Sends `POST` to `/api/chat` with message + conversation history (last 4 turns)
- Handles network errors gracefully → local rule-based fallback
- Shows **AI source attribution** on every response (DeepSeek / Groq / OpenAI / Cache / Local fallback)
- Status indicator: 🟢 Online / 🔴 Offline (updates after each response)
- `AbortController`-based 15s timeout

### Backend (`api/chat.js`)
- Vercel Node.js serverless function
- **Provider cascade**: DeepSeek V4 Flash → Groq `openai/gpt-oss-120b` → OpenAI `gpt-4.1-nano` → local fallback
- **Rate limiting**: 8 requests/10s burst, 25 requests/minute per IP; 2-min cooldown on abuse
- **FAQ cache**: 5-minute in-memory cache for repeated short queries (first turn only)
- **SYSTEM_PROMPT**: Contains full career timeline and per-project tech stacks so the AI can answer technology-specific queries accurately (e.g. "which projects used Redis?")
- Returns `providerMeta` in every response so the frontend can show correct attribution

---

### Rate Limiter (in-memory, per IP)

Every incoming request passes through `checkRateLimit(userIP)` before any AI call is made. Three layers of protection:

```
Every request → checkRateLimit(ip)
                      │
          ┌───────────┴──────────────────────┐
          ▼                                   ▼
   blockedUntil > now?                  (no cooldown)
   → 429, retry after N sec             Check windows ↓
                      │
          ┌───────────┴──────────────────────┐
          ▼                                   ▼
   Burst window (10s)                  Minute window (60s)
   Max 8 requests/10s                  Max 25 requests/min
          │ exceeded                          │ exceeded
          ▼                                   ▼
   Set blockedUntil (+2 min)           Return 429 window
   Return 429 burst                    retry after 60s
          │
          ▼ all clear → record timestamp, allow
```

| Constant | Value | What it controls |
|---|---|---|
| `RATE_LIMIT_MAX_REQUESTS` | 25 | Max messages per minute per IP |
| `RATE_LIMIT_BURST_MAX_REQUESTS` | 8 | Max messages in any 10-second window |
| `RATE_LIMIT_WINDOW_MS` | 60,000 ms | Rolling 1-minute window |
| `RATE_LIMIT_BURST_WINDOW_MS` | 10,000 ms | Rolling 10-second burst window |
| `RATE_LIMIT_COOLDOWN_MS` | 120,000 ms | IP block duration after burst violation |

**Storage structure:**
```js
const ipRequestMap = new Map();
// Key: IP string  →  Value: { requests: [timestamps], burst: [timestamps], blockedUntil: 0 }
// Timestamps outside their window are pruned on every check (sliding window)
```

**Response when limited (`429`):**
```json
{ "error": "Rate limit exceeded", "retryAfter": 60, "reason": "window" }
```
`reason` can be `"window"`, `"burst"`, or `"cooldown"`.

#### ⚠️ Known Limitation — Serverless Cold Starts
`ipRequestMap` lives in Node.js memory. Vercel spins up **separate function instances** per concurrent request. If two requests hit different warm instances simultaneously, each has its own independent counter. The limiter is best-effort — effective against single-client abuse but not bulletproof under high concurrency.

**Production-grade fix** (not yet implemented): Replace `ipRequestMap` with [Upstash Redis](https://upstash.com) — a serverless Redis that persists across instances with sub-millisecond latency.

---

### FAQ Response Cache (in-memory, TTL-based)

Identical or near-identical questions (e.g. "what is Ramji's experience?") are answered from cache, skipping the AI call entirely — zero tokens consumed, instant response.

**Flow:**
```
Incoming message
      │
      ▼
Cache eligibility check (BOTH must pass):
  1. conversationHistory.length === 0   → first message in session
  2. message.length <= 180 chars        → short, standalone FAQ query
      │
      │ not eligible → skip cache, call AI normally
      │ eligible ↓
      ▼
normalizeMessage(text)
  → lowercase + collapse whitespace
  → "What's Ramji's Experience?" === "what's ramji's experience?"
      │
      ▼
getCachedFaqResponse(normalizedKey)
  → cache miss   → call AI → store result → return to user
  → cache hit    → check age vs TTL (5 min)
       │ fresh   → return cached reply immediately  ← 0 tokens, instant
       │ expired → delete entry → call AI → store fresh result
```

| Constant | Value | Meaning |
|---|---|---|
| `FAQ_CACHE_TTL_MS` | 300,000 ms (5 min) | How long a cached answer stays valid |
| Max message length | 180 chars | Only short queries qualify |
| Turn scope | First turn only | `conversationHistory.length === 0` |

**Why first-turn only?**
Follow-up messages like *"tell me more"* or *"what about his AWS work?"* derive meaning from prior context. Caching those would serve the wrong answer to a different conversation. Only self-contained standalone questions are safe to cache.

**Source attribution when served from cache:**
```
ℹ️ AI Source: Cache (from Groq)
```
The response also carries `tokensUsed: 0` in the payload — visible in Vercel logs.

#### ⚠️ Known Limitation — Serverless Cold Starts
Same as rate limiter: `faqResponseCache` is a `Map()` in Node.js memory. It resets on every cold start and is not shared across instances. For a personal portfolio with low traffic this is fine — the cache warms up quickly within a session. A persistent cache (Upstash Redis or Vercel KV) would be needed for high-traffic scenarios.

### AI Provider Costs

| Priority | Provider | Model | Cost | Free Limit |
|---|---|---|---|---|
| 1 (Primary) | **DeepSeek** | `deepseek-v4-flash` | ~$0.27/M input tokens | — |
| 2 | **Groq** | `openai/gpt-oss-120b` | Free | 14,400 req/day |
| 3 (Fallback) | **OpenAI** | `gpt-4.1-nano` | ~$0.10/M input tokens | — |
| 4 | Local rule-based | — | Free | Unlimited |

> **Model selection** is hardcoded in `api/chat.js` (lines ~92, ~128, ~169). To change a model, update the `model:` field in the corresponding `callDeepSeekAPI()`, `callGroqAPI()`, or `callOpenAI()` function.

### Available models (verified July 2026)

**DeepSeek** (`api.deepseek.com`):
- `deepseek-v4-flash` ← currently used (fast, cheap)
- `deepseek-v4-pro` (higher quality, slightly more expensive)

**Groq** (`api.groq.com`):
- `openai/gpt-oss-120b` ← currently used (OpenAI OSS 120B, best free option — reasoning model)
- `llama-3.3-70b-versatile` (alternative, also free)
- `llama-3.1-8b-instant` (faster, lower quality)
- `groq/compound` (Groq's own model)

**OpenAI** (`api.openai.com`):
- `gpt-4.1-nano` ← currently used (cheapest GPT-4.1 tier)
- `gpt-4.1-mini` (more capable, slightly more expensive)
- `gpt-4.1` (full model, most expensive)
- `gpt-4o-mini` (alternative cheap option)

---

## Environment Variables

Set in **Vercel Dashboard** (Settings → Environment Variables). Never committed to git.

| Variable | Used By | Required |
|---|---|---|
| `DEEPSEEK_API_KEY` | `api/chat.js` | Optional (primary AI) |
| `GROQ_API_KEY` | `api/chat.js` | Optional (secondary AI) |
| `OPENAI_API_KEY` | `api/chat.js` | Optional (tertiary fallback) |

At least one key must be set or all responses fall back to local rule-based answers.

Local development: copy keys into `.env` (already gitignored).

---

## Local Development

```bash
# Install Vercel CLI (one-time)
npm install

# Run with serverless functions (chatbot works)
npm run dev        # → vercel dev --listen 3000

# Run static-only (chatbot falls back to local responses)
npm start          # → python3 -m http.server 8000

# Test the /api/chat endpoint directly
npm test           # → node test-chat-local.js

# Deploy to production
npm run deploy     # → vercel --prod

# Stream live logs
npm run logs       # → vercel logs
```

---

## Deployment Flow

```
git push → GitHub repo
              ↓ (webhook)
         Vercel detects push
              ↓
    Builds & deploys api/chat.js
    Injects env vars (DEEPSEEK_KEY, GROQ_KEY, OPENAI_KEY)
              ↓
    ramji-sridaran.vercel.app live ✅

    (GitHub Pages deploys static files separately
     from the same repo via GitHub Actions)
```

---

## Key Design Decisions

- **No frontend frameworks** — vanilla JS/CSS only. Zero build step, instant load, full control.
- **Split hosting** — GitHub Pages for static (free, reliable) + Vercel for serverless (needed for API keys).
- **DeepSeek-first AI** — cheapest capable model; Groq free tier as safety net; OpenAI as last resort.
- **Per-project tech stacks in SYSTEM_PROMPT** — enables accurate answers to queries like "which projects used Redis" instead of just listing technologies globally.
- **Dynamic experience years** — computed from `new Date(2013, 4, 1)` at runtime so the "13+ years" figure never needs manual updates.
