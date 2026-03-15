// ============================================================
// QUANTUM RPG — Force Powers Engine
// ============================================================
// Based on SW Machtkraefte V4 (23 pages)
// Force-sensitive characters can use Force powers
// ============================================================

export interface ForcePowerUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number; // XP cost
  purchased: boolean;
  requires?: string[]; // prerequisite upgrade IDs
}

export interface ForcePower {
  id: string;
  name: string;
  nameDE: string;
  description: string;
  descriptionDE: string;
  baseEffect: string;
  forceRating: number; // minimum Force Rating required
  upgrades: ForcePowerUpgrade[];
}

// Core Force Powers from the FFG system
export const FORCE_POWERS: ForcePower[] = [
  {
    id: 'move',
    name: 'Move',
    nameDE: 'Bewegen',
    description: 'Use the Force to move objects at range.',
    descriptionDE: 'Nutze die Macht, um Objekte auf Entfernung zu bewegen.',
    baseEffect: 'Spend ◐ to move one object of silhouette 0 within short range.',
    forceRating: 1,
    upgrades: [
      { id: 'move-str1', name: 'Stärke', description: 'Silhouette +1', cost: 10, purchased: false },
      { id: 'move-str2', name: 'Stärke', description: 'Silhouette +1', cost: 15, purchased: false, requires: ['move-str1'] },
      { id: 'move-str3', name: 'Stärke', description: 'Silhouette +1', cost: 20, purchased: false, requires: ['move-str2'] },
      { id: 'move-range1', name: 'Reichweite', description: 'Reichweite +1 Band', cost: 10, purchased: false },
      { id: 'move-range2', name: 'Reichweite', description: 'Reichweite +1 Band', cost: 15, purchased: false, requires: ['move-range1'] },
      { id: 'move-mag1', name: 'Umfang', description: 'Zusätzliches Ziel', cost: 10, purchased: false },
      { id: 'move-control1', name: 'Kontrolle', description: 'Objekte als Wurfgeschosse nutzen', cost: 15, purchased: false },
    ]
  },
  {
    id: 'sense',
    name: 'Sense',
    nameDE: 'Gespür',
    description: 'Use the Force to sense surroundings and emotions.',
    descriptionDE: 'Nutze die Macht, um die Umgebung und Emotionen wahrzunehmen.',
    baseEffect: 'Spend ◐ to sense all living things within short range.',
    forceRating: 1,
    upgrades: [
      { id: 'sense-control1', name: 'Kontrolle', description: 'Gedanken eines Ziels lesen', cost: 10, purchased: false },
      { id: 'sense-control2', name: 'Kontrolle', description: 'Angriffe vorhersehen (Verteidigung +1)', cost: 15, purchased: false },
      { id: 'sense-range1', name: 'Reichweite', description: 'Reichweite +1 Band', cost: 10, purchased: false },
      { id: 'sense-duration1', name: 'Dauer', description: 'Effekt hält bis Ende der Begegnung', cost: 15, purchased: false },
      { id: 'sense-str1', name: 'Stärke', description: 'Zusätzliches Ziel', cost: 10, purchased: false },
    ]
  },
  {
    id: 'influence',
    name: 'Influence',
    nameDE: 'Einfluss',
    description: 'Use the Force to guide or twist minds.',
    descriptionDE: 'Nutze die Macht, um Gedanken zu lenken oder zu verdrehen.',
    baseEffect: 'Spend ◐ to inflict 1 strain on one engaged target (opposed Discipline check).',
    forceRating: 1,
    upgrades: [
      { id: 'inf-control1', name: 'Kontrolle', description: 'Emotionen eines Ziels beeinflussen', cost: 10, purchased: false },
      { id: 'inf-control2', name: 'Kontrolle', description: 'Jedi-Gedankentrick — Vorschlag einpflanzen', cost: 15, purchased: false, requires: ['inf-control1'] },
      { id: 'inf-range1', name: 'Reichweite', description: 'Reichweite +1 Band', cost: 10, purchased: false },
      { id: 'inf-str1', name: 'Stärke', description: 'Zusätzlicher Stress', cost: 10, purchased: false },
      { id: 'inf-mag1', name: 'Umfang', description: 'Zusätzliches Ziel', cost: 15, purchased: false },
      { id: 'inf-duration1', name: 'Dauer', description: 'Effekt hält an', cost: 15, purchased: false },
    ]
  },
  {
    id: 'heal',
    name: 'Heal/Harm',
    nameDE: 'Heilen/Verletzen',
    description: 'Use the Force to heal wounds or inflict harm.',
    descriptionDE: 'Nutze die Macht, um Wunden zu heilen oder Schaden zuzufügen.',
    baseEffect: 'Spend ◐ to heal 1 wound on an engaged living target (Heal) or inflict 1 wound (Harm).',
    forceRating: 1,
    upgrades: [
      { id: 'heal-str1', name: 'Stärke', description: '+1 Wunde heilen/zufügen', cost: 10, purchased: false },
      { id: 'heal-str2', name: 'Stärke', description: '+1 Wunde heilen/zufügen', cost: 15, purchased: false, requires: ['heal-str1'] },
      { id: 'heal-control1', name: 'Kontrolle', description: 'Kritische Verletzungen heilen', cost: 20, purchased: false },
      { id: 'heal-range1', name: 'Reichweite', description: 'Reichweite +1 Band', cost: 10, purchased: false },
      { id: 'heal-mag1', name: 'Umfang', description: 'Zusätzliches Ziel', cost: 15, purchased: false },
    ]
  },
  {
    id: 'enhance',
    name: 'Enhance',
    nameDE: 'Stärken',
    description: 'Use the Force to enhance physical abilities.',
    descriptionDE: 'Nutze die Macht, um körperliche Fähigkeiten zu verbessern.',
    baseEffect: 'Spend ◐ to add +1 to one Athletics, Coordination, or Resilience check.',
    forceRating: 1,
    upgrades: [
      { id: 'enh-control1', name: 'Kontrolle', description: 'Force-Sprung (horizontal)', cost: 10, purchased: false },
      { id: 'enh-control2', name: 'Kontrolle', description: 'Force-Sprung (vertikal)', cost: 10, purchased: false },
      { id: 'enh-control3', name: 'Kontrolle', description: 'Stärke für Nahkampf-Schaden nutzen', cost: 15, purchased: false },
      { id: 'enh-str1', name: 'Stärke', description: 'Zusätzlicher Erfolg', cost: 10, purchased: false },
      { id: 'enh-range1', name: 'Reichweite', description: 'Reichweite +1 Band', cost: 10, purchased: false },
    ]
  },
  {
    id: 'foresee',
    name: 'Foresee',
    nameDE: 'Voraussehen',
    description: 'Use the Force to see glimpses of the future.',
    descriptionDE: 'Nutze die Macht, um Einblicke in die Zukunft zu erhalten.',
    baseEffect: 'Spend ◐ to gain vague hints about upcoming events in the next day.',
    forceRating: 1,
    upgrades: [
      { id: 'fore-control1', name: 'Kontrolle', description: 'Initiative-Slot tauschen', cost: 10, purchased: false },
      { id: 'fore-str1', name: 'Stärke', description: 'Klarere Visionen', cost: 10, purchased: false },
      { id: 'fore-range1', name: 'Reichweite', description: 'Weiter in die Zukunft sehen', cost: 15, purchased: false },
      { id: 'fore-duration1', name: 'Dauer', description: 'Vision hält länger an', cost: 10, purchased: false },
    ]
  },
  {
    id: 'protect',
    name: 'Protect/Unleash',
    nameDE: 'Beschützen/Entfesseln',
    description: 'Use the Force to create barriers or unleash destructive energy.',
    descriptionDE: 'Nutze die Macht, um Barrieren zu errichten oder zerstörerische Energie freizusetzen.',
    baseEffect: 'Protect: Reduce damage by Force Rating. Unleash: Deal damage with Force lightning or fire.',
    forceRating: 2,
    upgrades: [
      { id: 'prot-str1', name: 'Stärke', description: '+1 Schaden reduzieren/zufügen', cost: 10, purchased: false },
      { id: 'prot-range1', name: 'Reichweite', description: 'Reichweite +1 Band', cost: 10, purchased: false },
      { id: 'prot-mag1', name: 'Umfang', description: 'Zusätzliches Ziel', cost: 15, purchased: false },
      { id: 'prot-control1', name: 'Kontrolle', description: 'Machtblitz (Unleash)', cost: 20, purchased: false },
    ]
  },
  {
    id: 'bind',
    name: 'Bind',
    nameDE: 'Binden',
    description: 'Use the Force to restrain targets.',
    descriptionDE: 'Nutze die Macht, um Ziele festzuhalten.',
    baseEffect: 'Spend ◐◐ to immobilize one target within short range.',
    forceRating: 2,
    upgrades: [
      { id: 'bind-str1', name: 'Stärke', description: 'Ziel erleidet Schaden', cost: 15, purchased: false },
      { id: 'bind-range1', name: 'Reichweite', description: 'Reichweite +1 Band', cost: 10, purchased: false },
      { id: 'bind-duration1', name: 'Dauer', description: 'Effekt hält an', cost: 15, purchased: false },
      { id: 'bind-mag1', name: 'Umfang', description: 'Zusätzliches Ziel', cost: 15, purchased: false },
    ]
  },
  // === NEW POWERS (from SW Machtkräfte V4.pdf) ===
  {
    id: 'seek',
    name: 'Seek',
    nameDE: 'Suchen',
    description: 'Use the Force to locate people, objects, or information.',
    descriptionDE: 'Nutze die Macht, um Personen, Objekte oder Informationen zu finden.',
    baseEffect: 'Spend ◐ to gain insight into the general direction of a target.',
    forceRating: 1,
    upgrades: [
      { id: 'seek-str1', name: 'Stärke', description: 'Genauere Ortung', cost: 10, purchased: false },
      { id: 'seek-range1', name: 'Reichweite', description: 'Reichweite +1 Band', cost: 10, purchased: false },
      { id: 'seek-mag1', name: 'Umfang', description: 'Zusätzliches Ziel suchen', cost: 10, purchased: false },
      { id: 'seek-control1', name: 'Kontrolle', description: 'Schwachstellen des Ziels erkennen', cost: 15, purchased: false },
      { id: 'seek-mastery', name: 'Meisterschaft', description: 'Exakte Position + verborgene Gedanken', cost: 25, purchased: false, requires: ['seek-control1'] },
    ]
  },
  {
    id: 'misdirect',
    name: 'Misdirect',
    nameDE: 'Irreführung',
    description: 'Create illusions to confuse or hide.',
    descriptionDE: 'Erschaffe Illusionen, um zu verwirren oder zu verbergen.',
    baseEffect: 'Spend ◐ to make one target within short range unable to perceive you.',
    forceRating: 1,
    upgrades: [
      { id: 'mis-str1', name: 'Stärke', description: 'Illusion wirkt realer', cost: 10, purchased: false },
      { id: 'mis-range1', name: 'Reichweite', description: 'Reichweite +1 Band', cost: 10, purchased: false },
      { id: 'mis-mag1', name: 'Umfang', description: 'Zusätzliche Ziele', cost: 10, purchased: false },
      { id: 'mis-duration1', name: 'Dauer', description: 'Effekt hält eine Runde an', cost: 15, purchased: false },
      { id: 'mis-control1', name: 'Kontrolle', description: 'Illusionen mit Ton und Bewegung', cost: 15, purchased: false },
      { id: 'mis-mastery', name: 'Meisterschaft', description: 'Komplexe Illusionen, ganze Szenen', cost: 25, purchased: false, requires: ['mis-control1'] },
    ]
  },
  {
    id: 'suppress',
    name: 'Suppress',
    nameDE: 'Unterdrücken',
    description: 'Counter or suppress another Force user\'s powers.',
    descriptionDE: 'Unterdrücke die Machtkräfte eines anderen Machtnutzers.',
    baseEffect: 'Spend ◐◐ to add ◆◆ to a target\'s next Force power check.',
    forceRating: 2,
    upgrades: [
      { id: 'sup-str1', name: 'Stärke', description: 'Ziel verliert 1 Kraftpunkt', cost: 15, purchased: false },
      { id: 'sup-range1', name: 'Reichweite', description: 'Reichweite +1 Band', cost: 10, purchased: false },
      { id: 'sup-duration1', name: 'Dauer', description: 'Unterdrückung hält an', cost: 15, purchased: false },
      { id: 'sup-mastery', name: 'Meisterschaft', description: 'Machtkraft des Ziels komplett blockieren', cost: 25, purchased: false, requires: ['sup-str1'] },
    ]
  },
  {
    id: 'battle-meditation',
    name: 'Battle Meditation',
    nameDE: 'Kampfmeditation',
    description: 'Coordinate allies through the Force in combat.',
    descriptionDE: 'Koordiniere Verbündete durch die Macht im Kampf.',
    baseEffect: 'Spend ◐◐ to add ◻ to all allies\' next combat checks within short range.',
    forceRating: 2,
    upgrades: [
      { id: 'bm-str1', name: 'Stärke', description: 'Verbündete erhalten +1 Verteidigung', cost: 15, purchased: false },
      { id: 'bm-range1', name: 'Reichweite', description: 'Reichweite +1 Band', cost: 10, purchased: false },
      { id: 'bm-mag1', name: 'Umfang', description: 'Alle Verbündeten in Reichweite', cost: 15, purchased: false },
      { id: 'bm-duration1', name: 'Dauer', description: 'Effekt hält ganze Begegnung', cost: 20, purchased: false },
      { id: 'bm-control1', name: 'Kontrolle', description: 'Feinde in Reichweite erhalten Komplikation', cost: 20, purchased: false },
      { id: 'bm-mastery', name: 'Meisterschaft', description: 'Aufwertung aller Verbündeten-Proben', cost: 30, purchased: false, requires: ['bm-control1'] },
    ]
  },
  {
    id: 'conjure',
    name: 'Conjure',
    nameDE: 'Beschwören',
    description: 'Create illusory Force weapons or objects.',
    descriptionDE: 'Erschaffe illusionäre Machtwaffen oder Objekte.',
    baseEffect: 'Spend ◐ to create an illusory melee weapon (DMG 5, Crit 3).',
    forceRating: 1,
    upgrades: [
      { id: 'con-str1', name: 'Stärke', description: 'Schaden +2', cost: 10, purchased: false },
      { id: 'con-str2', name: 'Stärke', description: 'Schaden +2', cost: 15, purchased: false, requires: ['con-str1'] },
      { id: 'con-control1', name: 'Kontrolle', description: 'Fernkampfwaffe statt Nahkampf', cost: 15, purchased: false },
      { id: 'con-duration1', name: 'Dauer', description: 'Waffe bleibt für Begegnung', cost: 15, purchased: false },
    ]
  },
  {
    id: 'imbue',
    name: 'Imbue',
    nameDE: 'Durchdringen',
    description: 'Enhance an ally\'s abilities through the Force.',
    descriptionDE: 'Verstärke die Fähigkeiten eines Verbündeten durch die Macht.',
    baseEffect: 'Spend ◐ to grant +1 to one characteristic of a target within short range for 1 round.',
    forceRating: 1,
    upgrades: [
      { id: 'imb-str1', name: 'Stärke', description: '+1 zusätzliche Eigenschaft', cost: 15, purchased: false },
      { id: 'imb-range1', name: 'Reichweite', description: 'Reichweite +1 Band', cost: 10, purchased: false },
      { id: 'imb-duration1', name: 'Dauer', description: 'Effekt hält Begegnung', cost: 20, purchased: false },
      { id: 'imb-control1', name: 'Kontrolle', description: 'Auf sich selbst anwenden', cost: 10, purchased: false },
    ]
  },
  {
    id: 'endure',
    name: 'Endure',
    nameDE: 'Ertragen',
    description: 'Use the Force to ignore pain and injury.',
    descriptionDE: 'Nutze die Macht, um Schmerz und Verletzungen zu ignorieren.',
    baseEffect: 'Spend ◐ to ignore effects of one Critical Injury for the encounter.',
    forceRating: 1,
    upgrades: [
      { id: 'end-str1', name: 'Stärke', description: 'Ignoriere zusätzliche Critical Injury', cost: 15, purchased: false },
      { id: 'end-control1', name: 'Kontrolle', description: 'Heile 2 Wunden beim Aktivieren', cost: 15, purchased: false },
      { id: 'end-duration1', name: 'Dauer', description: 'Effekt hält bis geheilt', cost: 20, purchased: false },
      { id: 'end-mastery', name: 'Meisterschaft', description: 'Ignoriere ALLE aktiven Critical Injuries', cost: 30, purchased: false, requires: ['end-str1'] },
    ]
  },
  {
    id: 'ebb-flow',
    name: 'Ebb/Flow',
    nameDE: 'Ebbe/Flut',
    description: 'Manipulate the flow of the Force.',
    descriptionDE: 'Manipuliere den Fluss der Macht.',
    baseEffect: 'Spend ◐ to recover 1 strain, or inflict 1 strain on target within short range.',
    forceRating: 1,
    upgrades: [
      { id: 'ef-str1', name: 'Stärke', description: '+1 Erschöpfung heilen/verursachen', cost: 10, purchased: false },
      { id: 'ef-range1', name: 'Reichweite', description: 'Reichweite +1 Band', cost: 10, purchased: false },
      { id: 'ef-control1', name: 'Kontrolle', description: 'Erfolge zu Erschöpfungsabbau', cost: 15, purchased: false },
      { id: 'ef-control2', name: 'Kontrolle', description: 'Vorteile zu Macht-Punkt-Regeneration', cost: 15, purchased: false },
    ]
  },
  {
    id: 'farsight',
    name: 'Farsight',
    nameDE: 'Fernsicht',
    description: 'See beyond normal vision.',
    descriptionDE: 'Sieh über das normale Sichtfeld hinaus.',
    baseEffect: 'Spend ◐ to see to medium range, ignoring obstacles.',
    forceRating: 1,
    upgrades: [
      { id: 'far-str1', name: 'Stärke', description: 'Detailreiche Wahrnehmung', cost: 10, purchased: false },
      { id: 'far-range1', name: 'Reichweite', description: 'Reichweite +1 Band', cost: 10, purchased: false },
      { id: 'far-range2', name: 'Reichweite', description: 'Reichweite +1 Band', cost: 15, purchased: false, requires: ['far-range1'] },
      { id: 'far-control1', name: 'Kontrolle', description: 'In die Vergangenheit eines Ortes blicken', cost: 20, purchased: false },
      { id: 'far-mastery', name: 'Meisterschaft', description: 'Durch Wände und über Planeten hinweg sehen', cost: 25, purchased: false, requires: ['far-range2'] },
    ]
  },
  {
    id: 'manipulate',
    name: 'Manipulate',
    nameDE: 'Manipulieren',
    description: 'Repair or modify machines through the Force.',
    descriptionDE: 'Repariere oder modifiziere Maschinen durch die Macht.',
    baseEffect: 'Spend ◐ to perform a Mechanik check using Force instead of tools.',
    forceRating: 1,
    upgrades: [
      { id: 'man-str1', name: 'Stärke', description: 'Reparatur +1 Wunde an Maschine', cost: 10, purchased: false },
      { id: 'man-range1', name: 'Reichweite', description: 'Reichweite +1 Band', cost: 10, purchased: false },
      { id: 'man-control1', name: 'Kontrolle', description: 'Maschinen sabotieren statt reparieren', cost: 15, purchased: false },
      { id: 'man-control2', name: 'Kontrolle', description: 'Droiden mit der Macht steuern', cost: 20, purchased: false },
      { id: 'man-mastery', name: 'Meisterschaft', description: 'Komplexe Fahrzeuge auf Entfernung steuern', cost: 30, purchased: false, requires: ['man-control2'] },
    ]
  },
];

// Check if a career grants Force sensitivity
export function isForceCareer(career: any): boolean {
  if (!career) return false;
  return (career.forceRating || 0) > 0;
}

// Get available Force powers based on Force rating
export function getAvailablePowers(forceRating: number): ForcePower[] {
  return FORCE_POWERS.filter(p => p.forceRating <= forceRating);
}

// Calculate Force Rating from career + talents
export function calculateForceRating(career: any, talents: string[]): number {
  let rating = career?.forceRating || 0;
  // Force Rating talents (common in Force-sensitive specializations)
  const forceRatingTalents = ['Force Rating', 'Machtbewertung', 'Macht-Rang'];
  for (const t of talents) {
    if (forceRatingTalents.some(frt => t.toLowerCase().includes(frt.toLowerCase()))) {
      rating += 1;
    }
  }
  return rating;
}
