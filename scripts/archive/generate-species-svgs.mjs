#!/usr/bin/env node
/**
 * Generate unique SVG species portraits based on their characteristics.
 * Each species gets a visually distinct abstract portrait.
 * Run: node scripts/generate-species-svgs.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'species');
const SPECIES_JSON = path.join(ROOT, 'data', 'json', 'species_raw.json');

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o').replace(/[úùüû]/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Deterministic hash from string
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// HSL color from hash
function hslFromHash(h, satRange = [40, 80], lightRange = [30, 60]) {
  const hue = h % 360;
  const sat = satRange[0] + (h % (satRange[1] - satRange[0]));
  const light = lightRange[0] + ((h >> 4) % (lightRange[1] - lightRange[0]));
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

function generateSVG(species) {
  const { name, characteristics } = species;
  const { brawn, agility, intellect, cunning, willpower, presence } = characteristics;
  const h = hash(name);
  const h2 = hash(name + 'x');
  const h3 = hash(name + 'y');

  // Primary and secondary colors derived from name
  const primary = hslFromHash(h, [50, 90], [35, 55]);
  const secondary = hslFromHash(h2, [30, 70], [20, 40]);
  const accent = hslFromHash(h3, [60, 100], [50, 70]);
  const bgDark = hslFromHash(h + 180, [10, 30], [5, 12]);

  // Eye style based on stats
  const eyeSize = 3 + Math.round(intellect * 1.5);
  const eyeSpacing = 8 + Math.round(cunning * 2);
  const eyeY = 38 - Math.round(willpower);

  // Head shape based on brawn/agility
  const headWidth = 28 + brawn * 4;
  const headHeight = 32 + intellect * 3;
  const headY = 20 - Math.round(intellect);

  // Decorative elements count based on presence
  const numDecorations = 2 + presence;

  // Generate decorative elements (horns, tendrils, markings)
  let decorations = '';

  // Type of species visual (organic vs mechanical)
  const isDroid = name.toLowerCase().includes('droide') || name.toLowerCase().includes('droid');
  const isInsectoid = brawn <= 2 && agility >= 3;
  const isReptilian = brawn >= 3 && cunning >= 3;
  const isFurry = willpower >= 3 && presence <= 2;
  const isAquatic = name.toLowerCase().includes('mon cal') || name.toLowerCase().includes('nautol') || name.toLowerCase().includes('quarren');

  if (isDroid) {
    // Mechanical look
    decorations += `
      <rect x="${50 - headWidth/2 + 2}" y="${headY + 2}" width="${headWidth - 4}" height="${headHeight - 4}" rx="4" fill="none" stroke="${accent}" stroke-width="0.5" opacity="0.6"/>
      <line x1="${50 - headWidth/4}" y1="${headY + headHeight - 5}" x2="${50 + headWidth/4}" y2="${headY + headHeight - 5}" stroke="${accent}" stroke-width="1" opacity="0.8"/>
      <circle cx="50" cy="${eyeY}" r="${eyeSize + 2}" fill="none" stroke="${accent}" stroke-width="0.8"/>
      <rect x="35" y="${headY - 3}" width="30" height="3" rx="1" fill="${secondary}" opacity="0.5"/>
    `;
  } else {
    // Organic features
    // Head-tails / horns based on agility + presence
    if (agility >= 3 || name.includes('Twi') || name.includes('Togruta') || name.includes('Nautol')) {
      const numTails = Math.min(agility, 4);
      for (let i = 0; i < numTails; i++) {
        const angle = -40 + (80 / (numTails + 1)) * (i + 1);
        const len = 20 + presence * 3;
        const startX = 50 + Math.sin(angle * Math.PI / 180) * headWidth / 2.2;
        const startY = headY + headHeight * 0.7;
        const endX = startX + Math.sin(angle * Math.PI / 180) * len;
        const endY = startY + len * 0.8;
        const ctrlX = (startX + endX) / 2 + (h % 10 - 5);
        const ctrlY = (startY + endY) / 2 + 5;
        decorations += `<path d="M${startX},${startY} Q${ctrlX},${ctrlY} ${endX},${endY}" fill="none" stroke="${primary}" stroke-width="3" stroke-linecap="round" opacity="0.7"/>`;
      }
    }

    // Horns for high brawn
    if (brawn >= 3 || name.includes('Zabrak') || name.includes('Chevin')) {
      const numHorns = Math.min(brawn - 1, 5);
      for (let i = 0; i < numHorns; i++) {
        const x = 50 + (i - numHorns / 2) * 6;
        const hornH = 5 + (h % 8);
        decorations += `<polygon points="${x},${headY} ${x - 2},${headY - hornH} ${x + 2},${headY - hornH}" fill="${primary}" opacity="0.8"/>`;
      }
    }

    // Facial markings for cunning species
    if (cunning >= 3 || name.includes('Miri') || name.includes('Zabrak') || name.includes('Dathom')) {
      for (let i = 0; i < cunning; i++) {
        const mx = 50 + ((h >> (i * 3)) % 20 - 10);
        const my = eyeY + ((h >> (i * 2 + 1)) % 15 - 3);
        const mw = 2 + (h >> (i + 5)) % 4;
        decorations += `<rect x="${mx}" y="${my}" width="${mw}" height="1" rx="0.5" fill="${accent}" opacity="0.6"/>`;
      }
    }

    // Fur texture for furry species
    if (isFurry || name.includes('Wookie') || name.includes('Ewok') || name.includes('Bothan')) {
      for (let i = 0; i < 12; i++) {
        const fx = 50 + ((h >> i) % 30 - 15);
        const fy = headY + ((h >> (i + 2)) % headHeight);
        const fl = 3 + (h >> (i + 4)) % 4;
        decorations += `<line x1="${fx}" y1="${fy}" x2="${fx + (h >> i & 1 ? 1 : -1)}" y2="${fy + fl}" stroke="${primary}" stroke-width="0.5" opacity="0.3"/>`;
      }
    }
  }

  // Generate background pattern
  let bgPattern = '';
  const patternType = h % 4;
  if (patternType === 0) {
    // Hex grid
    for (let i = 0; i < 6; i++) {
      const px = (h >> i) % 100;
      const py = (h >> (i + 3)) % 100;
      bgPattern += `<polygon points="${px},${py - 4} ${px + 3.5},${py - 2} ${px + 3.5},${py + 2} ${px},${py + 4} ${px - 3.5},${py + 2} ${px - 3.5},${py - 2}" fill="none" stroke="${primary}" stroke-width="0.3" opacity="0.1"/>`;
    }
  } else if (patternType === 1) {
    // Circles
    for (let i = 0; i < 4; i++) {
      const cx = (h >> (i * 2)) % 100;
      const cy = (h >> (i * 2 + 1)) % 100;
      bgPattern += `<circle cx="${cx}" cy="${cy}" r="${8 + i * 5}" fill="none" stroke="${primary}" stroke-width="0.2" opacity="0.08"/>`;
    }
  } else if (patternType === 2) {
    // Diagonal lines
    for (let i = 0; i < 8; i++) {
      bgPattern += `<line x1="${i * 15 - 10}" y1="0" x2="${i * 15 + 10}" y2="100" stroke="${primary}" stroke-width="0.2" opacity="0.06"/>`;
    }
  } else {
    // Stars / dots
    for (let i = 0; i < 10; i++) {
      const sx = (h >> i) % 100;
      const sy = (h >> (i + 5)) % 100;
      bgPattern += `<circle cx="${sx}" cy="${sy}" r="0.5" fill="${accent}" opacity="0.15"/>`;
    }
  }

  // Stat bar at bottom
  const stats = [
    { label: 'BR', val: brawn, color: '#ef4444' },
    { label: 'AG', val: agility, color: '#22c55e' },
    { label: 'IN', val: intellect, color: '#3b82f6' },
    { label: 'CU', val: cunning, color: '#f59e0b' },
    { label: 'WL', val: willpower, color: '#a855f7' },
    { label: 'PR', val: presence, color: '#ec4899' },
  ];
  let statBars = '';
  stats.forEach((s, i) => {
    const barX = 8 + i * 14.5;
    const barH = s.val * 3;
    statBars += `<rect x="${barX}" y="${92 - barH}" width="8" height="${barH}" rx="1" fill="${s.color}" opacity="0.25"/>`;
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
  <defs>
    <radialGradient id="bg-${slugify(name)}" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${secondary}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${bgDark}" stop-opacity="1"/>
    </radialGradient>
    <radialGradient id="glow-${slugify(name)}" cx="50%" cy="40%" r="30%">
      <stop offset="0%" stop-color="${primary}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${primary}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="100" height="100" fill="${bgDark}"/>
  <rect width="100" height="100" fill="url(#bg-${slugify(name)})"/>
  ${bgPattern}

  <!-- Ambient glow -->
  <ellipse cx="50" cy="42" rx="35" ry="30" fill="url(#glow-${slugify(name)})"/>

  <!-- Head / Body silhouette -->
  <ellipse cx="50" cy="${headY + headHeight/2}" rx="${headWidth/2}" ry="${headHeight/2}" fill="${secondary}" opacity="0.9"/>
  <ellipse cx="50" cy="${headY + headHeight/2}" rx="${headWidth/2 - 1}" ry="${headHeight/2 - 1}" fill="${bgDark}" opacity="0.3"/>

  <!-- Shoulders -->
  <ellipse cx="50" cy="${headY + headHeight + 8}" rx="${headWidth/2 + 8}" ry="12" fill="${secondary}" opacity="0.7"/>

  <!-- Decorations (horns, tails, markings) -->
  ${decorations}

  <!-- Eyes -->
  <ellipse cx="${50 - eyeSpacing/2}" cy="${eyeY}" rx="${eyeSize}" ry="${eyeSize * 0.7}" fill="${isDroid ? accent : '#111'}"/>
  <ellipse cx="${50 + eyeSpacing/2}" cy="${eyeY}" rx="${eyeSize}" ry="${eyeSize * 0.7}" fill="${isDroid ? accent : '#111'}"/>
  ${!isDroid ? `
  <ellipse cx="${50 - eyeSpacing/2}" cy="${eyeY}" rx="${eyeSize * 0.5}" ry="${eyeSize * 0.4}" fill="${accent}" opacity="0.9"/>
  <ellipse cx="${50 + eyeSpacing/2}" cy="${eyeY}" rx="${eyeSize * 0.5}" ry="${eyeSize * 0.4}" fill="${accent}" opacity="0.9"/>
  <circle cx="${50 - eyeSpacing/2 + 1}" cy="${eyeY - 0.5}" r="${eyeSize * 0.15}" fill="white" opacity="0.8"/>
  <circle cx="${50 + eyeSpacing/2 + 1}" cy="${eyeY - 0.5}" r="${eyeSize * 0.15}" fill="white" opacity="0.8"/>
  ` : `
  <circle cx="${50 - eyeSpacing/2}" cy="${eyeY}" r="${eyeSize * 0.3}" fill="white" opacity="0.9"/>
  <circle cx="${50 + eyeSpacing/2}" cy="${eyeY}" r="${eyeSize * 0.3}" fill="white" opacity="0.9"/>
  `}

  <!-- Stat bars -->
  ${statBars}

  <!-- Vignette -->
  <rect width="100" height="100" fill="url(#bg-${slugify(name)})" opacity="0.3"/>
</svg>`;

  return svg;
}

function main() {
  const speciesRaw = JSON.parse(fs.readFileSync(SPECIES_JSON, 'utf-8'));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Generating SVG portraits for ${speciesRaw.length} species...`);

  for (const species of speciesRaw) {
    const slug = slugify(species.name);
    const svg = generateSVG(species);
    const destPath = path.join(OUT_DIR, `${slug}.svg`);
    fs.writeFileSync(destPath, svg);
    console.log(`  ✓ ${species.name} → ${slug}.svg`);
  }

  console.log(`\nDone! ${speciesRaw.length} SVG portraits generated in public/species/`);
}

main();
