# GUARDIAN — Women Safety & Risk Zone Mapping Platform
*"Every location. Every moment. Protected."*

## Problem
India reports persistent threats to women’s safety in public spaces: harassment hotspots, poorly lit corridors, and delayed response when someone is in danger. People need **operator-grade situational awareness** and **fast escalation**—not just an “emergency button”.

## Solution
GUARDIAN is a dark, intelligence-first safety platform with:
- Real-time SOS escalation to trusted contacts
- Live journey sharing with overdue detection
- Risk zone heatmaps computed from recent incidents
- AI risk analysis summaries and safety recommendations

## Architecture (high level)

```
┌──────────────────────────┐     WebSocket     ┌──────────────────────────┐
│  React + Vite (web)       │◀────────────────▶│ Node + Express (api)      │
│  Map UI + SOS + Journey   │                  │ REST + Socket.io          │
│  React Query + Zustand    │──────REST───────▶│ Zod validation            │
└─────────────┬────────────┘                  └─────────────┬────────────┘
              │                                              │
              │                                              │ Prisma
              │                                              ▼
              │                                      ┌───────────────────┐
              │                                      │ Postgres (Supabase)│
              │                                      └───────────────────┘
              │
              ├──────────────▶ Supabase Auth / Storage
              ├──────────────▶ OpenAI (risk analysis)
              └──────────────▶ Twilio (SMS alerts)
```

## Feature checklist
- ✓ Auth gate + Supabase client wiring
- ✓ Dashboard shell (map-first mission-control UI)
- ✓ Risk zone heatmap endpoint + map overlay
- ✓ SOS trigger + realtime broadcast to contacts
- ✓ Journey tracking pings + zone entry alerts
- ⭐ AI risk analysis (GPT-4o mini)
- ⭐ Safe route overlay (Google Routes API)
- ⭐ Voice activation + fake call escape

## Tech stack (locked)
- **Frontend**: React 18 + TypeScript + Vite, Tailwind v3, shadcn/ui
- **Map**: Mapbox GL JS (fallback supported)
- **State**: Zustand + React Query v5
- **Realtime**: Socket.io (client + server)
- **Backend**: Node.js + Express + TypeScript
- **DB**: PostgreSQL (Supabase) + Prisma
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage (incident media)
- **Notifications**: Web Push + Twilio SMS
- **AI**: OpenAI GPT-4o mini + Google Maps Routes API

## Local setup (under 5 commands)
1) Copy env:

```bash
cp .env.example .env
```

2) Install:

```bash
cd apps/web && npm i
cd ../api && npm i
```

3) Prisma (after setting `DATABASE_URL`):

```bash
cd apps/api && npx prisma generate && npx prisma db push
```

4) Run both:

```bash
cd apps/api && npm run dev
cd ../web && npm run dev
```

## Demo mode
Open the web app with `?demo=true` to seed fake incidents + run a simulated journey + trigger a zone alert + show a prefilled AI panel.

## API quick reference
- `GET /api/health`
- `GET /api/zones/heatmap`
- `POST /api/incidents`
- `GET /api/incidents?near=lat,lng`
- `POST /api/ai/risk-analysis`
- `POST /api/ai/safe-route`

## Live demo
- Web: (Vercel URL here)
- API: (Railway URL here)

## Team
- (name)
- (name)

