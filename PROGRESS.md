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

### Session 2 (2026-03-10) — GM Consistency Fix + Save/Load Refinement

**Bug Report**: GM ignores player choices (species, career, vehicle/base). Always starts in Tatooine orbit regardless of selection.

**Root Cause Analysis (5 issues found):**
1. `createNewSession()` in game-state.ts hardcoded `planet: 'Tatooine'`, `location: 'Orbit'`
2. `startGame()` sent generic message without character context to GM
3. System prompt had contradictory scene info (vehicle=base but scene=orbit)
4. `max_tokens: 1024` too low for structured JSON responses
5. Fragile JSON parsing in API route

**Fixes Applied:**
- `src/lib/engine/game-state.ts` — Rewrote `createNewSession()` to accept `SessionStartContext`, added `deriveStartingScene()` (base→start at base, ship→start aboard, none→cantina)
- `src/components/play/ChatInterface.tsx` — Added `buildStartMessage()` with rich character context, updated session init to pass vehicle data
- `src/lib/gm/system-prompt.ts` — Added `buildMandatoryRules()` as top-priority section with character identity, starting point, and consistency rules
- `src/app/api/chat/route.ts` — Increased `max_tokens` to 2048, added regex JSON extraction fallback
- `src/components/play/ChatInterface.tsx` — Fixed pre-existing encoding corruption (549 backslash-escape chars throughout file)

**Save/Load Refinements:**
- Added save format version (`SAVE_FORMAT_VERSION = 2`) for future migrations
- Added data validation (`validateSaveData()`) on load with user-friendly errors
- Added autosave detection and recovery UI in Load tab
- Added success toast messages after save/export operations
- Added message count display per save slot
- Added legacy format support for imported files
- Refactored save/export to use shared `buildSavePayload()` and `restoreFromData()`

**Other Fixes:**
- `README.md` — Complete rewrite, removed broken blockquote nesting
- Confirmed Skills data (`src/lib/skills.ts`, 34 FFG skills) already exists and is complete
- Confirmed Force Powers data (`src/lib/engine/force-powers.ts`, 8 powers) already exists and is complete

**Build**: Passes (Next.js 16.1.6 Turbopack, all 14 routes)

---

## 6. NEXT STEPS (Priority Order)

### Priority 1 — Remaining Data Gaps
Most data exists but some may need expansion:
- `data/json/talents.json` — May have sample data only, needs full talent trees
- Species data split across multiple files — could use consolidation

### Priority 2 — Testing & Quality
- Test full character creation flow end-to-end
- Test GM consistency with various character builds (base vs ship vs none)
- Test save/load with both new and legacy formats

### Priority 3 — Polish
- Organize Google Drive PDFs into subfolders
- Consider adding more Force powers from the rulebook

---

## 7. TECHNICAL DECISIONS

| Decision | Choice | Reason |
|----------|--------|--------|
| Framework | Next.js 16 (App Router) | SSR, API routes, modern React |
| State | Zustand | Simple, persist middleware |
| Styling | Tailwind CSS v4 | Rapid, mobile-first |
| AI | Claude API (claude-sonnet-4-6) | Claude IS the Game Master |
| Dice | Deterministic TypeScript | Must be rules-accurate |
| GM Arch | Single prompt per action | Antigravity 9-agent was too fragmented |
| Language | German (game), English (code) | User preference |
| Save | LocalStorage (6 slots + autosave) + file export | Offline-first |
| Save Format | Versioned JSON (v2) | Future migration support |

---

## 8. KEY URLS

- **GitHub Repo**: https://github.com/bummchuck-ai/quantum-rpg
- **GitHub Account**: bummchuck-ai
- **Google Drive**: https://drive.google.com/drive/folders/1pemd65L-d0JvhjVjE7s35Kal1bOT6Q0g
- **Antigravity Prompts**: https://drive.google.com/drive/folders/1K0QjYoem4MmK1xxbcHyWTHW4gCnUYz7E

---

## 9. NOTES FOR FUTURE AI SESSIONS

1. **The dice engine is DONE.** Do not rebuild it. See src/lib/engine/dice.ts.
2. **Skills and Force Powers are DONE.** See src/lib/skills.ts and src/lib/engine/force-powers.ts.
3. **Do NOT use the Antigravity multi-agent approach.** Use ONE Claude API call per player action.
4. **GM consistency is now enforced** via `buildMandatoryRules()` in system-prompt.ts. If the GM still drifts, strengthen those rules.
5. **ChatInterface.tsx had encoding corruption** (backslash-escaped quotes/newlines). If it happens again, check the file for `\'`, `\"`, `\n` literals.
6. **User communicates in German**, code/docs in English.
7. **Save format is versioned (v2).** If the data structure changes, increment the version and add migration logic.
8. **Character creation depth is the #1 user priority.** Felix tried many times — it was always incomplete. This time it MUST cover every option.
