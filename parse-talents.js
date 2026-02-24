const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('data/raw/Talentbaeume.pdf');

async function parseTalents() {
    const data = await pdf(dataBuffer);
    const text = data.text;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    const trees = [];
    let currentTree = null;
    let captureMode = 'none'; // 'header', 'talents'

    // Regex
    const careerSpecRegex = /^(.+)\s+Quelle:/; // "Fliegerass Quelle: SoT 27"
    const costRegex = /^(\d+)$/; // "5", "10", etc.

    // Hilfsfunktion: Ist das eine Beschreibung oder ein Name?
    // Namen sind meist kurz, Beschreibungen lang.
    // Aber Achtung: "Naturbursche ►" ist kurz.

    // Wir machen es heuristisch:
    // Wenn wir "Berufsfertigkeiten:" sehen, startet ein neuer Baum.
    // Der Name der Spezialisierung steht meist in der Zeile DAVOR oder DARÜBER.

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 1. Neuer Baum Start
        if (line.includes('Quelle:')) {
            // "Fliegerass Quelle: SoT 27" -> Career: Fliegerass
            // Nächste Zeile: "Bestienreiter" -> Spec
            const match = line.match(careerSpecRegex);
            const careerName = match ? match[1].trim() : 'Unknown';
            
            // Suche Spec Name (nächste Zeile, bevor "Berufsfertigkeiten")
            let specName = 'Unknown';
            for(let j=1; j<5; j++) {
                if (lines[i+j] && !lines[i+j].includes('Quelle') && !lines[i+j].includes('Berufsfertigkeiten')) {
                    specName = lines[i+j].trim();
                    break;
                }
            }

            if (currentTree) trees.push(currentTree);
            
            currentTree = {
                career: careerName,
                specialization: specName,
                talents: []
            };
            continue;
        }

        // 2. Talent Parsing (sehr grob)
        // Wir suchen nach Blöcken zwischen Kosten.
        // Das ist extrem schwer automatisch perfekt zu machen ohne visuelle Koordinaten.
        // Wir sammeln einfach ALLE Texte, die nach Talenten aussehen, und packen sie in eine Liste.
        
        // Besserer Ansatz für V1: Wir extrahieren einfach ALLES in den Tree, was keine Header sind.
        // Und im Frontend filtern wir nach "Kosten" (5, 10, 15...).
        
        if (currentTree) {
            // Ignoriere Header-Kram
            if (line.startsWith('Berufsfertigkeiten') || line.startsWith('Spezialisierungsfertigkeiten')) continue;
            
            // Versuch, Talente zu erkennen
            // Ein Talentblock beginnt oft mit dem Namen, dann Kosten, dann Beschreibung.
            // Im Dump sahen wir: Name, Name, Name ... Kosten ... Beschr, Beschr.
            
            // Wir speichern einfach die Raw-Lines für diesen Tree.
            // Das "echte" Parsing muss wahrscheinlich manuell oder mit GPT-Vision passieren.
            // Aber wir versuchen, Kosten-Marker zu finden.
            
            if (costRegex.test(line)) {
                // Das ist eine Kosten-Zeile (5, 10, 15, 20, 25)
                // Das hilft uns, die Struktur zu erahnen.
            }
            
            currentTree.rawLines = currentTree.rawLines || [];
            currentTree.rawLines.push(line);
        }
    }
    
    if (currentTree) trees.push(currentTree);

    console.log(`Extracted ${trees.length} trees (raw).`);
    
    // Post-Processing: Wir versuchen, aus den "rawLines" Objekte zu machen.
    // Das ist der knifflige Part.
    // Für diesen Prototyp speichern wir die Raw-Daten, damit wir sie analysieren können.
    
    fs.writeFileSync('data/json/talents_raw.json', JSON.stringify(trees, null, 2));
}

parseTalents();
