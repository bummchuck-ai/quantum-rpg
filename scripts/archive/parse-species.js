const fs = require('fs');
const path = require('path');

const text = fs.readFileSync('data/extracted/Charaktererschaffung.txt', 'utf8');

const speciesList = [];
const lines = text.split('\n');

let currentSpecies = null;

// Regex patterns
const nameRegex = /^(.+) \((\d+) Anfangs-Erfahrungspunkte/;
const statsRegex = /Stärke:\s*(\d+),\s*Gewandtheit:\s*(\d+),\s*Intelligenz:\s*(\d+),\s*List:\s*(\d+),\s*Willenskraft:\s*(\d+),\s*Charisma:\s*(\d+)/i;
const thresholdRegex = /Wundenlimit:\s*(\d+)\s*\+\s*Stärke\s*Erschöpfungslimit:\s*(\d+)\s*\+\s*Willenskraft/i;

// Simple state machine
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (!line) continue;

  const nameMatch = line.match(nameRegex);
  if (nameMatch) {
    if (currentSpecies) {
      speciesList.push(currentSpecies);
    }
    currentSpecies = {
      name: nameMatch[1].trim(),
      startingXP: parseInt(nameMatch[2]),
      characteristics: {},
      woundThresholdBase: 0,
      strainThresholdBase: 0,
      abilities: []
    };
    continue;
  }

  if (currentSpecies) {
    const statsMatch = line.match(statsRegex);
    if (statsMatch) {
      currentSpecies.characteristics = {
        brawn: parseInt(statsMatch[1]),
        agility: parseInt(statsMatch[2]),
        intellect: parseInt(statsMatch[3]),
        cunning: parseInt(statsMatch[4]),
        willpower: parseInt(statsMatch[5]),
        presence: parseInt(statsMatch[6])
      };
      continue;
    }

    const thresholdMatch = line.match(thresholdRegex);
    if (thresholdMatch) {
      currentSpecies.woundThresholdBase = parseInt(thresholdMatch[1]);
      currentSpecies.strainThresholdBase = parseInt(thresholdMatch[2]);
      continue;
    }

    // Capture other lines as abilities/notes
    // Stop if we hit "4. Beruf" or similar major headers
    if (line.startsWith('4. Beruf') || line.startsWith('W%')) {
        if (currentSpecies) speciesList.push(currentSpecies);
        currentSpecies = null;
        continue; // Or break if we only want species
    }
    
    currentSpecies.abilities.push(line);
  }
}

// Push last one
if (currentSpecies) {
  speciesList.push(currentSpecies);
}

// Filter out garbage
const cleanList = speciesList.filter(s => s.characteristics.brawn); // Ensure stats exist

console.log(`Extracted ${cleanList.length} species.`);
fs.writeFileSync('data/json/species_raw.json', JSON.stringify(cleanList, null, 2));
