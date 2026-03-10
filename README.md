# QUANTUM RPG

> A Star Wars-inspired AI Game Master RPG — powered by Claude API.
> Character creation, FFG dice mechanics, and cinematic storytelling.

## Vision

Quantum RPG is a solo RPG app where an AI (Claude) acts as the Game Master. Create your character with the full depth of pen & paper rules, then explore the galaxy through cinematic, narrative-driven gameplay.

## Architecture

```
Frontend (Next.js 16 + Tailwind CSS v4)
  |-- Character Creator (10-step wizard)
  |-- Play Session (chat-based GM interface)
  |-- Dice Roller (visual FFG dice)
  |-- Character Sheet (stats, inventory, talents)
  |
Backend (Next.js API Routes)
  |-- Game Engine (dice.ts, combat.ts, game-state.ts)
  |-- GM Brain (Claude API with dynamic system prompts)
  |-- Save System (localStorage + JSON file export)
  |
Data Layer (TypeScript + JSON)
  |-- skills.ts (34 FFG skills with German names)
  |-- force-powers.ts (8 core Force powers with upgrade trees)
  |-- data/json/careers.json (all careers + specializations)
  |-- data/json/gear.json (weapons, armor, equipment)
  |-- data/json/vehicles.json (ships + bases)
  |-- data/json/species_*.json (species data)
```

## Current Status

### Done
- [x] Repository created
- [x] Dice Engine (`src/lib/engine/dice.ts`) — Full FFG narrative dice system
- [x] Type Definitions (`src/types/character.ts`) — Complete character data model
- [x] GM System Prompt (`src/lib/gm/system-prompt.ts`) — AI Game Master brain
- [x] Skills Data (`src/lib/skills.ts`) — All 34 FFG skills
- [x] Force Powers (`src/lib/engine/force-powers.ts`) — 8 powers with upgrade trees
- [x] Character Creator UI (10-step wizard)
- [x] Play Session UI (chat interface)
- [x] Claude API integration
- [x] Save/Load system (6 slots + file export/import + auto-save)
- [x] Dice Roller UI component
- [x] Combat Tracker
- [x] Force Powers Panel
- [x] Quest Log
- [x] Inventory Panel

### In Progress
- [ ] GM consistency improvements (character context, starting scene)
- [ ] Save/Load system refinement

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **State:** Zustand
- **Language:** TypeScript
- **AI:** Claude API (Anthropic) — claude-sonnet-4-6
- **Deployment:** Vercel

## Game Rules

Based on the FFG Star Wars RPG system (Edge of the Empire / Age of Rebellion / Force and Destiny) with custom adaptations.

## Source Material (Google Drive)

The complete ruleset lives in PDF form:
- Charaktererschaffung V14 (34 pages)
- The Complete Species Guide v6 (358 pages)
- SW Talentbaeume V26 (179 pages)
- Waffen und Ruestungen V4 (33 pages)
- Fertigkeiten 1-2-1 (12 pages)
- SW Machtkraefte V4 (23 pages)
- Kampf Treffer Verletzungen V1
- Regeln V1 (18 pages)
- Hausregeln

## License

Private project.
