const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('data/json/talents_raw.json', 'utf8'));

const refinedTrees = rawData.map(tree => {
    if (!tree.rawLines) return tree;

    const talents = [];
    let currentCost = 0;
    let bufferNames = [];
    let bufferDescs = [];

    // Wir iterieren durch die Lines und versuchen Blöcke zu erkennen
    for (let line of tree.rawLines) {
        // Kosten-Marker? (5, 10, 15, 20, 25) - steht oft allein
        if (/^(5|10|15|20|25)$/.test(line)) {
            // Wenn wir auf Kosten treffen, schließen wir den vorherigen Block ab (falls vorhanden)
            // Aber Achtung: In der PDF steht oft ERST Name, DANN Kosten, DANN Beschreibung.
            
            // Neuer Block startet.
            currentCost = parseInt(line);
            
            // Wenn wir schon Namen im Puffer haben, gehören die zu DIESEN Kosten?
            // Oder zu den vorherigen?
            // Laut Dump: Namen -> 5 -> Beschreibungen?
            // Oder: 5 -> Namen -> Beschreibungen?
            
            // Check Dump: 
            // Meister der Wildnis ... (Namen)
            // 5
            // Beschreibungen...
            
            // Also: Wenn wir "5" finden, sind die Lines DAVOR die Namen für 5 XP.
            // Die Lines DANACH sind die Beschreibungen.
            
            // Wir müssen also rückwirkend zuordnen.
            continue;
        }
        
        // Talent Name? (Kurz, oft mit ►)
        // Talent Beschreibung? (Lang, Sätze)
        
        const isName = line.length < 40 && !line.includes('.'); 
        // Heuristik: Kurz und kein Punkt am Ende (außer Abkürzung)
        
        if (isName) {
            talents.push({
                name: line.replace('►', '').trim(),
                cost: currentCost || 5, // Fallback
                description: '', // Kommt noch
                isRanked: line.includes('►')
            });
        } else {
            // Beschreibung - füge sie dem letzten Talent hinzu?
            // Das ist ungenau, da die Reihenfolge variieren kann (Spalten).
            // Aber besser als nichts.
            if (talents.length > 0) {
                const lastTalent = talents[talents.length - 1];
                lastTalent.description += (lastTalent.description ? ' ' : '') + line;
            }
        }
    }

    return {
        career: tree.career,
        specialization: tree.specialization,
        talents: talents
    };
});

console.log(`Refined ${refinedTrees.length} trees.`);
fs.writeFileSync('data/json/talents.json', JSON.stringify(refinedTrees, null, 2));
