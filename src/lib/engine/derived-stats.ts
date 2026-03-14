import type { Gear } from '@/types/gear';

export interface DerivedStatsResult {
  woundThreshold: number;
  strainThreshold: number;
  soak: number;
  defense: number;
}

/**
 * Single source of truth for wound threshold, strain threshold, soak, and defense.
 * Used by ChatInterface (play) and CharacterSummary (create).
 */
export function calculateDerivedStats(
  species: { woundThresholdBase: number; strainThresholdBase: number } | null | undefined,
  characteristics: { brawn: number; willpower: number },
  inventory: Gear[]
): DerivedStatsResult {
  const armorItems = inventory.filter((g) => g.soak !== undefined);

  return {
    woundThreshold: (species?.woundThresholdBase ?? 10) + characteristics.brawn,
    strainThreshold: (species?.strainThresholdBase ?? 10) + characteristics.willpower,
    soak:
      characteristics.brawn +
      armorItems.reduce((acc, curr) => acc + (curr.soak || 0), 0),
    defense: armorItems.reduce(
      (acc, curr) => Math.max(acc, curr.defense || 0),
      0
    ),
  };
}
