#!/usr/bin/env node
/**
 * Generate AI species portrait images using Pollinations.ai (free, no API key).
 * Downloads to public/species/{slug}.webp
 *
 * Usage: node scripts/generate-species-images.mjs
 * Options: --only "Mensch,Twi'lek"  (generate only specific species)
 *          --skip-existing           (don't re-download existing images)
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'species');
const SPECIES_JSON = path.join(ROOT, 'data', 'json', 'species_raw.json');

// Slug helper: "Twi'lek" -> "twi-lek", "Mensch - Corellia" -> "mensch-corellia"
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o').replace(/[úùüû]/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Star Wars lore descriptions for better prompts
const LORE_HINTS = {
  'Mensch': 'human, diverse skin tones',
  'Mensch - Corellia': 'human from Corellia, rugged spacefarer look',
  'Mensch - Mandalore': 'human Mandalorian, warrior culture',
  'Droide': 'humanoid droid, metallic body, glowing photoreceptor eyes',
  'Twi ́lek': 'Twi\'lek alien, two long head-tails (lekku), colorful skin',
  'Togruta': 'Togruta alien like Ahsoka Tano, head-tails and montrals, facial markings',
  'Wookie': 'Wookiee, tall furry alien like Chewbacca, brown fur',
  'Zabrak': 'Zabrak alien like Darth Maul, horned head, facial tattoos',
  'Chiss': 'Chiss alien like Thrawn, blue skin, glowing red eyes, black hair',
  'Mon Calamari': 'Mon Calamari alien like Admiral Ackbar, fish-like head, large eyes',
  'Rodianer': 'Rodian alien like Greedo, green skin, large multifaceted eyes, snout',
  'Trandoshaner': 'Trandoshan alien like Bossk, reptilian, scaly skin, predatory',
  'Nautolaner': 'Nautolan alien like Kit Fisto, green skin, tentacle head-tails',
  'Kel Dor': 'Kel Dor alien like Plo Koon, breathing mask, dark goggles',
  'Duros': 'Duros alien, blue-green skin, large red eyes, no nose, smooth head',
  'Bothaner': 'Bothan alien, furred face, canine features',
  'Cereaner': 'Cerean alien like Ki-Adi-Mundi, tall elongated head',
  'Ithorianer': 'Ithorian alien, hammerhead shape, gentle herbivore',
  'Jawa': 'Jawa, small hooded figure, glowing yellow eyes, brown robes',
  'Ewok': 'Ewok, small furry bear-like creature from Endor',
  'Gungan': 'Gungan alien like Jar Jar Binks, long floppy ears, amphibian',
  'Geonosianer': 'Geonosian alien, insectoid, wings, elongated face',
  'Kaminoaner': 'Kaminoan alien, very tall, slender, pale skin, long neck',
  'Hutte': 'Hutt alien like Jabba, large slug-like body, no legs',
  'Tuskenräuber': 'Tusken Raider, wrapped in cloth, face mask, desert warrior',
  'Bith': 'Bith alien, large cranium, large black eyes, pale skin',
  'Gran': 'Gran alien, three eye stalks, goat-like snout',
  'Nikto': 'Nikto alien, reptilian, facial horns and ridges',
  'Quarren': 'Quarren alien, squid-like face, tentacles around mouth',
  'Arcona': 'Arcona alien, reptilian, flat anvil-shaped head, marble eyes',
  'Gand': 'Gand alien, insectoid, chitin exoskeleton, breathing apparatus',
  'Dug': 'Dug alien like Sebulba, walks on arms, uses legs as hands',
  'Sulllustaner': 'Sullustan alien like Nien Nunb, large ears, jowly cheeks',
  'Aleena': 'Aleena alien, very small, blue-grey skin, oversized head',
  'Lasat': 'Lasat alien like Zeb from Rebels, large muscular, purple fur',
  'Mirilaner': 'Mirialan alien like Luminara Unduli, green-yellow skin, geometric facial tattoos',
  'Pantoraner': 'Pantoran alien, blue skin, yellow facial markings, humanoid',
  'Dathomirianer': 'Dathomirian, pale skin, may have Zabrak horns, Nightsister culture',
  'Faleen': 'Falleen alien, green-toned skin, reptilian, humanoid, pheromone control',
  'Klon': 'Clone trooper, human clone soldier, like Jango Fett',
};

function getPrompt(speciesName) {
  const lore = LORE_HINTS[speciesName] || `${speciesName} alien species from Star Wars universe`;
  return `Star Wars ${lore}, cinematic portrait, dramatic lighting, dark moody background, concept art style, high detail, science fiction, 4k`;
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const request = (currentUrl, redirects = 0) => {
      if (redirects > 5) return reject(new Error('Too many redirects'));

      https.get(currentUrl, { timeout: 60000 }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return request(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const file = fs.createWriteStream(destPath);
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
        file.on('error', reject);
      }).on('error', reject).on('timeout', function() { this.destroy(); reject(new Error('Timeout')); });
    };
    request(url);
  });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const args = process.argv.slice(2);
  const skipExisting = args.includes('--skip-existing');
  const onlyIdx = args.indexOf('--only');
  const onlyList = onlyIdx >= 0 ? args[onlyIdx + 1]?.split(',').map(s => s.trim()) : null;

  const speciesRaw = JSON.parse(fs.readFileSync(SPECIES_JSON, 'utf-8'));
  let speciesList = speciesRaw.map(s => s.name);

  if (onlyList) {
    speciesList = speciesList.filter(name => onlyList.some(o => name.toLowerCase().includes(o.toLowerCase())));
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Generating images for ${speciesList.length} species...`);
  let success = 0, failed = 0, skipped = 0;

  for (const name of speciesList) {
    const slug = slugify(name);
    const destPath = path.join(OUT_DIR, `${slug}.webp`);

    if (skipExisting && fs.existsSync(destPath)) {
      console.log(`  SKIP ${name} (${slug}.webp exists)`);
      skipped++;
      continue;
    }

    const prompt = getPrompt(name);
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&seed=${slug.length * 42}&nologo=true&model=flux`;

    console.log(`  [${success + failed + skipped + 1}/${speciesList.length}] ${name} → ${slug}.webp`);

    try {
      await downloadImage(url, destPath);
      success++;
      // Rate limit: wait between requests
      await sleep(2000);
    } catch (err) {
      console.error(`    FAILED: ${err.message}`);
      failed++;
      // Remove partial file
      try { fs.unlinkSync(destPath); } catch {}
      await sleep(1000);
    }
  }

  console.log(`\nDone! ${success} generated, ${skipped} skipped, ${failed} failed.`);
}

main().catch(console.error);
