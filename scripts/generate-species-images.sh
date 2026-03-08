#!/bin/bash
# Generate AI species portrait images using Pollinations.ai (free, no API key).
# Downloads to public/species/{slug}.jpg
# Usage: bash scripts/generate-species-images.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
OUT_DIR="$ROOT/public/species"
SPECIES_JSON="$ROOT/data/json/species_raw.json"

mkdir -p "$OUT_DIR"

slugify() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | \
    sed 's/[áàäâ]/a/g; s/[éèëê]/e/g; s/[íìïî]/i/g; s/[óòöô]/o/g; s/[úùüû]/u/g' | \
    sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g; s/^-//; s/-$//'
}

# Extract species names from JSON
SPECIES_NAMES=$(node -e "
  const data = require('$SPECIES_JSON');
  data.forEach(s => console.log(s.name));
")

# Lore hints for better prompts
declare -A LORE
LORE["Mensch"]="human, diverse skin tones, determined look"
LORE["Mensch - Corellia"]="human from Corellia, rugged spacefarer, Han Solo vibe"
LORE["Mensch - Mandalore"]="Mandalorian warrior, T-visor helmet, beskar armor"
LORE["Droide"]="humanoid protocol droid, metallic gold body, glowing photoreceptor eyes, like C-3PO"
LORE["Twi ́lek"]="Twi'lek alien, two long head-tails lekku, colorful skin blue or green"
LORE["Togruta"]="Togruta alien like Ahsoka Tano, white and blue head-tails montrals, orange skin, facial markings"
LORE["Wookie"]="Wookiee tall furry alien like Chewbacca, brown fur, bowcaster"
LORE["Zabrak"]="Zabrak alien like Darth Maul, crown of horns, red and black facial tattoos"
LORE["Chiss"]="Chiss alien like Grand Admiral Thrawn, blue skin, glowing red eyes, black hair, imperial uniform"
LORE["Mon Calamari"]="Mon Calamari alien like Admiral Ackbar, salmon fish-like head, large bulbous eyes"
LORE["Rodianer"]="Rodian alien like Greedo, green skin, large compound eyes, snout, antennae"
LORE["Trandoshaner"]="Trandoshan reptilian alien like Bossk, scaly orange skin, predatory eyes, claws"
LORE["Nautolaner"]="Nautolan alien like Kit Fisto, green skin, many head tentacles, large dark eyes, amphibian"
LORE["Kel Dor"]="Kel Dor alien like Plo Koon, antiox breathing mask, dark tinted goggles, orange skin"
LORE["Duros"]="Duros alien, blue-green smooth skin, large solid red eyes, no nose no hair"
LORE["Bothaner"]="Bothan spy alien, furred canine face, sharp eyes, intelligence operative"
LORE["Cereaner"]="Cerean alien like Ki-Adi-Mundi, very tall elongated conical cranium, wise expression"
LORE["Ithorianer"]="Ithorian alien, hammerhead shape with curved neck, gentle herbivore, brown skin"
LORE["Jawa"]="Jawa, very small hooded figure in brown robes, only glowing yellow eyes visible, desert scavenger"
LORE["Ewok"]="Ewok, small furry teddy bear creature from Endor, primitive hood and spear"
LORE["Gungan"]="Gungan alien like Jar Jar Binks, long floppy ears, bill-like mouth, amphibian, tall"
LORE["Geonosianer"]="Geonosian insectoid alien, wings, elongated insect face, hive worker"
LORE["Kaminoaner"]="Kaminoan alien, extremely tall slender, pale white skin, very long elegant neck, large almond eyes"
LORE["Hutte"]="Hutt alien like Jabba, massive slug-like body, small arms, no legs, crime lord"
LORE["Tuskenräuber"]="Tusken Raider Sand People, fully wrapped in desert cloth, mask with eye filters, gaffi stick"
LORE["Bith"]="Bith alien, very large pale cranium, large black lidless eyes, small mouth, musician"
LORE["Gran"]="Gran alien, three eye stalks on top of head, goat-like snout, tan skin"
LORE["Nikto"]="Nikto alien, reptilian, facial horns and ridges, tough enforcer look"
LORE["Quarren"]="Quarren alien, squid-like face with facial tentacles around mouth, deep sea dweller"
LORE["Gand"]="Gand alien, insectoid exoskeleton, compound eyes, breathing apparatus, findsman"
LORE["Dug"]="Dug alien like Sebulba, walks on hands, uses feet as arms, aggressive racer"
LORE["Sullustaner"]="Sullustan alien like Nien Nunb, large round ears, jowly cheeks, large dark eyes"
LORE["Ewok"]="Ewok, small furry bear-like creature, primitive tribal clothing, forest moon"
LORE["Lasat"]="Lasat alien like Zeb Orrelios from Rebels, large muscular, purple-grey fur, green eyes"
LORE["Mirilaner"]="Mirialan alien like Luminara Unduli, yellow-green skin, geometric black facial tattoos"
LORE["Pantoraner"]="Pantoran alien like Chairman Papanoida, blue skin, gold facial markings, humanoid, elegant"
LORE["Dathomirianer"]="Dathomirian Nightsister, pale grey skin, dark side markings, witch-like, may have Zabrak horns"
LORE["Faleen"]="Falleen alien like Prince Xizor, green-toned reptilian humanoid, regal bearing, pheromone control"
LORE["Klon"]="Clone trooper, human male face of Jango Fett, phase 2 clone armor, military bearing"
LORE["Arcona"]="Arcona alien, flat anvil-shaped head, clear marble-like eyes, reptilian"
LORE["Aqualishaner"]="Aqualish alien like Ponda Baba, walrus-like face, tusks, dark eyes"
LORE["Besalisk"]="Besalisk alien like Dexter Jettster, four arms, heavy-set, friendly diner owner look"
LORE["Chadra-Fan"]="Chadra-Fan alien, small bat-like face, large ears, snub nose, cheerful"
LORE["Chagrianer"]="Chagrian alien like Mas Amedda, blue skin, lethorns (horns) on head, long head-tails"
LORE["Chevin"]="Chevin alien, elephant-like long snout face, thick skin, heavy-set"
LORE["Clawdit"]="Clawdite shapeshifter alien like Zam Wesell, reptilian, can change appearance"
LORE["Devorianer"]="Devaronian alien, male with horns on forehead, reddish skin, devil-like appearance"
LORE["Aleena"]="Aleena alien, very small, blue-grey reptilian skin, oversized round head, large eyes"
LORE["Anx"]="Anx alien, very tall, crested head, long neck, hunchback posture, yellowish skin"

get_lore() {
  local name="$1"
  if [[ -n "${LORE[$name]}" ]]; then
    echo "${LORE[$name]}"
  else
    echo "$name alien species from Star Wars universe, unique alien appearance"
  fi
}

TOTAL=$(echo "$SPECIES_NAMES" | wc -l)
COUNT=0
SUCCESS=0
FAILED=0
SKIPPED=0

echo "Generating AI portraits for $TOTAL species..."
echo ""

while IFS= read -r name; do
  COUNT=$((COUNT + 1))
  slug=$(slugify "$name")
  dest="$OUT_DIR/$slug.jpg"

  # Skip if already exists
  if [[ -f "$dest" ]] && [[ -s "$dest" ]]; then
    echo "  [$COUNT/$TOTAL] SKIP $name (exists)"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  lore=$(get_lore "$name")
  prompt="Star Wars ${lore}, cinematic portrait headshot, dramatic rim lighting, dark moody space background, concept art style, ultra detailed, science fiction, digital painting"
  encoded=$(python3 -c "import urllib.parse; print(urllib.parse.quote('''$prompt'''))")
  url="https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true&model=flux&seed=${#slug}"

  echo "  [$COUNT/$TOTAL] $name → $slug.jpg"

  if curl -sL -o "$dest" "$url" -m 90 2>/dev/null && [[ -s "$dest" ]]; then
    filesize=$(stat -c%s "$dest" 2>/dev/null || stat -f%z "$dest" 2>/dev/null)
    echo "    ✓ OK (${filesize} bytes)"
    SUCCESS=$((SUCCESS + 1))
  else
    echo "    ✗ FAILED"
    rm -f "$dest"
    FAILED=$((FAILED + 1))
  fi

  # Rate limit
  sleep 1
done <<< "$SPECIES_NAMES"

echo ""
echo "Done! $SUCCESS generated, $SKIPPED skipped, $FAILED failed."
