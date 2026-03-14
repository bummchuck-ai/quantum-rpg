const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('data/raw/Waffen_und_Ruestungen.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('data/extracted/Waffen_und_Ruestungen.txt', data.text);
    console.log('Extraction complete. Pages:', data.numpages);
});
