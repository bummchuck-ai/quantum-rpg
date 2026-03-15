# Quantum RPG — Comprehensive Refactor Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all security, architecture, and duplication issues from the comprehensive code review — secure the API, break apart ChatInterface.tsx, unify duplicate types, centralize derived stats.

**Architecture:** 8 independent tasks. Each task is self-contained and can be verified via `npm run build`. No feature changes — only security hardening, refactoring, and deduplication. All tasks operate in `~/Desktop/quantum-rpg/`.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4.2, Zustand 5

---

### Task 1: Secure the API endpoint

**Why:** The `/api/chat` raw-messages path is an open Claude proxy. Anyone can send arbitrary prompts through your API key. This is the #1 security risk.

**Files:**
- Modify: `src/app/api/chat/route.ts`

**Step 1: Add an API secret token**

Add a `QUANTUM_API_SECRET` environment variable check. The raw-messages path (used by IntroCrawl/StoryGenerator) must include this token. The game-state path (used by ChatInterface) must also include it.

In `src/app/api/chat/route.ts`, add after the rate limiter:

```typescript
const API_SECRET = process.env.QUANTUM_API_SECRET;
```

**Step 2: Add token validation at start of POST handler**

Replace the current POST handler opening with:

```typescript
export async function POST(req: Request) {
  // Auth check
  const authHeader = req.headers.get('x-api-secret');
  if (API_SECRET && authHeader !== API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Zu viele Anfragen. Bitte warte einen Moment.' },
      { status: 429 }
    );
  }
```

**Step 3: Sanitize error details**

Replace the catch block error response:

```typescript
  } catch (error) {
    console.error('GM Error:', error);
    return NextResponse.json(
      { error: 'DER GAME MASTER IST AKTUELL NICHT ERREICHBAR.' },
      { status: 500 }
    );
  }
```

Remove `details` field entirely — never expose error internals to the client.

**Step 4: Add security headers via next.config.ts**

Replace `next.config.ts` with:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**Step 5: Add the secret header to all fetch calls in the frontend**

Search all files that call `/api/chat` and add the header. The secret will be a build-time env var `NEXT_PUBLIC_API_SECRET`.

In `src/components/play/ChatInterface.tsx`, find every `fetch('/api/chat'` call and add:

```typescript
headers: {
  'Content-Type': 'application/json',
  'x-api-secret': process.env.NEXT_PUBLIC_API_SECRET || '',
},
```

Also check: `src/components/start/IntroCrawl.tsx`, `src/components/play/StoryGenerator.tsx` or wherever raw-messages calls are made. Add the same header.

**Step 6: Add env vars to Vercel**

Add to `.env.local` (for local dev):
```
QUANTUM_API_SECRET=your-random-secret-here
NEXT_PUBLIC_API_SECRET=your-random-secret-here
```

Both values must match. Also set these on Vercel dashboard.

**Step 7: Verify build**

Run: `npm run build`
Expected: BUILD SUCCESS

**Step 8: Commit**

```bash
git add next.config.ts src/app/api/chat/route.ts src/components/ .env.local
git commit -m "security: add API auth token, security headers, sanitize errors"
```

---

### Task 2: Centralize derived stats calculation

**Why:** Wound threshold, strain threshold, soak, and defense are calculated identically in ChatInterface.tsx and CharacterSummary.tsx. A single source of truth prevents bugs.

**Files:**
- Create: `src/lib/engine/derived-stats.ts`
- Modify: `src/components/play/ChatInterface.tsx` (remove inline calculation)
- Modify: `src/components/create/CharacterSummary.tsx` (remove inline calculation)

**Step 1: Create `derived-stats.ts`**

```typescript
import type { Species, Characteristics } from '@/types/character';
import type { Gear } from '@/types/gear';

export interface DerivedStatsResult {
  woundThreshold: number;
  strainThreshold: number;
  soak: number;
  defense: number;
}

export function calculateDerivedStats(
  species: Species,
  characteristics: Characteristics,
  inventory: Gear[]
): DerivedStatsResult {
  const armorItems = inventory.filter(
    (g) => g.category === 'Rüstung' || g.category === 'Armor'
  );

  return {
    woundThreshold: species.woundThresholdBase + characteristics.brawn,
    strainThreshold: species.strainThresholdBase + characteristics.willpower,
    soak:
      characteristics.brawn +
      armorItems.reduce((acc, curr) => acc + (curr.soak || 0), 0),
    defense: armorItems.reduce(
      (acc, curr) => Math.max(acc, curr.defense || 0),
      0
    ),
  };
}
```

**Step 2: Replace calculation in ChatInterface.tsx**

Find the inline derived stats block (around lines 248-256) and replace with:

```typescript
import { calculateDerivedStats } from '@/lib/engine/derived-stats';

// ... inside the component:
const { woundThreshold, strainThreshold, soak, defense } = calculateDerivedStats(
  species, characteristics, inventory
);
```

Remove the old `const woundThreshold = ...`, `const strainThreshold = ...`, etc. lines.

**Step 3: Replace calculation in CharacterSummary.tsx**

Same pattern — import `calculateDerivedStats` and replace inline calculation.

**Step 4: Verify build**

Run: `npm run build`
Expected: BUILD SUCCESS

**Step 5: Commit**

```bash
git add src/lib/engine/derived-stats.ts src/components/play/ChatInterface.tsx src/components/create/CharacterSummary.tsx
git commit -m "refactor: centralize derived stats calculation"
```

---

### Task 3: Unify Quest type definitions

**Why:** Quest is defined in 3 places with different shapes. This causes subtle bugs when one definition adds a field the others don't have.

**Files:**
- Modify: `src/types/quest.ts` (canonical definition)
- Modify: `src/types/character.ts` (remove duplicate, re-export from quest.ts)
- Modify: `src/lib/engine/game-state.ts` (remove duplicate, import from quest.ts)
- Modify: `src/store/characterStore.ts` (update imports if needed)

**Step 1: Make `src/types/quest.ts` the single source of truth**

Replace entire file:

```typescript
export interface QuestObjective {
  id?: string;
  description: string;
  completed: boolean;
  currentProgress?: number;
  targetProgress?: number;
}

export interface QuestReward {
  type: 'exp' | 'credits' | 'item';
  value: number | string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
  objectives: QuestObjective[];
  rewards: QuestReward[];
  giver?: string;
  location?: string;
  xpReward?: number;
  creditsReward?: number;
}
```

This merges all 3 definitions: the `giver`/`location` fields from character.ts, the `xpReward`/`creditsReward` from game-state.ts, and the `id`/`completed` field naming from character.ts.

**Step 2: Remove Quest types from `src/types/character.ts`**

Delete the `QuestObjective`, `QuestReward`, and `QuestEntry` interfaces. Add re-export:

```typescript
export type { Quest, QuestObjective, QuestReward } from './quest';
// Use "Quest" everywhere instead of "QuestEntry"
```

Then search-replace all `QuestEntry` usages to `Quest`.

**Step 3: Remove Quest interface from `src/lib/engine/game-state.ts`**

Delete the local `Quest` interface (lines 7-15). Import from quest.ts:

```typescript
import type { Quest } from '@/types/quest';
```

Update the `objectives` field usage — old code used `{ description: string; completed: boolean }` inline. Now uses `QuestObjective` interface.

**Step 4: Update all imports**

Search all files importing Quest-related types and update to import from `@/types/quest`.

Run: `grep -rn "QuestEntry\|from.*quest\|from.*character.*Quest" src/`

Fix each file.

**Step 5: Verify build**

Run: `npm run build`
Expected: BUILD SUCCESS

**Step 6: Commit**

```bash
git add src/types/quest.ts src/types/character.ts src/lib/engine/game-state.ts src/
git commit -m "refactor: unify Quest type to single source of truth"
```

---

### Task 4: Unify CriticalInjury type definitions

**Why:** CriticalInjury is defined in both `combat.ts` and `game-state.ts` with different fields. Merge into one.

**Files:**
- Modify: `src/lib/engine/combat.ts` (canonical definition)
- Modify: `src/lib/engine/game-state.ts` (remove duplicate, import from combat.ts)

**Step 1: Merge CriticalInjury in `combat.ts`**

Update the existing interface to include the `healedAt` field from game-state.ts:

```typescript
export interface CriticalInjury {
  id: string;
  name: string;
  severity: number;
  effect: string;
  permanent: boolean;
  healedAt?: string; // ISO date when healed
}
```

**Step 2: Remove from `game-state.ts`**

Delete the local `CriticalInjury` interface. Import from combat.ts:

```typescript
import type { CriticalInjury } from './combat';
```

Re-export it so existing imports don't break:

```typescript
export type { CriticalInjury } from './combat';
```

**Step 3: Verify build**

Run: `npm run build`
Expected: BUILD SUCCESS

**Step 4: Commit**

```bash
git add src/lib/engine/combat.ts src/lib/engine/game-state.ts
git commit -m "refactor: unify CriticalInjury type definition"
```

---

### Task 5: Remove duplicate SKILL_CHARACTERISTICS

**Why:** SKILL_CHARACTERISTICS is defined in both `character.ts` (hardcoded) and `skills.ts` (computed from ALL_SKILLS). The `skills.ts` version is canonical.

**Files:**
- Modify: `src/types/character.ts` (remove static SKILL_CHARACTERISTICS)
- Modify: all files importing SKILL_CHARACTERISTICS from character.ts

**Step 1: Find all imports of SKILL_CHARACTERISTICS**

Run: `grep -rn "SKILL_CHARACTERISTICS" src/`

Note which files import from `character.ts` vs `skills.ts`.

**Step 2: Remove from `character.ts`**

Delete the `SKILL_CHARACTERISTICS` object (lines 66-102 in character.ts).

Add re-export:

```typescript
export { SKILL_CHARACTERISTICS } from '@/lib/skills';
```

This way any existing imports from character.ts still work.

**Step 3: Verify build**

Run: `npm run build`
Expected: BUILD SUCCESS

**Step 4: Commit**

```bash
git add src/types/character.ts src/
git commit -m "refactor: remove duplicate SKILL_CHARACTERISTICS, use skills.ts as SPoT"
```

---

### Task 6: Break apart ChatInterface.tsx (God Component)

**Why:** 1167 lines in one component is unwieldy. This is the hardest task but yields the biggest maintainability win.

**Files:**
- Create: `src/components/play/GMMessageBubble.tsx`
- Create: `src/components/play/PlayerInput.tsx`
- Create: `src/components/play/useGameSession.ts` (custom hook)
- Modify: `src/components/play/ChatInterface.tsx` (reduce to orchestrator)

**Step 1: Extract SKILL_MAP and resolveSkill to a shared module**

Create nothing new — move the `SKILL_MAP` constant (lines 28-116) and `resolveSkill()` function (lines 118-121) into `src/lib/skills.ts` since that's where skill data lives. Export them.

In `src/lib/skills.ts`, add at the bottom:

```typescript
// DE/EN skill name → store key + characteristic
export const SKILL_MAP: Record<string, { key: string; char: string }> = {
  'astronavigation': { key: 'astrogation', char: 'intellect' },
  'astrogation': { key: 'astrogation', char: 'intellect' },
  // ... (full map from ChatInterface.tsx lines 28-116)
};

export function resolveSkill(name: string): { key: string; char: string } | undefined {
  return SKILL_MAP[name.toLowerCase().trim()];
}
```

In `ChatInterface.tsx`, replace the inline SKILL_MAP with:
```typescript
import { SKILL_MAP, resolveSkill } from '@/lib/skills';
```

Delete lines 28-121.

**Step 2: Extract the custom hook `useGameSession`**

Create `src/components/play/useGameSession.ts` containing:
- All game session state (messages, loading, session, combat)
- `buildGameState()` function (lines 307-344)
- `handleGMResponse()` function (lines 426-627)
- `handleUserSubmit()` function (lines 629-675)
- `handleDifficultyRoll()` function (lines 346-425)
- Auto-save effect (lines 287-305)
- Session restore from PENDING_RESTORE_KEY

The hook should return:
```typescript
{
  messages, isLoading, session, combatState,
  handleUserSubmit, handleDifficultyRoll,
  // whatever else the UI needs
}
```

**Step 3: Extract `GMMessageBubble.tsx`**

Create `src/components/play/GMMessageBubble.tsx` containing the message rendering logic (lines 1043-1088 of original). Props:

```typescript
interface GMMessageBubbleProps {
  message: { role: 'gm' | 'player'; content: string | GMResponse };
  onOptionSelect: (optionId: string) => void;
}
```

**Step 4: Extract `PlayerInput.tsx`**

Create `src/components/play/PlayerInput.tsx` containing the input area (lines 1090-1167). Props:

```typescript
interface PlayerInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  combatActive: boolean;
  onEndCombat: () => void;
}
```

**Step 5: Refactor `ChatInterface.tsx` to orchestrator**

ChatInterface.tsx should now be ~100-150 lines that:
1. Calls `useGameSession()` hook
2. Renders the message list with `<GMMessageBubble>`
3. Renders `<PlayerInput>` at the bottom
4. Renders side panels (DiceRoller, CombatTracker, etc.) conditionally

**Step 6: Verify build**

Run: `npm run build`
Expected: BUILD SUCCESS

**Step 7: Verify dev server**

Run: `npm run dev`
Test: Open in browser. Check that gameplay still works — messages display, input works, options are clickable.

**Step 8: Commit**

```bash
git add src/components/play/ src/lib/skills.ts
git commit -m "refactor: break ChatInterface.tsx into focused components"
```

---

### Task 7: Merge TalentTree rendering (TalentSelector + TalentShop)

**Why:** TalentSelector.tsx (363 lines, character creation) and TalentShop.tsx (188 lines, in-game) share 95% of the same talent tree grid rendering. The inconsistency between `talentId()` and `talent.name` for ownership checking also causes bugs.

**Files:**
- Create: `src/components/shared/TalentTreeGrid.tsx`
- Modify: `src/components/create/TalentSelector.tsx` (use shared component)
- Modify: `src/components/play/TalentShop.tsx` (use shared component)

**Step 1: Create shared `TalentTreeGrid.tsx`**

This component renders the 5-row × 4-column talent grid. It accepts:

```typescript
interface TalentTreeGridProps {
  specialization: Specialization;
  ownedTalentIds: Set<string>;
  availableXP: number;
  onPurchase: (talent: Talent, row: number, col: number) => void;
  mode: 'creation' | 'shop'; // creation allows free career talents, shop requires XP
}
```

Extract the shared rendering logic: the 5 tier rows, the talent cards (name, description, cost, activation type, ranked badge), the purchase button with validation.

Use a consistent talent ID format everywhere: `${specialization.name}-R${row}-C${col}`

**Step 2: Refactor TalentSelector.tsx**

Import and use `<TalentTreeGrid>` instead of inline rendering. Keep only the specialization selection and XP management logic.

**Step 3: Refactor TalentShop.tsx**

Same — use `<TalentTreeGrid>`. Keep only the shop-specific XP logic and Zustand store integration.

**Step 4: Verify build**

Run: `npm run build`
Expected: BUILD SUCCESS

**Step 5: Commit**

```bash
git add src/components/shared/TalentTreeGrid.tsx src/components/create/TalentSelector.tsx src/components/play/TalentShop.tsx
git commit -m "refactor: extract shared TalentTreeGrid component"
```

---

### Task 8: Merge Save/Load UI (ArchivePanel + SaveLoadPanel)

**Why:** ArchivePanel (271 lines, start screen) and SaveLoadPanel (314 lines, in-game) share 95% of the same save slot rendering and management logic. Only the restore mechanism differs (deferred vs. immediate).

**Files:**
- Create: `src/components/shared/SaveSlotGrid.tsx`
- Modify: `src/components/start/ArchivePanel.tsx` (use shared grid)
- Modify: `src/components/play/SaveLoadPanel.tsx` (use shared grid)

**Step 1: Create shared `SaveSlotGrid.tsx`**

This component renders save slots (max 6) with character info, timestamps, and save/load buttons:

```typescript
interface SaveSlotGridProps {
  onSave: (slotIndex: number) => void;
  onLoad: (slotIndex: number) => void;
  onDelete: (slotIndex: number) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  activeTab: 'save' | 'load';
  onTabChange: (tab: 'save' | 'load') => void;
}
```

Move the shared logic into this component:
- `STORAGE_KEY = 'quantum-rpg-saves'`
- Save slot reading/writing
- Save slot card rendering (name, species, career, timestamp)
- File export/import
- `validateSaveData()` call

**Step 2: Refactor ArchivePanel**

Use `<SaveSlotGrid>`, keep only the deferred restore logic (writing to `PENDING_RESTORE_KEY`).

**Step 3: Refactor SaveLoadPanel**

Use `<SaveSlotGrid>`, keep only the immediate restore via `onRestoreSession` callback.

**Step 4: Verify build**

Run: `npm run build`
Expected: BUILD SUCCESS

**Step 5: Commit**

```bash
git add src/components/shared/SaveSlotGrid.tsx src/components/start/ArchivePanel.tsx src/components/play/SaveLoadPanel.tsx
git commit -m "refactor: extract shared SaveSlotGrid component"
```

---

### Final Verification

After all 8 tasks:

**Step 1: Full build**

Run: `npm run build`
Expected: BUILD SUCCESS with zero errors

**Step 2: Dev server smoke test**

Run: `npm run dev`
Test:
1. Start screen loads with save slots
2. Character creation works
3. Play session starts (GM responds)
4. Save/Load works
5. Talent purchase works

**Step 3: Push to GitHub**

```bash
git push origin main
```

Vercel auto-deploys. Verify at quantum-rpg site.
