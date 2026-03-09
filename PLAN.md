# Quantum RPG — Masterplan: GM-Fix + UI-Polish + Immersion

## Übersicht
10 Fixes in 3 Kategorien: **Stabilität** (Bugs), **Layout** (UI-Overlaps), **Immersion** (Effekte).

---

## KATEGORIE A: STABILITÄT

### Fix 1: `handleGMResponse` robust machen
**Datei:** `src/components/play/ChatInterface.tsx` (Zeilen 248-331)

**Problem:** Alle State-Changes werden verarbeitet BEVOR die Nachricht dem Chat hinzugefügt wird (Zeile 330). Ein einziger Fehler = Spieler sieht die GM-Antwort nie.

**Lösung:**
- `setMessages(...)` an den **Anfang** der Funktion verschieben
- Äußeren `try/catch` um alle State-Changes
- Innere `try/catch` pro Subsection (Quest, NPC, Szene, Kampf)
- Defensive Coercion: `Number(sc.wounds) || 0`
- Null-safe Guards: `sc.npcUpdate?.name`, `sc.questUpdate?.title`
- `Array.isArray()` Check für `sc.newQuest.objectives`

### Fix 2: Fehler-Feedback für den Spieler
**Datei:** `src/components/play/ChatInterface.tsx` (startGame + handleSendMessage)

**Problem:** Fehler werden nur in `console.error` geloggt — Spieler sieht nichts.

**Lösung:** Im `catch`-Block GM-Fehlernachricht in den Chat:
- `startGame`: `"Verbindung zum Spielleiter fehlgeschlagen. Bitte lade die Seite neu."`
- `handleSendMessage`: `"Der Spielleiter konnte nicht antworten. Versuche es erneut."`
- Nutzt das **bereits vorhandene** Error-Rendering (Zeile 657)

---

## KATEGORIE B: LAYOUT-FIXES

### Fix 3: Würfel vs. Optionen — Entweder/Oder-UX
**Datei:** `src/components/play/ChatInterface.tsx` (Zeilen 669-690)

**Problem:** Challenge-Card und Optionen werden ohne Unterscheidung untereinander gerendert.

**Lösung:** Drei Render-Cases:
1. **Würfel UND Optionen** → Container mit:
   - Header: **"WÄHLE EINE AKTION"** (amber, tracking-widest)
   - Oberer Bereich: Würfel-Challenge mit Würfeln-Button + Glowing Effect (Fix 6)
   - **"— ODER —"** Trennlinie (zinc-500, centered)
   - Unterer Bereich: Alternative Option-Buttons
2. **Nur Würfel** → Bestehende Challenge-Card (mit Glow)
3. **Nur Optionen** → Bestehende Option-Buttons

### Fix 4: Bottom Nav verdeckt Chat-Input + Holocron-Raute
**Dateien:** `ChatInterface.tsx` + `HolocronGuide.tsx`

**Problem:** Tab Bar (`fixed bottom-0 z-50`, h-16 = 64px) überdeckt:
- Chat-Input (`fixed bottom-0 z-30`)
- HolocronGuide (`fixed bottom-8 z-50`)

**Lösung:**
- **ChatInterface Input-Bar** (Z.707): `bottom-0` → `bottom-16`
- **Chat-Bereich Padding** (Z.638): `pb-32` → `pb-48`
- **HolocronGuide** (Z.22): `bottom-8` → `bottom-[7.5rem]` (120px — über Input + Nav)

### Fix 5: Eleganter Intro-Übergang zur ersten GM-Nachricht
**Datei:** `src/components/play/ChatInterface.tsx`

**Problem:** Scene-Indicator ("ORBIT - ANNÄHERUNG") erscheint sofort, dann springt GM-Text rein. Kein eleganter Übergang.

**Lösung:**
- Scene-Indicator erst einblenden wenn erste GM-Nachricht da ist (statt sofort)
- `isTyping`-Indicator sofort sichtbar beim Spielstart → "GM_THINKING..." mit langsamerer Puls-Animation
- Erste GM-Nachricht bekommt `duration-1000` statt `duration-500`
- Optionaler kurzer "Szene wird aufgebaut..."-Text vor der ersten Nachricht

---

## KATEGORIE C: IMMERSION (21st.dev-Inspiration)

### Fix 6: Glowing Effect auf Challenge-Cards
**Datei:** Neue Komponente `src/components/ui/GlowingEffect.tsx` + Integration in `ChatInterface.tsx`

**Inspiration:** [Aceternity UI Glowing Effect](https://ui.aceternity.com/components/glowing-effect) (Cursor-Style)

**Umsetzung:**
- Eigene `GlowingEffect`-Komponente (CSS-only, kein framer-motion nötig):
  - Pseudo-Element `::before` mit `conic-gradient` in amber Tönen
  - `animation: rotate 3s linear infinite` für rotierende Glow-Border
  - `filter: blur(8px)` für weichen Glow-Effekt
  - Positioniert als `absolute inset-[-2px]` hinter dem Content
- Angewendet auf:
  - Challenge-Cards (Würfel-Bereich) → amber Glow
  - Entweder/Oder-Container → subtilerer Glow
  - **Nicht** auf normale Options → zu ablenkend

**Props:**
```tsx
interface GlowingEffectProps {
  color?: string;      // default: amber-500
  blur?: number;       // default: 8
  spread?: number;     // default: 40
  children: ReactNode;
}
```

### Fix 7: Typewriter-Effekt für GM-Narrative
**Datei:** Neue Komponente `src/components/ui/TypewriterText.tsx` + Integration in `ChatInterface.tsx`

**Inspiration:** [Aceternity Typewriter](https://21st.dev/community/components/aceternity/typewriter-effect/default)

**Umsetzung:**
- Wort-für-Wort Enthüllung (nicht Zeichen-für-Zeichen — zu langsam)
- `useState` für `visibleWords` Count + `useEffect` mit `setInterval(50ms)`
- Nur für die **letzte/neueste** GM-Nachricht — ältere werden sofort vollständig angezeigt
- Cursor-Blink `|` am Ende während des Tippens
- Skip-Button oder Click-to-Reveal für ungeduldige Spieler

**Props:**
```tsx
interface TypewriterTextProps {
  text: string;
  speed?: number;     // ms pro Wort, default: 50
  onComplete?: () => void;
  className?: string;
}
```

### Fix 8: Animated Shader Background für Scene-Transitions
**Datei:** Neue Komponente `src/components/ui/ShaderBackground.tsx`

**Inspiration:**
- [Animated Shader Background](https://21st.dev/community/components/thanh/animated-shader-background/default) (Aurora-Style)
- [Shader Animation](https://21st.dev/community/components/aliimam/shader-animation/default) (Ripple-Style)
- [Star Wars Jedi: Fallen Order UI](https://www.gameuidatabase.com/gameData.php?id=278)

**Umsetzung:**
- **Leichtgewichtige Version** (kein Three.js, zu schwer für Mobile):
  - CSS `@keyframes` + `radial-gradient` + `filter: blur()` für aurora-ähnlichen Effekt
  - Oder: Canvas 2D mit einfachem Noise-Pattern (deutlich leichter als WebGL)
- **Wann sichtbar:**
  - Als subtiler Hintergrund hinter dem Scene-Indicator (niedrige Opacity)
  - Kurzer Flare-Effekt bei `sceneChange` (neue Location)
  - Hyperspace-Jump-Effekt bei Planetenwechsel (radial stretch lines)
- **Performance:**
  - `will-change: transform` + GPU-beschleunigte Properties
  - Pausiert wenn nicht sichtbar (`IntersectionObserver`)
  - Fallback: einfacher Gradient wenn GPU-Performance zu niedrig

### Fix 9: Würfelergebnis visuell hervorheben
**Datei:** `src/components/play/ChatInterface.tsx`

**Problem:** Würfelergebnisse werden als normaler Player-Text (`[SYSTEM] Würfelwurf...`) angezeigt.

**Lösung:** Eigene System-Nachricht-Darstellung:
- Prüfung ob `msg.content.narrative?.startsWith('[SYSTEM] Würfelwurf')` → eigenes Rendering
- Farbcodierung: Grün (Erfolg), Rot (Fehlschlag), Gold (Triumph), Schwarz/Rot (Despair)
- Kompakte Darstellung: Skill-Name + Ergebnis-Icons statt langer Text
- Subtile Glow-Animation um das Ergebnis (amber bei Erfolg, rot bei Fehlschlag)

### Fix 10: TalentShop Redesign — weg vom Dropdown/Listenformat
**Datei:** `src/components/play/TalentShop.tsx`

**Problem:** Der TalentShop im Play-Modus ist nur eine langweilige vertikale Liste mit Kaufen-Buttons. Sieht aus wie ein Dropdown/Formular, nicht wie der Rest des Spiels. Der TalentSelector (Character Creation) hat dagegen ein cooles Talent-Tree-Grid mit visuellen Dependencies.

**Lösung:** TalentShop visuell auf das Niveau des restlichen Spiels bringen:
- **Grid-Layout statt Liste** — Talent-Cards in einem 2-Spalten-Grid (Mobile) / 3-Spalten (Desktop)
- **Card-Design** passend zum Game-Stil:
  - Dunkler Card-Background (`bg-zinc-900/40 border border-zinc-800`)
  - Talent-Name groß und bold (uppercase, italic, tracking-tight)
  - Beschreibung als dezenter Sub-Text
  - XP-Kosten als amber Badge
  - Rank-Progression als leuchtende Dots (wie im TalentSelector)
- **Kategorien/Filter:**
  - Filter-Chips oben: "Alle", "Verfügbar", "Besessen", "Ranked"
  - Optional: Gruppierung nach Talent-Tier oder Alphabet
- **Kauf-Interaktion:**
  - Card-Tap öffnet Detail-Overlay (statt sofort kaufen)
  - Detail zeigt volle Beschreibung + Kauf-Button
  - Kauf-Animation: Glow-Effekt + kurzes Aufleuchten
- **Owned-Talents hervorheben:**
  - Emerald Rand/Glow für besessene Talents
  - Rank-Dots prominent sichtbar
  - "MAX"-Badge wenn ausgereizt

**Inspo:** Der bestehende TalentSelector (`src/components/create/TalentSelector.tsx`) als visuelles Vorbild, angepasst für den Play-Modus (kein Tree-Dependency-System, aber gleiche Ästhetik).

---

## BETROFFENE DATEIEN

| Datei | Fixes | Neu/Bestehend |
|-------|-------|---------------|
| `src/components/play/ChatInterface.tsx` | 1, 2, 3, 4, 5, 7, 9 | bestehend |
| `src/components/create/HolocronGuide.tsx` | 4 | bestehend |
| `src/components/ui/GlowingEffect.tsx` | 6 | **neu** |
| `src/components/ui/TypewriterText.tsx` | 7 | **neu** |
| `src/components/ui/ShaderBackground.tsx` | 8 | **neu** |
| `src/components/play/TalentShop.tsx` | 10 | bestehend |

## REIHENFOLGE DER UMSETZUNG

1. **Fix 1 + 2** (Stabilität) — höchste Priorität, GM muss laufen
2. **Fix 4** (Layout) — Input/Holocron sichtbar machen
3. **Fix 3** (Würfel/Optionen UX) — Klarheit
4. **Fix 5** (Intro-Übergang) — Polish
5. **Fix 9** (Würfelergebnis) — P&P-Feeling
6. **Fix 7** (Typewriter) — Immersion
7. **Fix 6** (Glowing Effect) — Visual Polish
8. **Fix 8** (Shader Background) — Icing on the cake
9. **Fix 10** (TalentShop Redesign) — Konsistentes Game-Feel

## VERIFIKATION
1. GM-Nachricht erscheint immer, auch wenn State-Processing fehlschlägt
2. Bei API-Fehler wird deutsche Fehlermeldung im Chat angezeigt
3. Würfel + Optionen: klare "entweder/oder"-Darstellung mit Glow
4. Input-Feld und Holocron über der Bottom Nav sichtbar
5. Erster Scene-Übergang smooth, nicht abrupt
6. Typewriter-Effekt für neueste GM-Nachricht, ältere sofort sichtbar
7. Challenge-Cards haben animierten Glow-Rand
8. Scene-Übergänge haben subtilen Shader-Effekt
9. Würfelergebnis farbcodiert und visuell hervorgehoben
10. `npm run build` erfolgreich
11. Mobile-Performance akzeptabel (keine Ruckler)
12. TalentShop hat Card-Grid statt Liste, passt zum restlichen Spiel-Stil

## INSPO-QUELLEN
- [Aceternity UI — Glowing Effect](https://ui.aceternity.com/components/glowing-effect)
- [21st.dev — Animated Shader Background](https://21st.dev/community/components/thanh/animated-shader-background/default)
- [21st.dev — Shader Animation](https://21st.dev/community/components/aliimam/shader-animation/default)
- [Game UI Database](https://www.gameuidatabase.com/) — insbesondere [Star Wars Jedi: Fallen Order](https://www.gameuidatabase.com/gameData.php?id=278)
- [Star Wars Jedi: Survivor HUD UI/UX (ArtStation)](https://www.artstation.com/artwork/kQzX0K)
