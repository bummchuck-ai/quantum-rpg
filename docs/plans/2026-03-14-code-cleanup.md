# Quantum RPG — Code Cleanup Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all critical and important issues from Code Review — clean config, remove dead files, add rate limiting, fix TypeScript

**Architecture:** Incremental cleanup in 8 tasks. No feature changes. Each task is independently committable and testable via `npm run build`.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4.2, Zustand 5

---

### Task 1: Remove `ignoreBuildErrors` and fix build

**Why:** TypeScript errors are silently swallowed. This is the #1 risk in the project.

**Files:**
- Modify: `next.config.ts`

**Step 1: Remove ignoreBuildErrors**

```typescript
// next.config.ts — replace entire file with:
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {};

export default nextConfig;
```

**Step 2: Run build to see what breaks**

Run: `npm run build`
Expected: Likely TypeScript errors. Note them all.

**Step 3: Fix all TypeScript build errors**

Fix each error. Common patterns:
- `as any` → proper type assertion or interface fix
- Missing return types → add them
- Implicit `any` parameters → add type annotations

If there are too many errors (50+), re-add `ignoreBuildErrors` temporarily and create a separate follow-up task. The goal is to get the build green.

**Step 4: Verify build passes**

Run: `npm run build`
Expected: BUILD SUCCESS (no errors)

**Step 5: Commit**

```bash
git add next.config.ts src/
git commit -m "fix: remove ignoreBuildErrors, fix all TS build errors"
```

---

### Task 2: Remove Tailwind CDN, keep npm-only Tailwind

**Why:** Two Tailwind instances conflict with each other. CDN adds external dependency + slower loads.

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css` (if exists)
- Delete: `tailwindcss-animate` plugin reference (not installed)

**Step 1: Merge CDN config into tailwind.config.ts**

The CDN inline config has custom colors (`obsidian`, `amber`, `blue.data`, `red.alert`) and fonts (`Rajdhani`, `Share Tech Mono`) that the npm config doesn't have. Merge them:

```typescript
// tailwind.config.ts — replace entire file:
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'obsidian': '#050505',
        'amber': {
          DEFAULT: '#FFB800',
          dim: 'rgba(255, 184, 0, 0.2)',
          glow: 'rgba(255, 184, 0, 0.5)',
        },
        'blue': {
          data: '#00AAFF',
        },
        'red': {
          alert: '#FF3333',
        },
      },
      fontFamily: {
        sans: ['Rajdhani', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
export default config;
```

**Step 2: Remove CDN from layout.tsx**

In `src/app/layout.tsx`, remove these lines:
- Line 32: `<script src="https://cdn.tailwindcss.com"></script>`
- Lines 39-66: The entire `<script dangerouslySetInnerHTML>` block with `tailwind.config`

Keep the Google Fonts `<link>` tags (lines 35-37) and the language script (lines 69-74) and the `<style>` block (lines 76-109).

**Step 3: Verify build**

Run: `npm run build`
Expected: BUILD SUCCESS

**Step 4: Verify dev server visually**

Run: `npm run dev`
Check: Open in browser, verify the amber/gold colors, fonts (Rajdhani), and dark theme all still work. If styles are broken, the Tailwind config merge missed something.

**Step 5: Commit**

```bash
git add tailwind.config.ts src/app/layout.tsx
git commit -m "fix: remove Tailwind CDN, merge config into npm Tailwind"
```

---

### Task 3: Clean up dead JSON data files

**Why:** 14+ MB of unused intermediate/debug/backup JSON files bloat the repo.

**Files actually used by the app (KEEP THESE):**
- `data/json/talents_connected.json` (460K) — imported by TalentSelector, TalentShop
- `data/json/gear.json` (64K) — imported by ArmorySelector
- `data/json/species_raw.json` (72K) — imported by SpeciesSelector
- `data/json/careers.json` (44K) — imported by CareerSelector
- `data/json/vehicles.json` (24K) — imported by VehicleSelector
- `data/merchants.json` (root level) — imported by MerchantInterface
- `data/allTalents.json` — check if imported, if not → delete

**Files to DELETE:**
- `data/json/talents_connected_backup.json` (4.0M)
- `data/json/talents_final.json` (3.1M)
- `data/json/talents.json` (2.5M)
- `data/json/talents_cleaned.json` (2.3M)
- `data/json/talents_refined.json` (1.1M)
- `data/json/talents_coords_debug.json` (888K)
- `data/json/talents_raw.json` (756K)
- `data/json/talents_extracted.json` (460K)
- `data/json/species_sample.json` (4K)

**Step 1: Verify allTalents.json usage**

Run: `grep -r "allTalents" src/`
If no results → delete it too.

**Step 2: Delete unused JSON files**

```bash
rm data/json/talents_connected_backup.json
rm data/json/talents_final.json
rm data/json/talents.json
rm data/json/talents_cleaned.json
rm data/json/talents_refined.json
rm data/json/talents_coords_debug.json
rm data/json/talents_raw.json
rm data/json/talents_extracted.json
rm data/json/species_sample.json
```

**Step 3: Delete raw PDF/TXT source files**

```bash
rm -rf data/raw/
```

Git history preserves everything if needed later.

**Step 4: Verify build**

Run: `npm run build`
Expected: BUILD SUCCESS (no imports broken)

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove 14MB of unused JSON data files and raw PDFs"
```

---

### Task 4: Remove dead root-level scripts and unused dependencies

**Why:** 16 scripts that were used during PDF extraction are done. They pull in `pdf-parse` and `@google/generative-ai` as unnecessary dependencies.

**Step 1: Move scripts to archive**

```bash
mkdir -p scripts/archive
mv add-connections.js clean_talents.py debug-pdf.js extract-gear.js extract-pdf.js \
   parse-careers.js parse-gear.js parse-species.js parse-talents-coords.js parse-talents.js \
   process-talent-grid.js refine-gear-script.js refine-talents-logic.js refine-talents.js \
   test-gm.js test-model.js scripts/archive/
mv scripts/generate-species-images.sh scripts/generate-species-svgs.mjs scripts/archive/
```

**Step 2: Remove unused dependencies**

```bash
npm uninstall pdf-parse @google/generative-ai autoprefixer
```

(`autoprefixer` is handled by Tailwind CSS 4 internally)

**Step 3: Move type packages to devDependencies**

```bash
npm install --save-dev @types/node @types/react @types/react-dom typescript postcss
npm uninstall @types/node @types/react @types/react-dom typescript postcss
npm install --save-dev @types/node @types/react @types/react-dom typescript postcss
```

Note: `npm install --save-dev` + `npm uninstall` to move them from dependencies to devDependencies.

**Step 4: Clean package.json description**

Replace the massive description blob with:

```json
"description": "Star Wars RPG with AI Game Master — powered by Claude API"
```

**Step 5: Verify build**

Run: `npm run build`
Expected: BUILD SUCCESS

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: archive dead scripts, remove unused deps, clean package.json"
```

---

### Task 5: Add rate limiting to `/api/chat`

**Why:** Anyone with the URL can burn through Anthropic API credits.

**Files:**
- Modify: `src/app/api/chat/route.ts`

**Step 1: Add in-memory rate limiter**

Add at the top of `route.ts`, before the POST handler:

```typescript
// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30; // max requests
const RATE_WINDOW = 60 * 1000; // per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}
```

**Step 2: Add rate limit check at start of POST handler**

```typescript
export async function POST(req: Request) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Zu viele Anfragen. Bitte warte einen Moment.' },
      { status: 429 }
    );
  }

  try {
    // ... rest of existing code
```

**Step 3: Add API key validation at startup**

Replace the empty-string fallback:

```typescript
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('ANTHROPIC_API_KEY is not set!');
}

const anthropic = new Anthropic({ apiKey: apiKey || '' });
```

**Step 4: Verify build**

Run: `npm run build`
Expected: BUILD SUCCESS

**Step 5: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat: add rate limiting and API key validation to chat route"
```

---

### Task 6: Fix `error: any` catch blocks

**Why:** `catch (error: any)` defeats TypeScript's error catching. This is a quick win.

**Files:**
- Modify: `src/app/api/chat/route.ts:94`

**Step 1: Fix the catch block**

Replace:
```typescript
} catch (error: any) {
    console.error('GM Error:', error);
    return NextResponse.json(
      {
        error: 'DER GAME MASTER IST AKTUELL NICHT ERREICHBAR.',
        details: error.message,
      },
      { status: 500 }
    );
  }
```

With:
```typescript
  } catch (error) {
    console.error('GM Error:', error);
    return NextResponse.json(
      {
        error: 'DER GAME MASTER IST AKTUELL NICHT ERREICHBAR.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
```

**Step 2: Search for other `catch (error: any)` patterns**

Run: `grep -rn "catch.*error.*any" src/`
Fix each one the same way.

**Step 3: Verify build**

Run: `npm run build`
Expected: BUILD SUCCESS

**Step 4: Commit**

```bash
git add src/
git commit -m "fix: replace catch(error: any) with proper error typing"
```

---

### Task 7: Fix Message type and combat mutation

**Why:** `content: any` in Message interface loses all type safety. Combat mutations bypass React change detection.

**Files:**
- Modify: `src/components/play/ChatInterface.tsx` (Message interface)
- Modify: `src/lib/engine/combat.ts` (applyDamage, nextRound)

**Step 1: Type the Message interface**

In ChatInterface.tsx, find the Message interface and replace:

```typescript
interface GMResponse {
  narrative: string;
  options?: { id: string; text: string }[];
  stateChanges?: Record<string, unknown>;
  mood?: string;
  combatAction?: unknown;
}

interface Message {
  role: 'gm' | 'player';
  content: string | GMResponse;
}
```

**Step 2: Fix applyDamage to return new object**

In `combat.ts`, change `applyDamage` to not mutate:

```typescript
export function applyDamage(combatant: Combatant, rawDamage: number): Combatant {
  const effectiveDamage = Math.max(0, rawDamage - combatant.soak);
  return {
    ...combatant,
    wounds: combatant.wounds + effectiveDamage,
  };
}
```

Update all callers to use the return value instead of relying on mutation.

**Step 3: Verify build**

Run: `npm run build`
Expected: BUILD SUCCESS

**Step 4: Commit**

```bash
git add src/
git commit -m "fix: type Message interface, stop mutating combat objects"
```

---

### Task 8: Final verification and deploy

**Step 1: Full build**

Run: `npm run build`
Expected: BUILD SUCCESS with zero warnings

**Step 2: Dev server smoke test**

Run: `npm run dev`
Test these flows:
1. Start screen loads
2. Character creation works (species, career, talents)
3. Play session starts (GM responds)
4. Save/Load works

**Step 3: Check repo cleanliness**

```bash
du -sh .          # Should be much smaller (was ~30MB+ with all JSON)
ls *.js *.py 2>/dev/null   # Should be empty (scripts moved)
```

**Step 4: Push to GitHub**

```bash
git push origin main
```

Vercel will auto-deploy. Verify at quantum-rpg-repo.vercel.app.

**Step 5: Commit any remaining fixes**

```bash
git add -A
git commit -m "chore: final cleanup verification"
git push origin main
```
