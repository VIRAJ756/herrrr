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
│  Leaflet UI + SOS + Journey│                 │ REST + Socket.io          │
│  React Query + Zustand    │──────REST───────▶│ Zod validation            │
└─────────────┬────────────┘                  └─────────────┬────────────┘
              │                                              │
              │                                              │ Prisma
              │                                              ▼
              │                                      ┌───────────────────┐
              │                                      │ SQLite (temp)      │
              │                                      └───────────────────┘
              │
              ├──────────────▶ Browser Geolocation
              ├──────────────▶ Heuristic AI Risk Layer
              └──────────────▶ Twilio/Web Push hooks
```

## Feature checklist
- ✓ Leaflet dashboard shell with realtime heatmap circles
- ✓ Incident reporting + community feed
- ✓ Dynamic risk engine + `/api/zones/heatmap`
- ✓ SOS trigger + active emergency UI
- ✓ Journey lifecycle + public tracking page
- ✓ Contacts CRUD + test alert flow
- ✓ AI risk analysis panel
- ✓ Safe route estimate on journey setup
- ✓ Voice activation + fake call escape

## Tech stack (locked)
- **Frontend**: React 18 + TypeScript + Vite, Tailwind v3, shadcn/ui
- **Map**: Leaflet + OpenStreetMap
- **State**: Zustand + React Query v5
- **Realtime**: Socket.io (client + server)
- **Backend**: Node.js + Express + TypeScript
- **DB**: SQLite (temporary) + Prisma
- **Notifications**: Simulated SMS (demo mode) + WhatsApp fallback — zero-cost demo with real fallback option
- **AI**: Google Gemini integration with heuristic fallback — enhanced risk analysis when API key configured

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
- `GET /api/incidents`
- `POST /api/incidents`
- `GET /api/zones/heatmap`
- `POST /api/journey/start`
- `POST /api/journey/complete`
- `GET /api/journey/active`
- `GET /api/journey/track/:token`
- `GET /api/contacts`
- `POST /api/contacts`
- `DELETE /api/contacts/:id`
- `POST /api/contacts/:id/test-alert`
- `POST /api/ai/risk-analysis`
- `POST /api/ai/safe-route`

## Live demo
- Web: (Vercel URL here)
- API: (Railway URL here)

## Team
- (name)
- (name)
