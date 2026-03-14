const fs = require('fs');

const text = fs.readFileSync('data/extracted/Waffen_und_Ruestungen.txt', 'utf8');
const lines = text.split('\n').map(l => l.trim()).filter(l => l);

const gear = {
    weapons: [],
    armor: []
};

// --- Weapon Parsing ---
// Matches rows like: Energiezwille LFW 3 - K 1 0 40 4 Betäubungsschaden...
// [Name] [Skill] [Dmg] [Crit] [Range] [Enc] [HP] [Price] [Rarity] [Special]
const weaponRegex = /^(.+)\s+(LFW|SFW|ART|NKW|HG|LS|MEC)\s+([+\-\d\/]+)\s+([\-\d]+)\s+([NKÜMWE])\s+(\d+)\s+([\d\/]+)\s+(\d+)\s+([R\d]+)\s*(.*)$/;

// --- Armor Parsing ---
// Matches rows like: Blastweste 0 1 200 3 1 3 Erhält +2...
// [Name] [Def] [Soak] [Price] [Enc] [HP] [Rarity] [Note]
const armorRegex = /^(.+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*(.*)$/;

lines.forEach(line => {
    // Try Weapon
    const wMatch = line.match(weaponRegex);
    if (wMatch) {
        gear.weapons.push({
            name: wMatch[1].trim(),
            skill: wMatch[2],
            damage: wMatch[3],
            critical: wMatch[4],
            range: wMatch[5],
            encumbrance: parseInt(wMatch[6]),
            hardPoints: wMatch[7],
            price: parseInt(wMatch[8]),
            rarity: wMatch[9],
            special: wMatch[10].trim()
        });
        return;
    }

    // Try Armor (Checking price/enc range to avoid false positives with weapons)
    const aMatch = line.match(armorRegex);
    if (aMatch && !line.includes('LFW') && !line.includes('SFW')) {
         // Filter out some common false positives
         if (parseInt(aMatch[4]) > 5) { // Price > 5 usually armor
            gear.armor.push({
                name: aMatch[1].trim(),
                defense: parseInt(aMatch[2]),
                soak: parseInt(aMatch[3]),
                price: parseInt(aMatch[4]),
                encumbrance: parseInt(aMatch[5]),
                hardPoints: parseInt(aMatch[6]),
                rarity: parseInt(aMatch[7]),
                note: aMatch[8].trim()
            });
         }
    }
});

console.log(`Extracted ${gear.weapons.length} weapons and ${gear.armor.length} armor pieces.`);
fs.writeFileSync('data/json/gear.json', JSON.stringify(gear, null, 2));
