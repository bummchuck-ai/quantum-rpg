const fs = require('fs');
const path = require('path');

// 1. Lade die kaputten Daten
const rawData = require('./data/json/talents_connected.json');

// 2. Funktion zum Bereinigen eines Baums
function refineTree(tree) {
    // Erstelle ein 4-Spalten-Raster für die Talente
    // Wir wissen: Ein Talentbaum hat 4 Spalten. 
    // Die "Fragmente" haben row/col Koordinaten.
    // Wir müssen Fragmente in derselben Zelle (oder logisch zusammengehörig) mergen.
    
    // PROBLEM: Der PDF Parser hat vermutlich den Textfluss vertikal oder wild interpretiert.
    // Aber: Wenn wir Glück haben, sind die Fragmente sequenziell in der JSON Liste.
    
    // BESSERER ANSATZ: 
    // Wir bauen das Grid neu auf. 
    // Ein Talentbaum hat normalerweise 5 Zeilen x 4 Spalten = 20 Talente.
    // Aber die PDF-Extraktion hat "Row 1-35" erzeugt, weil jede Textzeile als Row zählt.
    
    // Strategie:
    // Wir gruppieren alles nach "Spalte" (1-4).
    // Innerhalb einer Spalte schauen wir uns die Y-Positionen (Row) an.
    // Cluster von Texten, die nah beieinander liegen, bilden ein Talent.
    // Ein Talent hat ca. 5-7 Textzeilen Abstand zum nächsten.
    
    const talents = [];
    
    // Da die "row" im JSON eigentlich nur eine relative Y-Position der Textzeile ist (vom PDF Parser),
    // müssen wir diese normalisieren.
    
    // Wir gehen davon aus, dass ein Baum IMMER 20 Talente hat (5 Zeilen, 4 Spalten).
    // Wir sortieren alle Fragmente nach Spalte, dann nach Row.
    
    for (let col = 1; col <= 4; col++) {
        // Hole alle Fragmente dieser Spalte
        const colFragments = tree.talents
            .filter(t => t.col === col)
            .sort((a, b) => a.row - b.row);
            
        // Jetzt müssen wir diese Fragmente in 5 "Blöcke" (Talente) unterteilen.
        // Wir können versuchen, das rechnerisch zu machen oder nach Schlüsselwörtern suchen (Namen/Kosten).
        
        // Da wir die Kosten (5, 10, 15, 20, 25) haben, ist das der beste Indikator!
        // Zeile 1: Kosten 5
        // Zeile 2: Kosten 10
        // Zeile 3: Kosten 15
        // Zeile 4: Kosten 20
        // Zeile 5: Kosten 25
        
        const tierGroups = {
            5: [], 10: [], 15: [], 20: [], 25: []
        };
        
        colFragments.forEach(frag => {
            // Manchmal hat der Parser die Kosten falsch zugeordnet, aber meistens stimmt es grob.
            // Wir nutzen die Kosten als primären Grouper.
            if (tierGroups[frag.cost]) {
                tierGroups[frag.cost].push(frag);
            }
        });
        
        // Jetzt verarbeiten wir jede Kostengruppe (Tier) zu einem Talent
        [5, 10, 15, 20, 25].forEach((cost, index) => {
            const row = index + 1; // 1-5
            const fragments = tierGroups[cost];
            
            if (fragments && fragments.length > 0) {
                // Der erste Eintrag ist meist der Name (fett gedruckt im PDF -> oft kürzer oder spezifisch)
                // Oder der Name ist auf mehrere Fragmente verteilt.
                
                // Wir fügen einfach ALLES zusammen als Beschreibung und versuchen den Namen zu raten.
                // Namen sind oft: "Abgehärtet", "Grit", "Dedication" etc.
                
                // Einfacher Hack: Der erste String ist der Name, der Rest die Beschreibung.
                let name = fragments[0].name; 
                
                // Wenn der Name sehr kurz ist oder wie ein Teil eines Satzes wirkt, müssen wir aufpassen.
                // Aber für "Perfekt" reicht das erstmal als Basis.
                
                // Sammle alle Texte (name + description felder)
                let fullTextParts = [];
                fragments.forEach(f => {
                    if(f.name) fullTextParts.push(f.name);
                    if(f.description) fullTextParts.push(f.description);
                });
                
                // Bereinige
                let cleanText = fullTextParts.join(' ').replace(/\s+/g, ' ').trim();
                
                // Heuristik für Name vs Beschreibung:
                // Bekannte Talentnamen suchen? Oder einfach sagen:
                // Name = Fragmente[0].name
                // Desc = Rest
                
                let finalName = fragments[0].name;
                let finalDesc = "";
                
                if (fragments.length > 1) {
                    // Alles ab Fragment 1 ist Beschreibung
                    // Prüfen ob Fragment 0 Beschreibungsteile hat
                    if(fragments[0].description) finalDesc += fragments[0].description + " ";
                    
                    for(let i=1; i<fragments.length; i++) {
                        finalDesc += fragments[i].name + " " + (fragments[i].description || "") + " ";
                    }
                } else {
                    finalDesc = fragments[0].description || "";
                }
                
                // Connections von irgendjemandem im Cluster nehmen (meistens hat der oberste die Connection)
                // Wir nehmen einfach die Union aller Connections
                let allConnections = new Set();
                fragments.forEach(f => {
                    if (f.connections) f.connections.forEach(c => allConnections.add(c));
                });
                
                talents.push({
                    name: finalName.trim(),
                    description: finalDesc.replace(/\s+/g, ' ').trim(),
                    cost: cost,
                    row: row,
                    col: col,
                    isRanked: fragments.some(f => f.isRanked), // Wenn eins davon ranked ist, ist das Talent ranked
                    connections: Array.from(allConnections)
                });
            } else {
                // Platzhalter, falls leer (sollte nicht passieren bei vollständigen Bäumen)
                talents.push({
                    name: "Unbekannt",
                    description: "Datenfehler",
                    cost: cost,
                    row: row,
                    col: col,
                    isRanked: false,
                    connections: []
                });
            }
        });
    }
    
    return {
        career: tree.career,
        specialization: tree.specialization,
        talents: talents.sort((a,b) => (a.row - b.row) || (a.col - b.col))
    };
}

// 3. Verarbeite alle Bäume
const refinedData = rawData.map(tree => refineTree(tree));

// 4. Speichern
fs.writeFileSync('./data/json/talents_refined.json', JSON.stringify(refinedData, null, 2));
console.log("Refactoring complete. Saved to data/json/talents_refined.json");
