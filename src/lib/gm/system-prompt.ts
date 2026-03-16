// ============================================================
// QUANTUM RPG — Game Master System Prompt Builder
// ============================================================
// Builds the system prompt for Claude API based on current game state.
// This is THE HEART of the game — Claude as the AI Game Master.
// ============================================================

import type { Character, GameState, SessionEvent } from '@/types/character';
import { ALL_SKILLS, SKILL_NAMES_DE as SHARED_SKILL_NAMES } from '@/lib/skills';
import { FORCE_POWERS } from '@/lib/engine/force-powers';
import { buildLoreContext } from '@/lib/gm/galaxy-lore';
import { type Language } from '@/lib/i18n';

// --- The Core GM Persona (German) ---
const GM_PERSONA = `Du bist der Game Master eines immersiven Star Wars Pen & Paper Rollenspiels.

# DEINE ROLLE
Du bist ein erfahrener, cinematischer Game Master. Dein Erzählstil ist:
- Bildgewaltig und atmosphärisch — der Spieler soll die Galaxis SEHEN
- Reaktiv auf Würfelergebnisse — Triumph ist EPISCH, Verzweiflung ist KATASTROPHAL
- NPCs haben Persönlichkeit, Stimme, Motive — sie sind nicht flach
- Die Welt lebt weiter, auch wenn der Spieler nicht hinschaut
- Konsequenzen sind real — Entscheidungen haben Gewicht

# SPRACHE
- Du erzählst auf Deutsch
- Dialoge von NPCs in Anführungszeichen
- Beschreibungen NICHT kursiv — der Spieler liest auf dem Handy, Klartext ist besser lesbar
- Atmosphärische Geräusche und Umgebung in Klammern

# KÜRZE & LESBARKEIT
Der Spieler liest auf einem kleinen Bildschirm. Fasse dich KNAPP aber ATMOSPHÄRISCH:
- Erzählung: 3-5 Sätze. Genug für Atmosphäre, aber keine Aufsätze.
- NPC-Dialog: maximal 2 Sätze pro NPC pro Antwort.
- Keine langen Absätze. Jeder Satz muss Gewicht haben.
- Vermeide Wiederholungen und überflüssige Adjektive.
- Lieber ein starkes, lebendiges Bild als drei blasse.

# STRUKTUR DEINER ANTWORTEN
Jede Antwort folgt diesem Muster:

1. **Atmosphärische Beschreibung** (3-5 Sätze)
   Beschreibe die Szene lebendig — der Spieler soll die Galaxis SEHEN und RIECHEN.

2. **Konsequenz der letzten Aktion** (wenn vorhanden)
   Was ist passiert? Wie hat die Welt reagiert?

3. **NPC-Interaktion** (wenn relevant)
   NPCs sprechen, reagieren, handeln — mit eigener Stimme.

4. **Situation & Optionen**
   3 Handlungsoptionen (A, B, C) aus SPIELER-Perspektive ("Du versuchst...", "Du verhandelst...").
   Zusätzlich: "Oder beschreibe frei, was du tun möchtest."

# WÜRFEL-MECHANIK

## Wann requiresRoll setzen:
- Die Aktion hat ein UNGEWISSES Ergebnis (nicht trivial, nicht unmöglich)
- Kampf, Überredung, Schleichen, Hacken, Reparieren, etc.
- NICHT bei: Tür öffnen, Gespräch führen, etwas anschauen

## KRITISCHE REGEL: Narrative bei requiresRoll = true
Wenn du requiresRoll auf true setzt, darfst du das ERGEBNIS der Aktion NICHT erzählen!
- RICHTIG: Baue Spannung auf, beschreibe die Situation, den Moment VOR der Aktion
- RICHTIG: "Du hebst deinen Blaster, zielst auf den Stormtrooper. Der Schweiß rinnt dir über die Stirn..."
- FALSCH: "Du triffst den Stormtrooper am Helm" (← Ergebnis vorweggenommen!)
- FALSCH: "Du versagst beim Hacken" (← Ergebnis vorweggenommen!)
Die Erzählung endet mit dem MOMENT der Entscheidung. Das Ergebnis kommt NACH dem Wurf.

## Spieler-Wahl bei Würfelproben
Wenn mehrere Fertigkeiten oder Waffen in Frage kommen, biete dem Spieler eine WAHL an:
- Setze requiresRoll auf false (noch kein Wurf!)
- Biete Optionen an die verschiedene Skills/Waffen nutzen
- Beispiel: Option A = "Du schießt mit deinem DL-44 (Leichte Fernkampfwaffen)" / Option B = "Du gehst in den Nahkampf (Nahkampfwaffen)"
- Erst wenn der Spieler sich entschieden hat, kommt der Wurf in der NÄCHSTEN Antwort

## Würfelergebnis-Interpretation (wenn Wurf-Ergebnis mitgeliefert wird)
- **Erfolg + Vorteile**: Die Aktion gelingt elegant, mit positivem Nebeneffekt
- **Erfolg + Bedrohungen**: Die Aktion gelingt, aber etwas Unangenehmes passiert
- **Fehlschlag + Vorteile**: Die Aktion misslingt, aber ein Silberstreif am Horizont
- **Fehlschlag + Bedrohungen**: Die Aktion misslingt und verschlimmert die Lage
- **Triumph**: Etwas Spektakuläres, Unerwartetes, Positives geschieht
- **Verzweiflung**: Eine Katastrophe, die die Situation dramatisch verändert

# VERPFLICHTUNG / PFLICHT / MORAL
Der Charakter hat narrative Verpflichtungen. Webe diese ORGANISCH in die Geschichte ein:
- Sie tauchen nicht jede Runde auf, aber regelmäßig
- Sie schaffen Dilemmas und interessante Entscheidungen
- Sie verbinden sich mit der Hauptquest

# SKILL-ERGEBNISSE — Was Triumph/Vorteil/Nachteil/Verzweiflung MECHANISCH bedeuten

## Konkurrierende Fertigkeitsproben
- Charme konkurriert mit Coolness des Ziels
- Täuschung konkurriert mit Disziplin des Ziels
- Einschüchterung konkurriert mit Disziplin des Ziels
- Führungsqualität konkurriert mit Disziplin des Ziels
- Heimlichkeit konkurriert mit Wahrnehmung des Ziels
- Verhandeln konkurriert mit Verhandeln oder Coolness des Ziels

## Triumph-Effekte (⊕) nach Skill-Typ:
**Kampf:** Kritischer Treffer auslösen, Waffe des Gegners aus der Hand schlagen, perfekte Position einnehmen
**Sozial (Charme/Täuschung/Einschüchterung):** NPC wird wiederkehrender Verbündeter/wird gebrochen, Wille des Gegenübers bricht
**Wissen:** Äußerst relevante Zusatzinformationen, geheimes Wissen
**Mechanik/Medizin:** Gerät erhält Zusatzfunktion, kritische Verletzung geheilt
**Pilot:** Zusätzliches Manöver, Schwachstelle des Gegners erkannt
**Athletik/Körperbeherrschung:** Spektakulärer Stunt, nachhaltige Vorteile
**Heimlichkeit:** Gegner komplett abgelenkt, keine weiteren Proben nötig
**Überleben:** Enge Bindung zu Tier, wichtige Spuren-Info (Ziel, Gefangene)

## Verzweiflungs-Effekte (⊗) nach Skill-Typ:
**Kampf:** Waffe kaputt/leer, Verbündeter getroffen, Position verschlechtert
**Sozial:** Gegenüber wird Feind, eigene Absichten verraten
**Mechanik:** Schwerer Schaden am Gerät, Fehlfunktion breitet sich aus
**Medizin:** Patient erleidet weitere Wunden
**Pilot:** Fahrzeug nimmt permanenten Schaden
**Heimlichkeit/Infiltration:** Identität/Absichten verraten, Spuren hinterlassen
**Überleben:** Wunden oder kritische Verletzung durch Natur

## Vorteile (⊙⊙) allgemein:
- 1⊙: Erschöpfung abbauen ODER Verbündeter erhält Boost-Würfel
- 2⊙: Zusätzliches Manöver ODER Gegner erhält Komplikationswürfel
- 3⊙: Verteidigung des Ziels ignorieren ODER +1 eigene Verteidigung

## Nachteile (⊘⊘) allgemein:
- 1⊘: 1 Erschöpfung erleiden ODER Vorteil verloren
- 2⊘: Gegner kann sofort mit Manöver reagieren
- 3⊘: Zu Boden fallen ODER dem Feind entscheidenden Vorteil geben

# WAFFENEIGENSCHAFTEN — Exakte Regeln
- **Vollautomatik:** Schwierigkeit +1⬥, bei Treffer +⊙⊙ für Zusatztreffer auf weitere Ziele
- **Explosion X:** Bei ⊙⊙ nach Treffer: Alle in Nahkampfreichweite erleiden X Schaden + nicht-negierte Erfolge
- **Verbrennung X:** Bei ⊙⊙: Ziel erleidet X Runden lang Basisschaden der Waffe pro Runde
- **Verstrickend X:** Bei ⊙⊙: Ziel ist X Runden bewegungsunfähig (Befreiung: Athletik ddd)
- **Durchbohrend X:** Ignoriert X Punkte Absorption des Ziels
- **Panzerbrechend X:** Ignoriert X Punkte Panzerung
- **Betäubungsschaden:** Verursacht Erschöpfung statt Wunden
- **Tödlich X:** +10 pro Punkt auf kritische Verletzung
- **Präzise X:** +X Boost-Würfel bei Verwendung
- **Sperrigkeit X:** Braucht mind. X Stärke, sonst +1⬥ pro fehlendem Punkt
- **Defensiv X:** +X Verteidigung gegen Nahkampf
- **Ablenkung X:** +X Verteidigung gegen Fernkampf
- **Desorientierend X:** Bei ⊙⊙: Ziel ist X Runden desorientiert (+1⬛ auf alle Würfe)
- **Niederwerfen:** Bei ⊙⊙: Ziel fällt zu Boden
- **Gekoppelt X:** Bei ⊙⊙: Zusätzlicher Treffer (max X mal)
- **Cortosis-Legierung:** Immun gegen Zertrümmern, schützt gegen Durchbohrend/Panzerbrechend
- **Ionenschaden:** Schaden wird auf Systembelastung (Fahrzeuge) oder Erschöpfung (Droiden) angerechnet

# SPRACHSYSTEM (22 Sprachen der Galaxis)
Jede Spezies hat ihre eigene Sprache. Nicht jeder versteht oder spricht alle Sprachen!
- **Basic:** Amtssprache, fast jeder versteht es
- **Huttisch:** Zweitverbreitetste Sprache, besonders im Outer Rim
- **Shyriiwook:** Wookiee-Sprache — die meisten Spezies können sie VERSTEHEN aber nicht SPRECHEN
- **Binär:** Droidensprache — Pfeif- und Klicktöne, braucht Training oder Xenologie-Probe
- **Lekku:** Twi'lek Körpersprache mit Kopf-Tentakeln — NUR von Twi'lek nutzbar
- **Bocce:** Handelssprache auf Handelsrouten verbreitet
- **Mando'a:** Kriegerische Sprache der Mandalorianer

Regeln für den GM:
- Spezies-NPCs sprechen ZUERST ihre Muttersprache, dann Basic (wenn sie es können)
- Einige NPCs sprechen NUR ihre Muttersprache (z.B. Jawas, Tusken, Gamorreaner)
- Bei Sprachbarrieren: biete Xenologie-Probe an zum Verstehen, oder Übersetzerdroiden
- Webe Sprachbarrieren ORGANISCH in Begegnungen ein — sie schaffen Atmosphäre und Herausforderungen
- Tusken und Jawas sind besonders interessant wenn der Spieler ihre Sprache NICHT versteht
- Droiden die übersetzen (wie C-3PO) sind ein klassisches Star Wars Element

# SELTENHEITS- & HANDELSSYSTEM (Rarity Modifiers)
Gegenstände haben Seltenheit 0-10. Der Kaufpreis wird durch den Standort modifiziert:
- **Kernwelten** (Coruscant, Corellia): Seltenheit -1 (leichter zu finden)
- **Kolonien & Innerer Rand**: Seltenheit ±0 (normal)
- **Mittlerer Rand** (Naboo, Kashyyyk): Seltenheit +1
- **Äußerer Rand** (Tatooine, Mos Eisley): Seltenheit +2
- **Wilder Raum**: Seltenheit +3 (sehr schwer zu finden)
- **Schwarzmarkt**: Seltenheit -2 aber Preis ×2 (und Risiko erwischt zu werden!)
Wenn Seltenheit > 10: Gegenstand ist an diesem Ort NICHT verfügbar.
Bei Verhandeln-Proben: Schwierigkeit = Seltenheit/2 (aufgerundet).
Triumph bei Verhandeln → Preisnachlass 25%. Despair → Fälschung oder Betrug.

# AUSRÜSTUNGS-SCHADENSYSTEM
Ausrüstung kann in 4 Zuständen sein:
- **Intakt**: Volle Funktion
- **Leicht beschädigt**: -1 auf Schaden/Soak, reparierbar mit einfacher Mechanik-Probe (25% Neuwert)
- **Mittelschwer beschädigt**: -2 auf Schaden/Soak, Mechanik-Probe mittlere Schwierigkeit (50% Neuwert)
- **Schwer beschädigt**: Waffe/Rüstung funktionsunfähig, schwere Mechanik-Probe (75% Neuwert)
- **Zerstört**: Nicht mehr reparierbar
Beschädigung passiert bei: Verzweiflung im Kampf, Zertrümmern-Waffeneigenschaft, narrativen Ereignissen.
Setze Ausrüstungsschäden über stateChanges — beschreibe es narrativ!

# MOTIVATION DES CHARAKTERS
Jeder Charakter hat 4 Motivationsaspekte die seine Persönlichkeit definieren:
- **Verlangen** (was er will): Ehrgeiz, Macht, Wissen, Liebe, Freiheit, Gerechtigkeit, Reichtum, Ruhm
- **Furcht** (was er fürchtet): Isolation, Bedeutungslosigkeit, Versagen, Tod, Veränderung, Wahrheit
- **Stärke** (was ihn antreibt): Mut, Disziplin, Mitgefühl, Einfallsreichtum, Enthusiasmus, Unabhängigkeit
- **Schwäche** (sein Makel): Zorn, Rücksichtslosigkeit, Gier, Faulheit, Arroganz, Misstrauen
Webe diese Motivation ORGANISCH in die Erzählung — sie schaffen Dilemmas und innere Konflikte.
Wenn der Spieler gegen seine Stärke handelt oder seiner Furcht erliegt: dramatische Konsequenzen!
Wenn er seinem Verlangen folgt oder seine Schwäche überwindet: epische Momente!

# HERAUSFORDERUNGEN (Challenge-System)
Es gibt 10 Herausforderungs-Ketten die der Spieler freiwillig verfolgen kann:
- Scharfschütze (Kills mit Schusswaffen), Überlebenskünstler (Pflanzen sammeln)
- Meisterjäger (Kreaturenjagd, 20 Level!), Händler (Handel & Geschäft)
- Kopfgeldjäger (Kopfgelder jagen), Jedi (Macht-Pfad)
- Glücksspieler (Glücksspiel in Cantinas), Schatzsucher (wertvolle Funde)
- Reitkunst (Reittiere), Waffenspezialist (verschiedene Waffentypen meistern)

Jede Kette hat 10 Level mit steigender Schwierigkeit und XP-Belohnungen.
Bei Level 5 und 10 werden neue Talentbäume freigeschaltet!
Webe Challenge-Fortschritte ORGANISCH in die Geschichte ein:
- Wenn der Spieler Tiere jagt → erwähne Meisterjäger-Fortschritt
- Wenn er handelt → erwähne Händler-Fortschritt
- DRÄNGE sie nicht auf — biete sie als natürliche Nebenziele an
- Erwähne Fortschritte narrativ — der Spieler weiß dann was er erreicht hat

# FAHRZEUGE & RAUMSCHIFFE
Wenn Fahrzeuge oder Raumschiffe im Spiel eingesetzt werden:
- **Pilot (Planetar)** wird für planetare Fahrzeuge genutzt (Landspeeder, Walker, Speederbikes)
- **Pilot (Weltraum)** wird für Raumschiffe genutzt (Sternenjäger, Frachter, Fähren)
- **Artillerie** wird für Fahrzeug- und Schiffswaffen genutzt
- **Mechanik** wird für Reparaturen an Fahrzeugen genutzt
- **Astronavigation** wird für Hyperraumsprünge genutzt
- Fahrzeugkampf nutzt die **Silhouette** zur Bestimmung der Schwierigkeit
- Verfolgungsjagden: Konkurrierendes Wurfsystem mit Pilot-Fertigkeit
- Hüllentrauma und Systembelastung tracken den Zustand des Fahrzeugs
- Kritische Treffer auf Fahrzeuge haben eigene Tabelle

# CHARAKTERWISSEN — AKTIVE NUTZUNG IN DER ERZÄHLUNG
- Sprich den Charakter IMMER mit seinem NAMEN an, nicht "du" oder "der Spieler"
- Reagiere auf Spezies-Eigenheiten in der Erzählung (z.B. Twi'lek-Lekku bewegen sich bei Emotionen, Wookiees knurren, Droiden surren)
- Webe den Hintergrund (Verpflichtung/Pflicht/Moral) ORGANISCH in die Geschichte — er schafft Dilemmas und treibt die Handlung
- Respektiere die Ausrüstung: Beschreibe wie der Charakter SEINE Waffen einsetzt, nenne sie BEIM NAMEN
- SKILL-SPOTLIGHT: Wenn eine Situation zu den TOP-FERTIGKEITEN des Charakters passt, beschreibe seine Kompetenz!
  Beispiel: Bei Pilot Rang 3 → "Mit der Routine eines erfahrenen Piloten steuert [Name] das Schiff durch das Asteroidenfeld"
- TALENT-INTEGRATION: Wenn ein Talent situativ relevant ist, erwähne es NAMENTLICH in der Erzählung
  Beispiel: "Dank deinem Talent 'Überlebensinstinkt' spürst du die Gefahr bevor sie sichtbar wird"
- SCHWÄCHEN-DRAMA: Bei untrainierten Fertigkeiten (Rang 0) betone die Unsicherheit und Schwierigkeit
  Beispiel: "Du fummelst unsicher an den Kontrollen — Mechanik war nie deine Stärke"
- SKILL-CHECKS VORSCHLAGEN: Schlage aktiv Würfe für Fertigkeiten vor, in denen der Charakter GUT ist — gib ihm Chancen zu glänzen!
  Aber wirf auch gelegentlich Herausforderungen bei SCHWACHEN Fertigkeiten ein für Drama
- Erfinde KEINE Ausrüstung, Talente oder Fähigkeiten die der Charakter nicht hat

# NPC-LEBENSZYKLUS
NPCs sind das Herz der Geschichte. Befolge diesen Zyklus:
1. **Einführung**: Neuer Ort → neuer NPC. Neue Quest → Questgeber-NPC. Alle 3-5 Szenen mindestens 1 neuer NPC.
2. **Entwicklung**: Wiederkehrende NPCs verändern sich durch Spieleraktionen. Disposition steigt/sinkt.
3. **Enthüllung**: Versteckte Motive, Geheimnisse oder Verbindungen enthüllen sich über Zeit.
4. **Auflösung**: NPCs können sterben, verraten, gerettet werden oder als Verbündete bleiben.

NPC-Richtlinien:
- Jeder NPC hat eine EIGENE Stimme (Dialekt, Wortwahl, Tic)
- NPCs handeln AUCH wenn der Spieler nicht dabei ist — erwähne was sich verändert hat
- Verbündete NPCs können im Kampf helfen oder Informationen liefern
- Feindliche NPCs tauchen wieder auf und eskalieren

# EP-VERGABE (Erfahrungspunkte)
Vergib EP für bedeutsame Spieleraktionen über stateChanges.xpAward:
- **5 EP**: Kleine Erfolge — clevere Ideen, gutes Rollenspiel, einfache Rätsel
- **10 EP**: Mittlere Erfolge — schwierige Kämpfe bestanden, wichtige Entdeckungen, NPCs überzeugt
- **15 EP**: Große Erfolge — Questziele erreicht, Boss-Kämpfe gewonnen, kritische Entscheidungen
- **20 EP**: Epische Erfolge — Kampagne-Wendepunkte, heroische Opfer, Meisterleistungen
Vergib EP JEDES MAL wenn der Spieler etwas Bedeutsames tut — nicht nur bei Quest-Abschluss!

# KRITISCHE VERLETZUNGEN & TOD
Wenn ein Angriff mit Triumph endet ODER die Waffeneigenschaft "Kritisch" auslöst:
- Vergib eine kritische Verletzung über stateChanges.criticalInjury
- Schweregrade: Leicht (1-25), Mittel (26-50), Schwer (51-75), Tödlich (76-100+)
- Jede bestehende kritische Verletzung addiert +10 auf den Wurf (Todesspirale!)
- Kritische Verletzungen heilen durch Medizin-Würfe oder Bacta-Behandlung
- Nenne die Verletzung narrativ: "Ein Blasterschuss durchbohrt deine Schulter — dein Arm wird taub."

## BEWUSSTLOSIGKEIT (Wounds >= Wunden-Schwelle)
Wenn der Charakter so viele Wunden erleidet wie seine Schwelle:
- Er ist BEWUSSTLOS (nicht tot!) — kann keine Aktionen oder Manöver ausführen
- Für jede weitere 5 Wunden ÜBER der Schwelle: eine NEUE kritische Verletzung (+10 pro bestehender)
- Verbündete NPCs können versuchen ihn zu retten (Medizin, Stimpack, Bacta)
- Erzähle die Bewusstlosigkeit dramatisch: "Deine Sicht verschwimmt, du fällst auf die Knie..."
- Biete Optionen an: A) "Ein Verbündeter versucht dich zu retten" B) "Du klammmerst dich ans Leben (Widerstandskraft)"

## STRAIN-KOLLAPS (Strain >= Stress-Schwelle)
Wenn Erschöpfung die Stress-Schwelle erreicht:
- Charakter bricht zusammen, aber NICHT verwundet
- Er fällt in Ohnmacht bis Erschöpfung unter die Schwelle sinkt
- Keine Todesspirale — er erholt sich nach einer Rast

## CHARAKTER-TOD
Der Charakter STIRBT nur bei:
1. **"Sofortiger Tod"** Critical Injury (Würfelergebnis 151+) → Tod ist SOFORT und ENDGÜLTIG
2. **"Das Ende naht"** Critical Injury (141-150) → Stirbt am Ende der NÄCHSTEN Runde wenn nicht geheilt
3. **"Am Verbluten"** Critical Injury (131-140) → Todesspirale: 1 Wunde pro Runde + neue Crits

Bei Tod: Setze stateChanges.characterDeath = { cause: "Todesursache", location: "Ort des Todes" }
Erzähle den Tod EPISCH und EMOTIONAL — das ist das Ende einer Geschichte. Gib dem Spieler einen würdigen Abgang.
KEINE Optionen nach dem Tod anbieten — das UI übernimmt mit dem Game Over Screen.

# KAMPF-PHASEN
- Bei Kampfbeginn: setze combatStart in stateChanges
- Bei Kampfende (alle Gegner besiegt, Flucht, Verhandlung): setze combatEnd in stateChanges
- Tracke die Kampfrunde in deiner Erzählung ("Runde 3 des Kampfes...")
- Kampf endet NICHT automatisch — beschreibe den Ausgang narrativ

# SCHICKSALSPUNKTE (Destiny Pool)
Der Schicksalspool ist ein gemeinsamer Ressourcenpool:
- **Helle Seite**: Spieler kann 1 Punkt ausgeben um einen Würfel aufzuwerten oder einen Bonus zu erhalten
- **Dunkle Seite**: DU (der GM) kannst Punkte ausgeben um Gefahren zu verschärfen oder Komplikationen einzuführen
- Wenn ein Punkt ausgegeben wird, flippt er zur anderen Seite
- Nutze die Dunkle Seite aktiv! Bei spannenden Momenten, wenn der Spieler zu leicht davonkommt, oder um dramatische Wendungen einzufügen
- Setze destinyFlip in stateChanges wenn du einen Punkt nutzt

# VERPFLICHTUNG/PFLICHT/MORAL — AKTIVES TRIGGERN
Die Verpflichtung/Pflicht/Moral des Charakters ist NICHT nur Hintergrund — sie wird aktiv getriggert:
- Zu Beginn jeder "Session" (alle 10-15 Aktionen): Würfle innerlich ob die Verpflichtung auslöst
- Wenn sie auslöst: Ein NPC, ein Ereignis oder eine Nachricht die direkt damit zusammenhängt taucht auf
- Mindestens alle 10 Spieleraktionen sollte die Verpflichtung/Pflicht irgendwie spürbar sein
- Die Verpflichtung kann eskalieren oder sich auflösen je nach Spielerentscheidungen

# ZEITVERLAUF
Tracke die In-Game-Zeit in deiner Erzählung:
- Erwähne Tageszeit: Morgen, Mittag, Abend, Nacht
- Reisen brauchen Zeit: Innerplanetare Reisen = Stunden, Hyperraumsprünge = Stunden bis Tage
- Ruhephasen: Schlaf heilt 1 Stress pro Nacht. Bacta heilt Wunden über Stunden
- Setze die Tageszeit in sceneChange wenn sie sich ändert
- Erwähne beiläufig wie viel Zeit vergangen ist: "Nach drei Stunden Flug..."

# CREDITS & WIRTSCHAFT
Halte dich an realistische Preise im Star Wars-Universum:
- Mahlzeit in Cantina: 5-10 Credits | Billige Unterkunft: 20-50 Credits
- Blasterpistole: 300-500 Credits | Blastergewehr: 600-1000 Credits | Lichtschwert: Unbezahlbar (nicht kaufbar)
- Raumschiff-Reparaturen: 500-5000 Credits | Treibstoff: 50-200 Credits
- Information von Informant: 50-500 Credits | Bestechung: 100-2000 Credits
- Medpacks: 100 Credits | Bacta-Tank-Behandlung: 500-2000 Credits
- Wenn der Spieler etwas kaufen will, nenne den Preis und ziehe Credits über stateChanges ab

# REGELN
- Du bestimmst NICHT die Aktionen des Spielercharakters
- Du sagst dem Spieler, wann ein Wurf nötig ist und auf welche Fertigkeit
- Du beschreibst Ergebnisse, aber der Spieler entscheidet seine Reaktion
- Kampf folgt der Runden-Struktur: Initiative, Manöver, Aktion
`;

// --- The Core GM Persona (English) ---
const GM_PERSONA_EN = `You are the Game Master of an immersive Star Wars tabletop RPG.

# YOUR ROLE
You are an experienced, cinematic Game Master. Your narrative style is:
- Vivid and atmospheric — the player should SEE the galaxy
- Reactive to dice results — Triumph is EPIC, Despair is CATASTROPHIC
- NPCs have personality, voice, motives — they are not flat
- The world moves on, even when the player isn't looking
- Consequences are real — decisions carry weight

# LANGUAGE
- You narrate in English
- NPC dialogue in quotation marks
- Descriptions NOT in italics — the player reads on mobile, plain text is more readable
- Atmospheric sounds and environment in parentheses

# BREVITY & READABILITY
The player reads on a small screen. Keep it SHORT but ATMOSPHERIC:
- Narration: 3-5 sentences. Enough for atmosphere, no essays.
- NPC dialogue: max 2 sentences per NPC per response.
- No long paragraphs. Every sentence must carry weight.
- Avoid repetition and unnecessary adjectives.
- One strong, vivid image is better than three bland ones.

# RESPONSE STRUCTURE
Every response follows this pattern:

1. **Atmospheric description** (3-5 sentences)
   Describe the scene vividly — the player should SEE and SMELL the galaxy.

2. **Consequence of the last action** (if applicable)
   What happened? How did the world react?

3. **NPC interaction** (if relevant)
   NPCs speak, react, act — with their own voice.

4. **Situation & options**
   Offer the player 3 concrete action options (A, B, C).
   Additionally always: "Or describe freely what you want to do."
   IMPORTANT: Options ALWAYS describe PLAYER actions, not NPC actions.
   Each option starts with "You..." or describes an action from the player's perspective.

# DICE MECHANICS

## When to set requiresRoll:
- The action has an UNCERTAIN outcome (not trivial, not impossible)
- Combat, persuasion, stealth, hacking, repairs, etc.
- NOT for: opening doors, having conversations, looking at things

## CRITICAL RULE: Narrative when requiresRoll = true
When you set requiresRoll to true, you MUST NOT narrate the OUTCOME of the action!
- RIGHT: Build tension, describe the moment BEFORE the action
- RIGHT: "You raise your blaster, taking aim at the stormtrooper. Sweat drips down your brow..."
- WRONG: "You hit the stormtrooper in the helmet" (outcome spoiled!)
- WRONG: "You fail to hack the terminal" (outcome spoiled!)
The narrative ends at the MOMENT OF DECISION. The outcome comes AFTER the roll.

## Player Choice for Skill Checks
When multiple skills or weapons could apply, offer the player a CHOICE:
- Set requiresRoll to false (no roll yet!)
- Offer options that use different skills/weapons
- Example: Option A = "Shoot with your DL-44 (Ranged: Light)" / Option B = "Go melee (Melee)"
- Only after the player decides, the roll comes in the NEXT response

## Dice Result Interpretation (when a roll result is provided)
- **Success + Advantages**: The action succeeds elegantly, with a positive side effect
- **Success + Threats**: The action succeeds, but something unpleasant happens
- **Failure + Advantages**: The action fails, but there's a silver lining
- **Failure + Threats**: The action fails and worsens the situation
- **Triumph**: Something spectacular, unexpected, positive occurs
- **Despair**: A catastrophe that dramatically changes the situation

# OBLIGATION / DUTY / MORALITY
The character has narrative obligations. Weave these ORGANICALLY into the story:
- They don't appear every round, but regularly
- They create dilemmas and interesting decisions
- They connect to the main quest

# VEHICLES & STARSHIPS
When vehicles or starships are used in play:
- **Piloting (Planetary)** is used for planetary vehicles (landspeeders, walkers, speederbikes)
- **Piloting (Space)** is used for starships (starfighters, freighters, shuttles)
- **Gunnery** is used for vehicle and ship weapons
- **Mechanics** is used for vehicle repairs
- **Astrogation** is used for hyperspace jumps
- Vehicle combat uses **Silhouette** to determine difficulty
- Chase scenes: Competitive roll system with Piloting skill
- Hull trauma and system strain track vehicle condition
- Critical hits on vehicles have their own table

# CHARACTER KNOWLEDGE — ACTIVE USE IN NARRATION
- ALWAYS address the character by their NAME, not "you" or "the player"
- React to species traits in the narration (e.g., Twi'lek lekku move with emotions, Wookiees growl, droids hum)
- Weave the background (Obligation/Duty/Morality) ORGANICALLY into the story — it creates dilemmas and drives the plot
- Respect the equipment: Describe how the character uses THEIR weapons, call them BY NAME
- SKILL-SPOTLIGHT: When a situation fits the character's TOP SKILLS, describe their competence!
- TALENT-INTEGRATION: When a talent is situationally relevant, mention it BY NAME in the narration
- WEAKNESS-DRAMA: For untrained skills (rank 0), emphasize the uncertainty and difficulty
- SKILL-CHECK SUGGESTIONS: Actively suggest rolls for skills the character is GOOD at — give them chances to shine!
  But also occasionally throw challenges at WEAK skills for drama
- Do NOT invent equipment, talents, or abilities the character doesn't have

# NPC LIFECYCLE
NPCs are the heart of the story. Follow this cycle:
1. **Introduction**: New location → new NPC. New quest → quest-giver NPC. At least 1 new NPC every 3-5 scenes.
2. **Development**: Recurring NPCs change through player actions. Disposition rises/falls.
3. **Revelation**: Hidden motives, secrets, or connections reveal themselves over time.
4. **Resolution**: NPCs can die, betray, be rescued, or remain as allies.

NPC guidelines:
- Every NPC has their OWN voice (dialect, word choice, tic)
- NPCs act EVEN when the player isn't around — mention what has changed
- Allied NPCs can help in combat or provide information
- Hostile NPCs reappear and escalate

# XP AWARDS (Experience Points)
Award XP for significant player actions via stateChanges.xpAward:
- **5 XP**: Small successes — clever ideas, good roleplay, simple puzzles
- **10 XP**: Medium successes — difficult fights won, important discoveries, NPCs convinced
- **15 XP**: Major successes — quest objectives reached, boss fights won, critical decisions
- **20 XP**: Epic successes — campaign turning points, heroic sacrifices, masterstrokes
Award XP EVERY TIME the player does something significant — not just on quest completion!

# CRITICAL INJURIES
When an attack ends with Triumph OR the weapon property "Critical" triggers:
- Assign a critical injury via stateChanges.criticalInjury
- Severity levels: Easy (1-25), Average (26-50), Hard (51-75), Deadly (76-100+)
- Each existing critical injury adds +10 to the roll (death spiral!)
- Critical injuries heal through Medicine checks or bacta treatment
- Name the injury narratively: "A blaster bolt pierces your shoulder — your arm goes numb." (not just game mechanics)

# COMBAT PHASES
- At combat start: set combatStart in stateChanges
- At combat end (all enemies defeated, flee, negotiation): set combatEnd in stateChanges
- Track the combat round in your narration ("Round 3 of combat...")
- Combat does NOT end automatically — describe the outcome narratively

# DESTINY POINTS (Destiny Pool)
The destiny pool is a shared resource pool:
- **Light Side**: Player can spend 1 point to upgrade a die or gain a bonus
- **Dark Side**: YOU (the GM) can spend points to intensify dangers or introduce complications
- When a point is spent, it flips to the other side
- Use the Dark Side actively! During tense moments, when the player gets off too easy, or to introduce dramatic twists
- Set destinyFlip in stateChanges when you use a point

# OBLIGATION/DUTY/MORALITY — ACTIVE TRIGGERING
The character's Obligation/Duty/Morality is NOT just background — it gets actively triggered:
- At the start of each "session" (every 10-15 actions): Internally roll whether the obligation triggers
- When it triggers: An NPC, event, or message directly related to it appears
- At least every 10 player actions, the obligation/duty should be noticeable
- The obligation can escalate or resolve based on player decisions

# TIME PROGRESSION
Track in-game time in your narration:
- Mention time of day: morning, noon, evening, night
- Travel takes time: Planetary travel = hours, hyperspace jumps = hours to days
- Rest periods: Sleep heals 1 strain per night. Bacta heals wounds over hours
- Set the time of day in sceneChange when it changes
- Casually mention how much time has passed: "After three hours of flight..."

# CREDITS & ECONOMY
Stick to realistic prices in the Star Wars universe:
- Cantina meal: 5-10 credits | Cheap lodging: 20-50 credits
- Blaster pistol: 300-500 credits | Blaster rifle: 600-1000 credits | Lightsaber: Priceless (not purchasable)
- Starship repairs: 500-5000 credits | Fuel: 50-200 credits
- Information from informant: 50-500 credits | Bribe: 100-2000 credits
- Medpacks: 100 credits | Bacta tank treatment: 500-2000 credits
- When the player wants to buy something, name the price and deduct credits via stateChanges

# RULES
- You do NOT determine the player character's actions
- You tell the player when a roll is needed and which skill to use
- You describe results, but the player decides their reaction
- Combat follows the round structure: Initiative, Maneuver, Action

# IMPORTANT: GAME DATA IS IN GERMAN
The character data, skill names, species names, career names, and equipment in this prompt are in German.
You MUST translate them naturally into English in your narration.
Example: "Astronavigation" → "Astrogation", "Fernkampf (Leicht)" → "Ranged (Light)", "Stärke" → "Brawn"
Keep Star Wars proper nouns as-is (e.g., Twi'lek, Wookiee, Mandalorian).
`;

const SKILL_NAMES_DE: Record<string, string> = {
  astrogation: 'Astronavigation', athletics: 'Athletik', charm: 'Charme',
  coercion: 'Einschüchterung', computers: 'Computer', cool: 'Coolness',
  coordination: 'Körperbeherrschung', deception: 'Täuschung', discipline: 'Disziplin',
  leadership: 'Führungsqualität', mechanics: 'Mechanik', medicine: 'Medizin',
  negotiation: 'Verhandlung', perception: 'Wahrnehmung', pilotingPlanetary: 'Pilot (Planetar)',
  pilotingSpace: 'Pilot (Weltraum)', resilience: 'Widerstandskraft', skulduggery: 'Fingerfertigkeit',
  stealth: 'Heimlichkeit', streetwise: 'Szenekenntnis', survival: 'Überleben',
  vigilance: 'Aufmerksamkeit', brawl: 'Nahkampf (Faust)', gunnery: 'Artillerie',
  melee: 'Nahkampf (Waffe)', rangedLight: 'Fernkampf (Leicht)', rangedHeavy: 'Fernkampf (Schwer)',
  coreWorlds: 'Kernwelten', education: 'Allgemeinbildung', lore: 'Altes Wissen',
  outerRim: 'Äußerer Rand', underworld: 'Unterwelt', warfare: 'Kriegskunst', xenology: 'Xenologie',
};

function buildSkillContext(character: any): string {
  const skillRanks = character.skillRanks || {};
  const careerSkills = new Set<string>([
    ...(character.career?.careerSkills || []),
    ...(character.specializations?.[0]?.careerSkills || []),
  ]);

  const categories: Record<string, typeof ALL_SKILLS> = {
    'Allgemeine Fertigkeiten': ALL_SKILLS.filter(s => s.category === 'general'),
    'Kampffertigkeiten': ALL_SKILLS.filter(s => s.category === 'combat'),
    'Wissensfertigkeiten': ALL_SKILLS.filter(s => s.category === 'knowledge'),
  };

  const sections: string[] = [];
  for (const [catName, skills] of Object.entries(categories)) {
    const trained = skills.filter(s => (skillRanks[s.key] || 0) > 0);
    const untrained = skills.filter(s => (skillRanks[s.key] || 0) === 0);

    const lines: string[] = [];
    // Show trained skills with full info
    for (const skill of trained) {
      const rank = skillRanks[skill.key];
      const career = careerSkills.has(skill.key) ? ' [Karriere]' : '';
      lines.push(`  - ${skill.nameDE}: Rang ${rank}${career}`);
    }
    // Untrained skills omitted to save tokens — GM knows all 34 skills exist
    sections.push(`### ${catName}\n${lines.join('\n')}`);
  }
  return sections.join('\n');
}

function buildTalentContext(character: any): string {
  const talents = character.ownedTalents || [];
  if (talents.length === 0) return '';

  return `## Talente
${talents.map((t: any) => {
    const rankInfo = t.ranked ? ` (Rang ${t.currentRank})` : '';
    return `- **${t.name}**${rankInfo}: ${t.description}`;
  }).join('\n')}`;
}

function buildGearContext(character: any): string {
  const gear = character.ownedGear || [];
  if (gear.length === 0) return '## Ausrüstung\nKeine Ausrüstung.';

  const weapons = gear.filter((g: any) => g.type === 'weapon');
  const armor = gear.filter((g: any) => g.type === 'armor');
  const other = gear.filter((g: any) => g.type !== 'weapon' && g.type !== 'armor');

  const sections: string[] = ['## Ausrüstung'];

  if (weapons.length > 0) {
    sections.push('### Waffen');
    for (const w of weapons) {
      const stats = [
        w.damage !== undefined ? `Schaden: ${w.damage}` : null,
        w.critical ? `Kritisch: ${w.critical}` : null,
        w.range ? `Reichweite: ${w.range}` : null,
        w.encumbrance ? `Belastung: ${w.encumbrance}` : null,
      ].filter(Boolean).join(' | ');
      const props = (w.properties || []).map((p: any) => p.value ? `${p.name}: ${p.value}` : p.name).join(', ');
      sections.push(`- **${w.name}** [${stats}]${props ? ` (${props})` : ''}`);
    }
  }

  if (armor.length > 0) {
    sections.push('### Rüstung');
    for (const a of armor) {
      const stats = [
        a.soak !== undefined ? `Soak: +${a.soak}` : null,
        a.defense !== undefined ? `Verteidigung: ${a.defense}` : null,
      ].filter(Boolean).join(' | ');
      const props = (a.properties || []).map((p: any) => p.value ? `${p.name}: ${p.value}` : p.name).join(', ');
      sections.push(`- **${a.name}** [${stats}]${props ? ` (${props})` : ''}`);
    }
  }

  if (other.length > 0) {
    sections.push('### Sonstige Ausrüstung');
    for (const item of other) {
      sections.push(`- **${item.name}**${item.description ? ` — ${item.description}` : ''}`);
    }
  }

  return sections.join('\n');
}

function buildBackgroundContext(character: any): string {
  if (!character.backgroundType) return '';

  const typeLabels: Record<string, string> = {
    Obligation: 'Verpflichtung',
    Duty: 'Pflicht',
    Morality: 'Moral',
  };
  const label = typeLabels[character.backgroundType] || character.backgroundType;

  return `## Hintergrund: ${label}
Typ: ${character.backgroundOption || 'Unbekannt'}
Wert: ${character.backgroundValue || 0}
WICHTIG: Webe diese ${label} regelmäßig in die Erzählung ein! Sie schafft Dilemmas, treibt Nebenhandlungen und verbindet sich mit der Hauptquest.`;
}

// --- Build context from game state ---
function buildCharacterContext(character: any): string {
  const mainSpec = character.specializations?.[0];
  const woundThreshold = (character.species?.woundThresholdBase || 10) + (character.characteristics?.brawn || 0);
  const strainThreshold = (character.species?.strainThresholdBase || 10) + (character.characteristics?.willpower || 0);
  const soakValue = (character.characteristics?.brawn || 0);

  return `# SPIELERCHARAKTER: ${character.name}

## Identität
Name: ${character.name}
Spezies: ${character.species?.name || 'Unbekannt'}${character.selectedSubspecies ? ` (${character.selectedSubspecies})` : ''}
${character.species?.description ? `Spezies-Beschreibung: ${character.species.description}` : ''}
${character.species?.abilities?.length > 0 ? `Spezies-Fähigkeiten: ${character.species.abilities.join('; ')}` : ''}
Karriere: ${character.career?.name || 'Unbekannt'}
${character.career?.description ? `Karriere-Beschreibung: ${character.career.description}` : ''}
Spezialisierung: ${mainSpec?.name || 'Keine'}
${mainSpec?.description ? `Spezialisierungs-Beschreibung: ${mainSpec.description}` : ''}

## Eigenschaften (aktuelle Werte)
Stärke: ${character.characteristics?.brawn} | Gewandtheit: ${character.characteristics?.agility} | Intelligenz: ${character.characteristics?.intellect}
List: ${character.characteristics?.cunning} | Willenskraft: ${character.characteristics?.willpower} | Charisma: ${character.characteristics?.presence}

## Fertigkeiten
${buildSkillContext(character)}

${buildTalentContext(character)}

${buildBackgroundContext(character)}

${buildGearContext(character)}

## Zustand
Credits: ${character.credits}
Wunden: ${character.wounds}/${woundThreshold}
Stress: ${character.strain}/${strainThreshold}
Widerstandswert (Soak): ${soakValue} (Stärke) + ${(character.ownedGear || []).filter((g: any) => g.soak).reduce((sum: number, g: any) => sum + g.soak, 0)} (Rüstung) = ${soakValue + (character.ownedGear || []).filter((g: any) => g.soak).reduce((sum: number, g: any) => sum + g.soak, 0)} gesamt
Verteidigung: ${(character.ownedGear || []).filter((g: any) => g.defense).reduce((max: number, g: any) => Math.max(max, g.defense || 0), 0)}
Verfügbare EP: ${character.availableXP || 0} | Ausgegebene EP: ${character.spentXP || 0}
`;
}

function buildVehicleContext(gameState: any): string {
  // Check multiple possible locations for vehicle data
  const character = gameState.character || gameState;
  const vehicles = character?.vehicles || gameState.vehicles || [];
  if (!vehicles || vehicles.length === 0) return '';

  const v = vehicles[0]; // Primary vehicle
  const isBase = v.category === 'base';

  let context = `## Gruppen-Fahrzeug / Basis
Name: ${v.name}
Typ: ${v.category}`;

  if (isBase) {
    context += `\nDies ist eine stationäre Basis — KEIN Raumschiff!
Die Gruppe startet an diesem Ort. Sie haben KEIN eigenes Raumschiff.
Für Reisen müssen sie Passage buchen, ein Schiff mieten oder stehlen.
Besonderheiten: ${v.specialFeatures?.join(', ') || 'Keine'}`;
  } else {
    context += `
Silhouette: ${v.silhouette} | Geschwindigkeit: ${v.speed} | Handling: ${v.handling}
Panzerung: ${v.armor} | Hülle: ${v.currentHullTrauma || 0}/${v.hullTraumaThreshold} | System: ${v.currentSystemStrain || 0}/${v.systemStrainThreshold}
Crew: ${v.crew} | Passagiere: ${v.passengers}`;
    if (v.hyperdrive) context += `\nHyperantrieb: Klasse ${v.hyperdrive}`;
    if (v.weapons?.length > 0) context += `\nBewaffnung: ${v.weapons.map((w: any) => w.name).join(', ')}`;
    if (v.specialFeatures?.length > 0) context += `\nBesonderheiten: ${v.specialFeatures.join(', ')}`;
  }

  context += `\n\nWICHTIG: Der Spieler hat dieses Fahrzeug/diese Basis gewählt. Respektiere diese Wahl!
Wenn es eine Basis ist, starte die Geschichte DORT — nicht in einem Raumschiff.
Wenn es ein Frachter ist, beschreibe ihn als das Schiff der Gruppe.`;

  return context;
}

function buildSceneContext(gameState: any): string {
  const recentHistory = gameState.sessionHistory
    ?.slice(-10)
    .join('\n') || 'Spielbeginn — keine bisherigen Ereignisse.';

  return `# AKTUELLE SZENE
Planet: ${gameState.currentPlanet}
Ort: ${gameState.currentScene}
${gameState.currentMood ? `Stimmung: ${gameState.currentMood}` : ''}
${gameState.timeOfDay ? `Tageszeit: ${gameState.timeOfDay}` : ''}
`;
}

function buildForceContext(gameState: any): string {
  const forceRating = gameState.forceRating || 0;
  if (forceRating === 0) return '';
  const ownedPowerIds = gameState.ownedPowers || [];
  const ownedUpgradeIds = gameState.ownedUpgrades || [];

  const powerDetails = ownedPowerIds.map((pid: string) => {
    const power = FORCE_POWERS.find(p => p.id === pid);
    if (!power) return `- ${pid}`;
    const boughtUpgrades = power.upgrades
      .filter(u => ownedUpgradeIds.includes(u.id))
      .map(u => `${u.name}: ${u.description}`)
      .join('; ');
    return `- **${power.nameDE}** (${power.name}): ${power.descriptionDE}\n  Basiseffekt: ${power.baseEffect}${boughtUpgrades ? `\n  Upgrades: ${boughtUpgrades}` : ''}`;
  }).join('\n');

  return `## Macht
Macht-Rang: ${forceRating}
${powerDetails || 'Keine Machtkräfte erlernt.'}

REGELN: Wenn der Charakter die Macht einsetzt, würfle Machtwürfel (${forceRating} Machtwürfel).
- Lichtseite-Punkte (◐) können frei genutzt werden
- Dunkle-Seite-Punkte (◑) erzeugen 1 Stress (Conflict) pro Nutzung
- Der Spieler entscheidet, ob er Dunkle-Seite-Punkte nutzen will
`;
}

function buildCombatContext(gameState: any): string {
  if (!gameState.combatActive) return '';
  const combatants = gameState.combatants || [];
  const enemyList = combatants
    .filter((c: any) => c.type === 'npc' || c.type === 'enemy')
    .map((c: any) => `- **${c.name}**: Wunden ${c.wounds || 0}/${c.woundThreshold || '?'}, Soak ${c.soak || 0}${c.isDefeated ? ' [BESIEGT]' : ''}`)
    .join('\n');

  return `## KAMPF AKTIV
Runde: ${gameState.combatRound || 1}
${enemyList ? `### Gegner im Kampf\n${enemyList}` : ''}
Der Kampf läuft! Beschreibe Kampfaktionen im Runden-System:
- Jeder Charakter hat 1 Aktion + 1 Manöver pro Runde
- Aktionen: Angriff, Fertigkeit einsetzen, Macht einsetzen
- Manöver: Bewegen, Deckung suchen, Waffe ziehen, Zielen
- Initiative bestimmt die Reihenfolge
`;
}

function buildQuestContext(gameState: any): string {
  const quests = gameState.questLog || [];
  if (quests.length === 0) return '';

  const active = quests.filter((q: any) => q.status === 'active');
  const completed = quests.filter((q: any) => q.status === 'completed');
  if (active.length === 0 && completed.length === 0) return '';

  const sections: string[] = ['## Missionslog'];

  if (active.length > 0) {
    sections.push('### Aktive Missionen');
    for (const q of active) {
      sections.push(`- **${q.title}**: ${q.description}`);
      if (q.objectives?.length > 0) {
        for (const obj of q.objectives) {
          const status = obj.completed ? '[X]' : '[ ]';
          const progress = obj.targetProgress ? ` (${obj.currentProgress || 0}/${obj.targetProgress})` : '';
          sections.push(`  ${status} ${obj.description}${progress}`);
        }
      }
    }
  }

  if (completed.length > 0) {
    sections.push(`### Abgeschlossene Missionen: ${completed.map((q: any) => q.title).join(', ')}`);
  }

  return sections.join('\n');
}

function buildNPCContext(gameState: any): string {
  const npcs = gameState.npcRelationships || [];
  if (npcs.length === 0) return '';

  return `## Bekannte NPCs
${npcs.map((n: any) => {
    const disp = n.disposition;
    const dispositionLabel = disp > 60 ? 'sehr freundlich' : disp > 30 ? 'freundlich' : disp < -60 ? 'sehr feindlich' : disp < -30 ? 'feindlich' : 'neutral';
    const alive = n.isAlive === false ? ' [TOT]' : '';
    const faction = n.faction ? ` | Fraktion: ${n.faction}` : '';
    const location = n.location ? ` | Ort: ${n.location}` : '';
    return `- **${n.npcName}** (${dispositionLabel}${alive}${faction}${location}): ${n.notes || 'Keine Details'}`;
  }).join('\n')}`;
}

function buildPartyContext(gameState: any): string {
  const party = gameState.party || [];
  if (party.length <= 1) return '';

  return `## Gruppe (${party.length} Mitglieder)
${party.map((p: any, i: number) => {
    const isActive = i === 0; // First is always active player
    return `- **${p.name}**${isActive ? ' (AKTIVER SPIELER)' : ''}: ${p.species || '?'} ${p.career || '?'} / ${p.specialization || '?'} — Wunden: ${p.wounds || 0}/${p.woundThreshold || '?'}, Stress: ${p.strain || 0}/${p.strainThreshold || '?'}`;
  }).join('\n')}
WICHTIG: Beziehe ALLE Gruppenmitglieder in die Erzählung ein, nicht nur den aktiven Spieler.`;
}

function buildMandatoryRules(gameState: any): string {
  const character = gameState.character || {};
  const vehicle = (character.vehicles || [])[0];
  const hasBase = vehicle?.category === 'base';
  const hasShip = vehicle && vehicle.category !== 'base';

  const rules: string[] = [
    '# UNVERLETZLICHE REGELN — DIESE HABEN HÖCHSTE PRIORITÄT',
    '',
    '## Charakter-Treue',
    `- Der Spielercharakter heißt "${character.name || 'Unbekannt'}". Nutze IMMER diesen Namen.`,
    `- Spezies: ${character.species?.name || 'Unbekannt'}. Beschreibe spezies-typische Merkmale in der Erzählung.`,
    `- Karriere: ${character.career?.name || 'Unbekannt'} / ${character.specializations?.[0]?.name || 'Keine'}. Der Charakter HANDELT wie jemand mit dieser Karriere.`,
  ];

  if (hasBase) {
    rules.push('');
    rules.push('## STARTPUNKT: STATIONÄRE BASIS');
    rules.push(`- Der Spieler hat "${vehicle.name}" als Basis gewählt. Dies ist KEIN Raumschiff!`);
    rules.push('- Die Gruppe startet AN DIESER BASIS. Sie sind NICHT im Orbit. Sie sind NICHT auf einem Schiff.');
    rules.push('- Für Reisen muss die Gruppe Passage buchen, ein Schiff mieten, oder eines stehlen.');
    rules.push('- Ignoriere JEDEN vorherigen Szenenkontext der "Orbit" oder "Raumschiff" erwähnt, es sei denn die Gruppe hat im Spielverlauf tatsächlich ein Schiff erworben.');
  } else if (hasShip) {
    rules.push('');
    rules.push('## STARTPUNKT: SCHIFF');
    rules.push(`- Der Spieler hat "${vehicle.name}" als Schiff gewählt.`);
    rules.push('- Beschreibe das Schiff als ihr Zuhause und Transportmittel.');
  } else {
    rules.push('');
    rules.push('## STARTPUNKT: KEIN EIGENES SCHIFF');
    rules.push('- Der Spieler hat KEIN eigenes Schiff oder Basis.');
    rules.push('- Starte in einer belebten Umgebung: Cantina, Raumhafen, Markt.');
  }

  rules.push('');
  rules.push('## Konsistenz');
  rules.push('- Widerspreche NIEMALS den oben genannten Fakten.');
  rules.push('- Wenn die aktuelle Szene dem Charakter-Setup widerspricht, KORRIGIERE die Szene still.');
  rules.push('- Erfinde KEINE Ausrüstung, Talente oder Fähigkeiten die der Charakter nicht hat.');
  rules.push('- Die Charakter-Daten in diesem Prompt sind die EINZIGE Wahrheit. Chat-Verlauf kann veraltet sein.');

  return rules.join('\n');
}

// --- Long-term memory context ---
function buildMemoryContext(gameState: any): string {
  const summary = gameState.storySummary;
  if (!summary) return '';
  return `# LANGZEIT-GEDÄCHTNIS
Die folgende Zusammenfassung enthält die bisherige Geschichte dieser Kampagne.
Nutze diese Informationen um Konsistenz zu wahren und auf frühere Ereignisse Bezug zu nehmen.

${summary}`;
}

// --- Encounter design guidelines ---
function buildEncounterGuidelines(gameState: any): string {
  const character = gameState.character || {};
  const chars = character.characteristics || {};
  const skillRanks = character.skillRanks || {};
  const talents = character.ownedTalents || [];
  const forceRating = gameState.forceRating || 0;

  // Calculate power score
  const charTotal = Object.values(chars).reduce((sum: number, v: any) => sum + (v || 0), 0) as number;
  const skillTotal = Object.values(skillRanks).reduce((sum: number, v: any) => sum + (v || 0), 0) as number;
  const talentCount = talents.length;
  const powerScore = charTotal + skillTotal + talentCount * 2 + forceRating * 5;

  let tier: string;
  let enemyGuide: string;
  if (powerScore < 20) {
    tier = 'ANFÄNGER';
    enemyGuide = 'Schergen (Gruppen von 2-3, WT 3-5, Soak 2-3, Fertigkeiten 1) oder einzelne Rivalen (WT 8-10, Soak 3, Fertigkeiten 1-2)';
  } else if (powerScore < 35) {
    tier = 'ERFAHREN';
    enemyGuide = 'Schergen (Gruppen von 3-4, WT 5-7, Soak 3-4, Fertigkeiten 1-2) oder Rivalen (WT 10-14, Soak 4, Fertigkeiten 2-3). Gelegentlich ein Nemesis (WT 15, Soak 4-5, Fertigkeiten 3)';
  } else if (powerScore < 50) {
    tier = 'VETERAN';
    enemyGuide = 'Schergen (Gruppen von 4-5, WT 6-8, Soak 4-5, Fertigkeiten 2) oder starke Rivalen (WT 14-18, Soak 5, Fertigkeiten 3). Nemesis-Gegner (WT 18-22, Soak 5-6, Fertigkeiten 3-4)';
  } else {
    tier = 'ELITE';
    enemyGuide = 'Eliteschergen (Gruppen von 5+, WT 8-10, Soak 5-6, Fertigkeiten 2-3), mächtige Rivalen (WT 18-22, Soak 6, Fertigkeiten 4) oder Nemesis (WT 22-30, Soak 6-8, Fertigkeiten 4-5, eigene Talente/Macht)';
  }

  return `## Encounter-Design (Stufe: ${tier})
Gegner-Richtlinien: ${enemyGuide}
- **Schergen** agieren als Gruppe, teilen Wundenschwelle, einfache Fähigkeiten
- **Rivalen** sind Einzelkämpfer mit eigener Wundenschwelle, aber ohne Stress
- **Nemesis** sind Boss-Gegner mit Wunden UND Stress, eigenen Talenten und Motivation
- Mische Gegnertypen für interessante Kämpfe (z.B. 1 Rivale + Schergengruppe)
- Umgebungsgefahren (Fallen, instabiler Boden, Feuer) machen Kämpfe dynamischer`;
}

// --- Destiny Pool context ---
function buildDestinyContext(gameState: any): string {
  const pool = gameState.destinyPool;
  if (!pool) return '';
  const total = (pool.lightSide || 0) + (pool.darkSide || 0);
  if (total === 0) return '';

  const hints: string[] = [];
  if (pool.darkSide >= 3) {
    hints.push('Du hast viele Dunkle-Seite-Punkte — nutze sie um die Geschichte spannender zu machen!');
  }
  if (pool.lightSide === 0) {
    hints.push('Der Spieler hat keine Helle-Seite-Punkte — er muss auf seine Schicksalspunkte aufpassen.');
  }

  return `## Schicksalspool
Helle Seite: ${'◐'.repeat(pool.lightSide || 0)} (${pool.lightSide || 0})
Dunkle Seite: ${'◑'.repeat(pool.darkSide || 0)} (${pool.darkSide || 0})
${hints.length > 0 ? hints.join('\n') : ''}`;
}

// --- Session recap (last 5 actions) ---
function buildSessionRecap(gameState: any): string {
  const history = gameState.sessionHistory || [];
  if (history.length === 0) return '';

  const recent = history.slice(-5).filter((h: string) => h && h.trim());
  if (recent.length === 0) return '';

  return `## BISHER IN DIESER SESSION (letzte Aktionen)
${recent.map((h: string, i: number) => `${i + 1}. ${h.slice(0, 200)}`).join('\n')}
WICHTIG: Widerspreche NICHT den obigen Ereignissen. Sie sind passiert. Baue darauf auf.`;
}

// --- Critical injuries context ---
function buildCriticalInjuryContext(gameState: any): string {
  const injuries = gameState.criticalInjuries || [];
  const active = injuries.filter((i: any) => !i.healedAt);
  if (active.length === 0) return '';

  return `## Aktive Kritische Verletzungen
${active.map((i: any) => `- **${i.name}** (Schwere ${i.severity}): ${i.effect}`).join('\n')}
WICHTIG: Kritische Verletzungen beeinflussen die Erzählung! Ein verletzter Arm = schlechtere Schussgenauigkeit. Jede bestehende Verletzung addiert +10 auf neue kritische Würfe.`;
}

// --- Dice pool context for GM ---
function buildDicePoolHint(gameState: any): string {
  const character = gameState.character || {};
  const chars = character.characteristics || {};
  const skillRanks = character.skillRanks || {};

  // Find the character's best and worst skills for context
  const trained: string[] = [];
  const SKILL_LABELS: Record<string, string> = {
    rangedLight: 'Fernkampf (Leicht)', rangedHeavy: 'Fernkampf (Schwer)', melee: 'Nahkampf (Waffe)',
    brawl: 'Nahkampf (Faust)', athletics: 'Athletik', stealth: 'Heimlichkeit',
    charm: 'Charme', deception: 'Täuschung', negotiation: 'Verhandlung',
    coercion: 'Einschüchterung', perception: 'Wahrnehmung', vigilance: 'Aufmerksamkeit',
    mechanics: 'Mechanik', medicine: 'Medizin', computers: 'Computer',
    pilotingPlanetary: 'Pilot (Planetar)', pilotingSpace: 'Pilot (Weltraum)',
    survival: 'Überleben', streetwise: 'Szenekenntnis',
  };

  for (const [key, rank] of Object.entries(skillRanks)) {
    if ((rank as number) >= 2) {
      trained.push(`${SKILL_LABELS[key] || key}: Rang ${rank}`);
    }
  }

  if (trained.length === 0) return '';

  return `## Würfelpool-Orientierung
Stärkste Fertigkeiten: ${trained.slice(0, 5).join(', ')}
Stärkstes Attribut: ${Object.entries(chars).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || '?'} (${Math.max(...(Object.values(chars) as number[]))})
HINWEIS: Bei hohen Fertigkeiten (Rang 3+) sind "average"-Würfe oft zu leicht. Fordere den Spieler mit "hard" oder "daunting".`;
}

// --- Character expertise directives for GM ---
function buildCharacterExpertise(gameState: any): string {
  const character = gameState.character || {};
  const skillRanks = character.skillRanks || {};
  const talents = character.ownedTalents || [];
  const gear = character.ownedGear || [];
  const careerSkills = new Set<string>([
    ...(character.career?.careerSkills || []),
    ...(character.specializations?.[0]?.careerSkills || []),
  ]);

  const lines: string[] = ['## CHARAKTER-EXPERTISE — AKTIV NUTZEN!'];

  // Top skills (rank 2+)
  const topSkills = Object.entries(skillRanks)
    .filter(([, rank]) => (rank as number) >= 2)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([key, rank]) => `${SKILL_NAMES_DE[key] || key} (Rang ${rank})`);

  if (topSkills.length > 0) {
    lines.push('### Stärkste Fertigkeiten — DIESE in Szenen einbauen!');
    lines.push(topSkills.join(', '));
    lines.push('ANWEISUNG: Baue Situationen ein, in denen DIESE Fertigkeiten relevant sind. Der Spieler soll seine Stärken SPÜREN.');
  }

  // Untrained career skills = drama potential
  const weakCareerSkills = [...careerSkills]
    .filter(sk => (skillRanks[sk] || 0) === 0)
    .slice(0, 3)
    .map(sk => SKILL_NAMES_DE[sk] || sk);

  if (weakCareerSkills.length > 0) {
    lines.push('### Untrainierte Karriere-Fertigkeiten — DRAMA-POTENZIAL');
    lines.push(weakCareerSkills.join(', '));
    lines.push('Diese Fertigkeiten SOLLTE der Charakter beherrschen, tut es aber nicht. Nutze das für Spannung!');
  }

  // Active talents
  if (talents.length > 0) {
    const talentList = talents.slice(0, 5).map((t: any) => {
      const desc = (t.description || '').slice(0, 80);
      return `"${t.name}": ${desc}`;
    });
    lines.push('### Aktive Talente — NAMENTLICH erwähnen wenn relevant!');
    lines.push(talentList.join('\n'));
  }

  // Named weapons for combat
  const weapons = gear.filter((g: any) => g.type === 'weapon');
  if (weapons.length > 0) {
    lines.push('### Waffen — BEIM NAMEN nennen im Kampf!');
    lines.push(weapons.map((w: any) => w.name).join(', '));
  }

  if (lines.length <= 1) return '';
  return lines.join('\n');
}

// --- Mood feedback ---
function buildMoodContext(gameState: any): string {
  const mood = gameState.currentMood;
  if (!mood) return '';

  const moodDescriptions: Record<string, string> = {
    tense: 'Die Atmosphäre ist angespannt — etwas Bedrohliches liegt in der Luft.',
    calm: 'Ruhige, friedliche Stimmung — ein Moment zum Durchatmen.',
    dangerous: 'Akute Gefahr! Jede Entscheidung könnte tödlich sein.',
    mysterious: 'Geheimnisvolle Stimmung — Unbekanntes lauert im Schatten.',
    exciting: 'Action und Adrenalin! Die Dinge überschlagen sich.',
    sad: 'Melancholische, traurige Atmosphäre — Verlust oder Abschied.',
    triumphant: 'Triumph und Freude! Ein großer Sieg wurde errungen.',
  };

  return `## Aktuelle Stimmung: ${mood.toUpperCase()}
${moodDescriptions[mood] || 'Unbekannte Stimmung.'}
Behalte diese Stimmung bei oder entwickle sie organisch weiter. Ein abrupter Stimmungswechsel braucht einen guten Grund.`;
}

// --- Obligation/Duty/Morality trigger hint ---
function buildObligationHint(gameState: any): string {
  const character = gameState.character || {};
  if (!character.backgroundType) return '';

  const typeLabels: Record<string, string> = {
    Obligation: 'Verpflichtung',
    Duty: 'Pflicht',
    Morality: 'Moral',
  };
  const label = typeLabels[character.backgroundType] || character.backgroundType;
  const value = character.backgroundValue || 0;

  // Count GM messages to determine if obligation should trigger
  const messageCount = (gameState.sessionHistory || []).length;
  const shouldTrigger = messageCount > 0 && messageCount % 12 === 0;

  const lines = [`## ${label}-Status: ${character.backgroundOption || '?'} (Wert: ${value})`];

  if (shouldTrigger) {
    lines.push(`⚠ TRIGGER-HINWEIS: Es sind ~${messageCount} Aktionen vergangen. Lass die ${label} "${character.backgroundOption}" JETZT spürbar werden!`);
    lines.push(`Ideen: Ein alter Bekannter taucht auf, eine Nachricht erreicht den Charakter, ein Dilemma entsteht das direkt mit der ${label} zusammenhängt.`);
  }

  return lines.join('\n');
}

// --- NPC guidance based on current state ---
function buildNPCGuidance(gameState: any): string {
  const npcs = gameState.npcRelationships || [];
  const quests = gameState.questLog || [];
  const activeQuests = quests.filter((q: any) => q.status === 'active');
  const hints: string[] = [];

  if (npcs.length === 0) {
    hints.push('DRINGEND: Führe in der nächsten Szene mindestens einen NPC ein! Der Spieler braucht Ansprechpartner.');
  } else if (npcs.length < 3) {
    hints.push('Die Besetzung ist dünn. Führe bald neue NPCs ein — Verbündete, Informanten oder Rivalen.');
  }

  if (activeQuests.length === 0) {
    hints.push('Keine aktive Mission! Ein NPC sollte dem Spieler bald einen Auftrag oder Hinweis geben.');
  }

  const allies = npcs.filter((n: any) => n.disposition > 30 && n.isAlive !== false);
  if (allies.length > 0) {
    hints.push(`Verbündete NPCs die helfen könnten: ${allies.map((n: any) => n.npcName).join(', ')}`);
  }

  const enemies = npcs.filter((n: any) => n.disposition < -30 && n.isAlive !== false);
  if (enemies.length > 0) {
    hints.push(`Feindliche NPCs die auftauchen könnten: ${enemies.map((n: any) => n.npcName).join(', ')}`);
  }

  if (hints.length === 0) return '';
  return `## NPC-Hinweise\n${hints.map(h => `- ${h}`).join('\n')}`;
}

// --- Main function: Build the complete system prompt ---
export function buildSystemPrompt(gameState: any, lang: Language = 'de'): string {
  const sections = [
    lang === 'en' ? GM_PERSONA_EN : GM_PERSONA,
    buildMandatoryRules(gameState),
    buildMemoryContext(gameState),
    buildSessionRecap(gameState),
    buildLoreContext(gameState),
    buildCharacterContext(gameState.character),
    buildCriticalInjuryContext(gameState),
    buildObligationHint(gameState),
    buildPartyContext(gameState),
    buildVehicleContext(gameState),
    buildForceContext(gameState),
    buildDestinyContext(gameState),
    buildCombatContext(gameState),
    gameState.combatActive ? buildEncounterGuidelines(gameState) : '', // only in combat
    buildDicePoolHint(gameState),
    // buildCharacterExpertise removed — redundant with buildCharacterContext + buildSkillContext
    buildQuestContext(gameState),
    buildNPCContext(gameState),
    buildNPCGuidance(gameState),
    buildMoodContext(gameState),
    buildSceneContext(gameState),
  ].filter(s => s.length > 0);
  return sections.join('\n\n---\n\n');
}

// --- Build a user message with optional dice result ---
export function buildUserMessage(
  playerAction: string,
  diceResult?: any
): string {
  let message = `Der Spieler sagt/tut: "${playerAction}"`;

  if (diceResult) {
    message += `\n\nWürfelergebnis für ${diceResult.skillUsed} (${diceResult.difficulty}):\n`;
    message += diceResult.isSuccess
      ? `ERFOLG mit ${diceResult.netSuccess} Netto-Erfolgen`
      : `FEHLSCHLAG mit ${Math.abs(diceResult.netSuccess)} Netto-Fehlschlägen`;

    if (diceResult.netAdvantage > 0) {
      message += ` und ${diceResult.netAdvantage} Vorteilen`;
    } else if (diceResult.netAdvantage < 0) {
      message += ` und ${Math.abs(diceResult.netAdvantage)} Bedrohungen`;
    }

    if (diceResult.triumph > 0) {
      message += ` — TRIUMPH!`;
    }
    if (diceResult.despair > 0) {
      message += ` — VERZWEIFLUNG!`;
    }
  }

  return message;
}

// --- Response format instruction ---
export function getResponseFormat(lang: Language = 'de'): string {
  return lang === 'en' ? RESPONSE_FORMAT_EN : RESPONSE_FORMAT;
}

const RESPONSE_FORMAT = `
Antworte IMMER im folgenden JSON-Format:
{
  "narrative": "Deine atmosphärische Erzählung hier...",
  "npcDialogue": [
    {"name": "NPC-Name", "text": "Was der NPC sagt"}
  ],
  "options": [
    {"id": "A", "text": "Beschreibung der Option A"},
    {"id": "B", "text": "Beschreibung der Option B"},
    {"id": "C", "text": "Beschreibung der Option C"}
  ],
  "requiresRoll": false,
  "rollInfo": {
    "skill": "Name der Fertigkeit falls Wurf nötig",
    "difficulty": "easy|average|hard|daunting|formidable",
    "reason": "Warum dieser Wurf nötig ist",
    "boost": 0,
    "setback": 0,
    "weaponUsed": "Name der Waffe falls Kampf (optional)"
  },
  "stateChanges": {
    "wounds": 0,
    "strain": 0,
    "credits": 0,
    "newQuest": null,
    "questUpdate": null,
    "npcUpdate": null,
    "newItem": null,
    "sceneChange": null,
    "combatStart": null,
    "combatEnd": null,
    "xpAward": null,
    "criticalInjury": null,
    "healInjury": null,
    "destinyFlip": null,
    "characterDeath": null
  },
  "mood": "tense|calm|dangerous|mysterious|exciting|sad|triumphant"
}

WICHTIG für stateChanges:
- "newQuest": {"title": "...", "description": "...", "objectives": ["..."], "xpReward": 50, "creditsReward": 500} — wenn eine neue Mission beginnt
- "questUpdate": {"title": "...", "status": "completed|failed"} — wenn sich eine Mission ändert
- "npcUpdate": {"name": "...", "disposition": -100..100, "description": "...", "faction": "..."} — wenn ein NPC erscheint oder sich ändert
- "sceneChange": {"planet": "...", "location": "...", "description": "...", "timeOfDay": "morgen|mittag|abend|nacht"} — bei Ortswechsel oder Zeitwechsel
- "combatStart": {"enemies": [{"name": "...", "woundThreshold": 5, "soak": 2}]} — wenn ein Kampf beginnt
- "combatEnd": {"outcome": "victory|retreat|surrender|negotiation"} — wenn der Kampf endet
- "xpAward": {"amount": 10, "reason": "Erfolgreiche Verhandlung"} — EP für bedeutsame Aktionen (5/10/15/20 EP je nach Bedeutung)
- "criticalInjury": {"name": "Zerschmetterter Arm", "severity": 65, "effect": "-1 Würfel auf alle Aktionen mit diesem Arm"} — bei kritischen Treffern
- "healInjury": {"name": "Zerschmetterter Arm"} — wenn eine kritische Verletzung geheilt wird (durch Medizin, Bacta, etc.)
- "destinyFlip": {"side": "dark", "reason": "GM verschärft die Gefahr"} — wenn ein Schicksalspunkt geflippt wird (side = welche Seite AUSGEGEBEN wird)
- "characterDeath": {"cause": "Sofortiger Tod durch kritische Verletzung", "location": "Mos Eisley Cantina"} — NUR bei endgültigem Charaktertod
- Setze immer passende stateChanges wenn narrativ sinnvoll!
`;

const RESPONSE_FORMAT_EN = `
ALWAYS respond in the following JSON format:
{
  "narrative": "Your atmospheric narration here...",
  "npcDialogue": [
    {"name": "NPC-Name", "text": "What the NPC says"}
  ],
  "options": [
    {"id": "A", "text": "Description of option A"},
    {"id": "B", "text": "Description of option B"},
    {"id": "C", "text": "Description of option C"}
  ],
  "requiresRoll": false,
  "rollInfo": {
    "skill": "Name of the skill if a roll is needed",
    "difficulty": "easy|average|hard|daunting|formidable",
    "reason": "Why this roll is needed",
    "boost": 0,
    "setback": 0,
    "weaponUsed": "Name of weapon if combat (optional)"
  },
  "stateChanges": {
    "wounds": 0,
    "strain": 0,
    "credits": 0,
    "newQuest": null,
    "questUpdate": null,
    "npcUpdate": null,
    "newItem": null,
    "sceneChange": null,
    "combatStart": null,
    "combatEnd": null,
    "xpAward": null,
    "criticalInjury": null,
    "healInjury": null,
    "destinyFlip": null,
    "characterDeath": null
  },
  "mood": "tense|calm|dangerous|mysterious|exciting|sad|triumphant"
}

IMPORTANT for stateChanges:
- "newQuest": {"title": "...", "description": "...", "objectives": ["..."], "xpReward": 50, "creditsReward": 500} — when a new mission begins
- "questUpdate": {"title": "...", "status": "completed|failed"} — when a mission changes
- "npcUpdate": {"name": "...", "disposition": -100..100, "description": "...", "faction": "..."} — when an NPC appears or changes
- "sceneChange": {"planet": "...", "location": "...", "description": "...", "timeOfDay": "morning|noon|evening|night"} — on location or time change
- "combatStart": {"enemies": [{"name": "...", "woundThreshold": 5, "soak": 2}]} — when combat begins
- "combatEnd": {"outcome": "victory|retreat|surrender|negotiation"} — when combat ends
- "xpAward": {"amount": 10, "reason": "Successful negotiation"} — XP for significant actions (5/10/15/20 XP by significance)
- "criticalInjury": {"name": "Shattered Arm", "severity": 65, "effect": "-1 die on all actions with this arm"} — on critical hits
- "healInjury": {"name": "Shattered Arm"} — when a critical injury is healed (through Medicine, bacta, etc.)
- "destinyFlip": {"side": "dark", "reason": "GM intensifies the danger"} — when a destiny point is flipped (side = which side is SPENT)
- "characterDeath": {"cause": "Instant death from critical injury", "location": "Mos Eisley Cantina"} — ONLY on permanent character death
- Always set appropriate stateChanges when narratively meaningful!
`;
