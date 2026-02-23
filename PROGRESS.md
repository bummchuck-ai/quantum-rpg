# QUANTUM RPG — Project Progress & Context

**Purpose**: This file contains everything an AI assistant (Claude or other) needs to continue working on this project. Read this file FIRST before doing anything.

**Last updated**: 2026-02-23  
**Last session by**: Claude (via Browser MCP)

---

## 1. PROJECT VISION

Quantum RPG is a **solo Star Wars RPG app** where **Claude (AI) acts as the Game Master**.

The player creates a full character (species, career, specialization, obligation, motivation, gear), then explores planets, takes on missions, and plays through cinematic story arcs — all narrated by the AI Game Master. Dice rolls use the **FFG Star Wars narrative dice system** (Boost, Setback, Ability, Difficulty, Proficiency, Challenge, Force dice).

**Core Principles:**
- Character creation must be COMPLETE — every step from the 34-page rulebook, nothing simplified
- Dice mechanics are deterministic TypeScript code (NOT left to the AI to improvise)
- Claude handles ONLY narrative: storytelling, NPCs, world reactions, player options
- The app must work as a standalone web app with Claude API integration
- Game language: German (narration, UI)
- Mobile-first responsive design

**Owner**: Felix (GitHub: bummchuck-ai)  
**Previous attempts**: Google AI Studio sessions, Antigravity (9-agent system) — both lacked depth

---

## 2. REPOSITORY

- **GitHub**: https://github.com/bummchuck-ai/quantum-rpg
- **Branch**: main
- **Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, Zustand (state), Claude API

### Current File Structure

```
quantum-rpg/
├── README.md                          # Project overview
├── PROGRESS.md                        # THIS FILE — AI context & progress tracking
├── .gitignore                         # Node gitignore
└── src/
    ├── lib/
    │   ├── engine/
    │   │   └── dice.ts                # ✅ FFG dice engine (~300 lines)
    │   └── gm/
    │       └── system-prompt.ts       # ✅ GM system prompt builder (~210 lines)
    └── types/
        └── character.ts               # ✅ Complete type definitions (~325 lines)
```

### Files Created So Far

**src/lib/engine/dice.ts** — Full FFG narrative dice engine
- All 7 dice types with correct symbol distributions
- rollDie(), rollPool(), interpretResult() functions
- buildDicePool() from character skill + characteristic
- Net result calculation (successes minus failures, etc.)
- Triumph/Despair tracking

**src/types/character.ts** — Complete TypeScript type system
- Species, Career, Specialization interfaces
- CharacterSheet with all attributes (characteristics, skills, talents, etc.)
- Obligation, Motivation, Wound/Strain tracking
- GameState, GameSession, Planet, Mission types
- DiceResult, DicePool types

**src/lib/gm/system-prompt.ts** — AI Game Master brain
- buildSystemPrompt(gameState) — generates context-aware GM prompt
- Includes character state, location, active mission, recent history
- Rules for GM behavior: narrate in German, offer 3-4 options, never roll dice
- Tone guide: cinematic Star Wars atmosphere

---

## 3. GOOGLE DRIVE — SOURCE MATERIALS

**Main folder**: QUANTUM RPG  
**URL**: https://drive.google.com/drive/folders/1pemd65L-d0JvhjVjE7s35Kal1bOT6Q0g

### PDFs (Rulebooks — THE primary data source)

| File | Pages | Content | Extracted? |
|------|-------|---------|------------|
| Charaktererschaffung V14.pdf | 34 | Full character creation rules (10 steps) | ❌ Read, not JSON |
| The Complete Species Guide v6.pdf | 358 | All Star Wars species with stats | ❌ Not extracted |
| SW Talentbäume V26.pdf | 179 | All talent trees for all careers | ❌ Not extracted |
| Fertigkeiten-1-2-1.pdf | 12 | Skills system (all skills + descriptions) | ❌ Not extracted |
| Waffen und Rüstungen V4.pdf | 33 | Weapons and armor catalog | ❌ Not extracted |
| SW Machtkräfte V4.pdf | 23 | Force powers | ❌ Not extracted |
| Regeln V1.pdf | 18 | Core rules (dice, environment, combat) | ❌ Read, not JSON |
| Kampf Treffer Verletzungen V1.pdf | ? | Combat, hits, critical injuries | ❌ Not extracted |
| Hausregeln (1).pdf | ? | House rules | ❌ Not extracted |
| SW Sprachkenntnisse.pdf | ? | Language skills for species | ❌ Not extracted |
| SW_Referenzbogen.pdf | ? | Reference sheet | ❌ Not extracted |
| Tatooine Herausforderungen.pdf | ? | Tatooine scenario/challenges | ❌ Not extracted |
| ZdR_Charakterbogen_ausfuellbar.pdf | ? | Fillable character sheet | ❌ Reference only |

### Subfolders

**Antigravity - Quantum RPG/** — Previous 9-agent system attempt  
Contains prompts: orchestrator.md, game_master.md, mechanics_agent.md, character_creator_archivar.md, equipment_master.md, memory_core_custodian.md, comms_link_agent.md, player_spotlight.md, translation_protocol.md, visual_architect.md  
**Verdict**: Too fragmented. Use ONE Claude call per action with comprehensive system prompt instead.

**Quantum - RPG App/** — Previous Next.js app (v3, astrum-versum-rpg)  
Has basic structure but nearly empty content (only 2 species in species.json). Reference only — we rebuild from scratch.

**Kopie 21.11.25/** — Backup copy of earlier state.

---

## 4. CHARACTER CREATION — 10 STEPS

From Charaktererschaffung V14.pdf:

1. **Background/Concept** — Player decides who their character is
2. **Species Selection** — Choose species, get base characteristics + XP + special abilities
3. **Career Selection** — Choose 1 of 6+ careers (each has 8 career skills)
4. **Specialization** — Choose starting specialization (adds 4 career skills + talent tree)
5. **Invest Starting XP** — Spend XP on characteristics (costs increase per tier)
6. **Obligation/Duty/Morality** — Choose type + magnitude (affects starting resources)
7. **Motivation** — Select Desire, Fear, Strength, Weakness
8. **Gear & Resources** — Starting credits based on obligation, buy initial gear
9. **Derived Attributes** — Calculate wound threshold, strain threshold, defense, soak
10. **Final Details** — Name, appearance, backstory, group resource

**Careers (Edge of the Empire):** Bounty Hunter, Colonist, Explorer, Hired Gun, Smuggler, Technician  
**Careers (Age of Rebellion):** Commander, Diplomat, Engineer, Soldier, Spy, Ace  
**Careers (Force and Destiny):** Consular, Guardian, Mystic, Seeker, Sentinel, Warrior  

**Characteristics (6):** Brawn, Agility, Intellect, Cunning, Willpower, Presence

---

## 5. SESSION LOG

### Session 1 (2026-02-23)

**Phase 1 — Research & Analysis:**
- Explored entire Google Drive QUANTUM RPG folder
- Inventoried all PDFs (13+ rulebooks)
- Read full text of Regeln V1.pdf (18 pages) — core rules, dice mechanics
- Read full text of Charaktererschaffung V14.pdf (34 pages) — character creation
- Viewed/skimmed: Species Guide (358p), Talentbäume (179p), Waffen (33p), Machtkräfte (23p), Fertigkeiten (12p)
- Analyzed existing Next.js app code structure (astrum-versum-rpg)
- Read all Antigravity agent prompts
- Conclusion: Previous app had skeleton but no real content/data

**Phase 2 — Architecture & Core Files:**
- Created GitHub repository: bummchuck-ai/quantum-rpg (Public)
- Designed architecture: Next.js 14 + TypeScript + Tailwind + Zustand + Claude API
- Created src/lib/engine/dice.ts — complete FFG dice engine
- Created src/types/character.ts — full type system for game state
- Created src/lib/gm/system-prompt.ts — GM system prompt builder
- Updated README.md with architecture overview
- Created this PROGRESS.md file

---

## 6. NEXT STEPS (Priority Order)

### Priority 1 — Data Extraction (PDFs to JSON)
These JSON files are CRITICAL. Without them, character creation cannot work.

```
content/rules/species.json      ← Complete Species Guide v6 (358 pages)
content/rules/careers.json      ← Charaktererschaffung V14 + Talentbäume
content/rules/talents.json      ← SW Talentbäume V26 (179 pages)
content/rules/skills.json       ← Fertigkeiten-1-2-1 (12 pages)
content/rules/weapons.json      ← Waffen und Rüstungen V4 (33 pages)
content/rules/force_powers.json ← SW Machtkräfte V4 (23 pages)
```

### Priority 2 — Character Engine
- src/lib/engine/character.ts — Derived stats, XP validation, skill ranks

### Priority 3 — Next.js Project Setup
- package.json, tsconfig.json, tailwind.config.ts, next.config.js
- App layout, global styles, fonts
- API route: /api/game/action (Claude API integration)

### Priority 4 — Character Creator UI
- 10-step wizard component (mobile-first)

### Priority 5 — Game Session UI
- Chat-based GM interface, dice roller, character sheet sidebar

### Priority 6 — Housekeeping
- Fix README.md formatting
- Organize Google Drive PDFs into subfolders

---

## 7. TECHNICAL DECISIONS

| Decision | Choice | Reason |
|----------|--------|--------|
| Framework | Next.js 14 (App Router) | SSR, API routes, modern React |
| State | Zustand | Simple, persist middleware |
| Styling | Tailwind CSS | Rapid, mobile-first |
| AI | Claude API (Anthropic) | Claude IS the Game Master |
| Dice | Deterministic TypeScript | Must be rules-accurate |
| GM Arch | Single prompt per action | Antigravity 9-agent was too fragmented |
| Language | German (game), English (code) | User preference |
| Save | LocalStorage + optional cloud | Offline-first |

---

## 8. KEY URLS

- **GitHub Repo**: https://github.com/bummchuck-ai/quantum-rpg
- **GitHub Account**: bummchuck-ai
- **Google Drive**: https://drive.google.com/drive/folders/1pemd65L-d0JvhjVjE7s35Kal1bOT6Q0g
- **Antigravity Prompts**: https://drive.google.com/drive/folders/1K0QjYoem4MmK1xxbcHyWTHW4gCnUYz7E

---

## 9. NOTES FOR FUTURE AI SESSIONS

1. **PDF extraction is the bottleneck.** 358-page Species Guide and 179-page Talent Trees need structured JSON. Consider uploading PDFs directly to Claude or using extraction scripts.
2. **Character creation depth is the #1 user priority.** Felix tried many times — it was always incomplete. This time it MUST cover every option.
3. **The dice engine is DONE.** Do not rebuild it. See src/lib/engine/dice.ts.
4. **Do NOT use the Antigravity multi-agent approach.** Use ONE Claude API call per player action with comprehensive system prompt (see src/lib/gm/system-prompt.ts).
5. **The astrum-versum-rpg app in Google Drive is reference only.** We build fresh.
6. **README.md needs a formatting fix** — blockquote nesting issue.
7. **User communicates in German**, code/docs in English.
8. **For faster development**, use a local dev environment (Cursor, Windsurf, or Claude Code CLI) instead of the GitHub web interface.
