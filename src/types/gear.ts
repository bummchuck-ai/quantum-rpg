
export interface GearProperty {
  name: string;
  value?: string | number; // z.B. "Schaden" oder "Verteidigung"
}

export interface Gear {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'misc';
  price: number; // Kaufpreis
  sellPrice: number; // Verkaufspreis
  weight?: number; // Optionales Gewicht
  properties?: GearProperty[]; // Zusätzliche Eigenschaften
  image_url?: string; // Optional: Bild-URL (später für Waffenbilder)
  // Weapon fields
  damage?: number;
  critical?: number;
  skill?: string;
  range?: string;
  special?: string;
  addsBrawn?: boolean;
  // Armor fields
  soak?: number;
  defense?: number;
  // Shared fields
  encumbrance?: number;
  hardPoints?: number;
  rarity?: number;
  note?: string;
}
