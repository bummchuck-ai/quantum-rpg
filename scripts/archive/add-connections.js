const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data/json/talents_final.json', 'utf8'));

const enrichedData = data.map(tree => {
    const talents = tree.talents.map(t => {
        // Standard-Annahme: Verbindung nach OBEN (wenn nicht in Zeile 1)
        const connections = [];
        if (t.row > 1) {
            connections.push('top');
        }
        
        return {
            ...t,
            connections: connections // Array ['top', 'bottom', 'left', 'right']
        };
    });
    
    return { ...tree, talents };
});

fs.writeFileSync('data/json/talents_connected.json', JSON.stringify(enrichedData, null, 2));
console.log("Added default connections to talents.");
