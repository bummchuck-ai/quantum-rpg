/**
 * Maps career.json specialization names → talents_connected.json specialization names.
 * Many specializations have German translations in careers.json but different names in
 * the talent tree data. This mapping bridges the gap.
 */
const SPEC_ALIASES: Record<string, string> = {
  'aufwiegler': 'agitator',
  'assassine': 'attentäter',
  'mediziner': 'arzt',
  'geschützmeister': 'bordschütze',
  'cybertech': 'cyber tech',
  'droidentechniker': 'droid tech',
  'droidenspezialist': 'droid tech',
  'illegaler techie': 'outlaw-techniker',
  'sprengexperte': 'sprengmeister',
  'sternenjägerass': 'staffelführer',
  'jäger': 'großwildjäger',
  'grenzwanderer': 'grenzgänger',
  // reverse mappings for safety
  'agitator': 'aufwiegler',
  'attentäter': 'assassine',
  'arzt': 'mediziner',
  'bordschütze': 'geschützmeister',
  'cyber tech': 'cybertech',
  'droid tech': 'droidentechniker',
  'outlaw-techniker': 'illegaler techie',
  'sprengmeister': 'sprengexperte',
  'staffelführer': 'sternenjägerass',
  'großwildjäger': 'jäger',
  'grenzgänger': 'grenzwanderer',
};

/**
 * Finds a talent tree matching the given specialization name.
 * Tries: exact match → alias match → startsWith match.
 */
export function findTalentTree<T extends { specialization: string }>(
  trees: T[],
  specName: string
): T | undefined {
  const name = specName.toLowerCase();

  // 1. Exact match
  const exact = trees.find(t => t.specialization.toLowerCase() === name);
  if (exact) return exact;

  // 2. Alias match
  const alias = SPEC_ALIASES[name];
  if (alias) {
    const aliasMatch = trees.find(t => t.specialization.toLowerCase() === alias);
    if (aliasMatch) return aliasMatch;
  }

  // 3. Fuzzy startsWith match
  return trees.find(t => {
    const tSpec = t.specialization.toLowerCase();
    return tSpec.startsWith(name) || name.startsWith(tSpec);
  });
}
