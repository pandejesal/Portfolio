# Jesal Pande — Portfolio

18-year-old from Ahmedabad, India, on a gap year before a Mechanical/Mechatronics Engineering degree in Canada. Founder of **Erowan** (formerly GlassDoors Studio). I act as systems architect — mapping concepts and workflows — and use AI as my coding tutor and compiler for exact syntax. Honesty is my brand.

Live site: https://pandejesal.github.io/Portfolio/

## Featured work

* **Erowan (formerly GlassDoors Studio)** — https://erowan.vercel.app · Gulf niche websites (salons, restaurants, clinics, real estate). Next.js 14 + TypeScript + Tailwind on Vercel. $250 base + $150 booking/ordering, 48h delivery. Demos carry an honest "Concept Demo — Not a real client" badge.
* **WSB Alpha System** — https://pandejesal.github.io/WSB-Alpha-System/ · Autonomous agentic quant system (retail sentiment → statistically-hardened strategies → paper execution) on GitHub free tier. ~130 Python modules, 15 strategy specs, 14 Actions pipelines. Lookahead-free T+1, permutation / walk-forward / deflated-Sharpe gates, fail-closed ops (`LIVE_TRADING_ENABLED=False`).
* **Resonance** — Self-hosted music archival (Rust + React): bit-perfect playback, 500k+ tracks, FTS5 search, Subsonic API, PWA offline, Android shell via JNI.
* **Binance Futures Trading Bot** — Zero-dependency Python CLI for USDT-M Testnet (HMAC-SHA256 REST, clock-drift correction, secret-redacting logs) + React dashboard.
* **SafeSponsor-AI** — Next.js 15 brand-safety dossiers: web research, YouTube transcript + comment toxicity audit, 0–100 score, Gemini with Groq fallback, Firebase + Dodo Payments.
* **Project-Rainfall** — AI-powered intelligent web application that eliminates language barriers and automates FIR data extraction.
* **LinkedIn Post CLI** — Terminal poster with free Gemini ghostwriter mode.

## How it works

* **Frontend (`index.html` & `style.css`):** Structure, layout, responsive 3-column grid, dark-black / midnight-blue themes.
* **Interactive layer (`script.js`):** Leaflet location map (guarded init + OSM fallback), theme toggle, GitHub repo stats (30-min cache), contribution heatmap (primary API → honest recent-events fallback → honest empty state; never synthetic data).
* **Server (`server.js`):** Lightweight Express static server for local dev only (`PORT` env supported, basic hardening headers).
* **Deployment:** Production is static hosting via GitHub Pages. `npm run build` copies `index.html`/`style.css`/`script.js` to `dist/` (cross-platform).

## Tech stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript, Leaflet 1.9.4
* **Local dev:** Node.js + Express
* **Hosting:** GitHub Pages

## Local development

```bash
npm install
npm run dev   # http://localhost:3000
npm run build # cross-platform copy to dist/
```
