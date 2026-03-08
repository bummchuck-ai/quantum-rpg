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
