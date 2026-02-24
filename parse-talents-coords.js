const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('data/raw/Talentbaeume.pdf');

// Wir speichern hier die rohen Items mit Koordinaten
let pages = [];

async function parseWithCoords() {
    await pdf(dataBuffer, {
        pagerender: async function(pageData) {
            const textContent = await pageData.getTextContent();
            
            const items = textContent.items.map(item => ({
                str: item.str,
                x: item.transform[4], // X-Koordinate
                y: item.transform[5], // Y-Koordinate (0 ist unten!)
                w: item.width,
                h: item.height
            }));

            // Filter leere Items
            const cleanItems = items.filter(i => i.str.trim().length > 0);
            
            // Seite speichern
            if (cleanItems.length > 0) {
                pages.push({
                    pageIndex: pageData.pageIndex,
                    items: cleanItems
                });
            }
            
            return ""; // Wir brauchen den normalen Text nicht
        }
    });

    console.log(`Parsed ${pages.length} pages with coordinates.`);
    processPages(pages);
}

function processPages(pages) {
    const trees = [];

    for (const page of pages) {
        // 1. Koordinatensystem: Y ist oft "unten = 0". Wir sortieren von Oben nach Unten (Y absteigend).
        // Aber Achtung: Manchmal ist PDF-Layout chaotisch.
        // Wir suchen zuerst den HEADER (Spezialisierung).
        
        // Suche nach "Quelle:" -> Das ist meist der Header-Bereich
        const headerItems = page.items.filter(i => i.y > 500); // Nur obere Hälfte grob
        
        let career = "Unknown";
        let specialization = "Unknown";
        
        // Header Analyse (sehr vereinfacht für den Start)
        // Wir suchen Text, der fett/groß wirkt oder an bestimmter Y-Position steht.
        // Für jetzt nehmen wir an: Das oberste Item ist die Karriere.
        
        // Sortiere Items nach Y absteigend (oben nach unten)
        page.items.sort((a, b) => b.y - a.y);

        // Grid Detection
        // Talente sind meist in 5 Reihen.
        // Wir clustern Y-Werte. Alles was innerhalb von 20px Y-Differenz ist, gehört zu einer "Zeile".
        
        const rows = [];
        let currentRow = { y: page.items[0].y, items: [] };
        
        for (const item of page.items) {
            if (Math.abs(item.y - currentRow.y) < 15) { // Toleranz
                currentRow.items.push(item);
            } else {
                // Neue Zeile
                rows.push(currentRow);
                currentRow = { y: item.y, items: [item] };
            }
        }
        rows.push(currentRow);

        // Jetzt haben wir Zeilen.
        // Wir suchen Zeilen, die 4 Elemente haben (oder Text, der wie Talente aussieht).
        
        // Debug: Zeige gefundene Struktur
        // console.log(`Page ${page.pageIndex}: Found ${rows.length} rows.`);
        
        // Wir versuchen, die "echten" Talentzeilen zu finden.
        // Die haben oft ähnliche Y-Abstände.
        
        const gridRows = rows.filter(row => {
            // Filtere Header/Footer raus
            const text = row.items.map(i => i.str).join(' ');
            return !text.includes('Talentbäume') && !text.includes('Seite') && row.items.length > 1;
        });

        // Speichere das Ergebnis für Analyse
        trees.push({
            page: page.pageIndex,
            rows: gridRows.map(r => ({
                y: r.y,
                text: r.items.sort((a,b) => a.x - b.x).map(i => i.str).join(' | ')
            }))
        });
    }

    fs.writeFileSync('data/json/talents_coords_debug.json', JSON.stringify(trees, null, 2));
    console.log("Wrote debug data with coordinates.");
}

parseWithCoords();
