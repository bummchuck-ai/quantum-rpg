const fs = require('fs');
const path = require('path');

const gearPath = path.join(__dirname, 'data/json/gear.json');
const gear = JSON.parse(fs.readFileSync(gearPath, 'utf8'));

function refineWeapons(weapons) {
  const unique = [];
  const names = new Set();
  
  const categorized = {
    "Pistolen": [],
    "Gewehre": [],
    "Schwere Waffen": [],
    "Nahkampf": [],
    "Granaten": [],
    "Anderes": []
  };

  weapons.forEach(w => {
    if (names.has(w.name)) return;
    names.add(w.name);

    let cat = "Anderes";
    if (w.name.toLowerCase().includes('granate') || w.name.toLowerCase().includes('bombe')) cat = "Granaten";
    else if (w.skill === 'LFW') cat = "Pistolen";
    else if (w.skill === 'SFW') cat = "Gewehre";
    else if (w.skill === 'NKW' || w.skill === 'HG' || w.skill === 'LS') cat = "Nahkampf";
    else if (w.skill === 'ART') cat = "Schwere Waffen";

    categorized[cat].push(w);
  });

  return categorized;
}

function refineArmor(armor) {
    const unique = [];
    const names = new Set();
    
    const categorized = {
      "Kleidung": [],
      "Westen": [],
      "Rüstung": [],
      "Spezial": []
    };
  
    armor.forEach(a => {
      if (names.has(a.name)) return;
      names.add(a.name);
  
      let cat = "Rüstung";
      if (a.name.toLowerCase().includes('kleidung') || a.name.toLowerCase().includes('robe') || a.name.toLowerCase().includes('uniform')) cat = "Kleidung";
      else if (a.name.toLowerCase().includes('weste')) cat = "Westen";
      else if (a.name.toLowerCase().includes('anzug')) cat = "Spezial";
  
      categorized[cat].push(a);
    });
  
    return categorized;
}

const refined = {
  weapons: refineWeapons(gear.weapons),
  armor: refineArmor(gear.armor)
};

fs.writeFileSync(gearPath, JSON.stringify(refined, null, 2));
console.log("Gear refined and categorized.");
