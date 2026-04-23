# Quantum RPG — CLAUDE.md

Star Wars RPG App für Jaaron (9). KI-Spielleiter via Claude API. Mobile-First (iPhone Safari).

## Stack
- Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Zustand 5
- Supabase (Auth + DB) | Anthropic SDK (`@anthropic-ai/sdk`)
- Deployment: Vercel | Repo: bummchuck-ai/quantum-rpg

## Key Commands
```bash
npm run dev       # Lokaler Dev-Server
npm run build     # TypeScript-Check + Build (IMMER vor Deploy!)
npm run lint      # ESLint
vercel --prod     # Deploy nach erfolgreichem Build
```

## Deployment-Workflow
1. `npm run build` — bei TypeScript-Fehlern NICHT deployen
2. `vercel --prod` — direkt danach

## Projektstruktur
```
src/
  app/           # Next.js App Router (Seiten + API Routes)
    api/         # Server-Side API (Claude GM, Supabase)
    create/      # Charakter-Erstellung
    play/        # Hauptspiel-Loop
  components/    # React-Komponenten
    create/      # Charakter-Erstellung
    play/        # Spielansicht
    shared/      # Wiederverwendbare UI
    ui/          # Basis-UI-Elemente
  store/         # Zustand Stores
  hooks/         # Custom Hooks
  lib/           # Hilfsfunktionen, Supabase-Client
  types/         # TypeScript-Typen
data/
  json/          # Spieldaten (Spezies, Karrieren, Items, etc.)
  merchants.json
```

## Wichtige Regeln
- **Mobile-First** — alles auf iPhone-Viewport testen (375px)
- **Star Wars Ton** — UI, Texte, Feedback immer im SW-Universum
- **Kein Payment** — Stripe-Dependency ignorieren, keine Paywall einbauen
- **Kein WhatsApp** — Kommunikation nur Telegram (intern) oder E-Mail
- GM-API = Claude Sonnet (Anthropic SDK) — kein Modell-Downgrade ohne Absprache
- Supabase für Spielstände — lokal `.env.local` nötig

## Env-Variablen (lokal: `.env.local`)
```
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
