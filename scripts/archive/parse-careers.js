const fs = require('fs');

const text = fs.readFileSync('data/extracted/Charaktererschaffung.txt', 'utf8');
const lines = text.split('\n');

const careers = [];
let currentCareer = null;

// Regex
// Ass: Astronavigation, ...
const careerRegex = /^([A-ZÄÖÜ][a-zäöüA-ZÄÖÜ\s]+): (.+)$/; 
// - Bestienreiter: Athletik...
const specRegex = /^-\s*([A-ZÄÖÜ][a-zäöüA-ZÄÖÜ\s\-\']+): (.+)$/;

let parsing = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Start parsing after headline
    if (line.includes('4. Beruf des Charakters festlegen')) {
        parsing = true;
        continue;
    }
    // Stop parsing at next section
    if (line.includes('5. Spezialisierung wählen')) {
        parsing = false;
        break;
    }

    if (!parsing) continue;

    // Check for Specialization first (indented usually, or with dash)
    const specMatch = line.match(specRegex);
    if (specMatch && currentCareer) {
        const skills = specMatch[2].split(',').map(s => s.trim());
        currentCareer.specializations.push({
            name: specMatch[1].trim(),
            skills: skills
        });
        continue;
    }

    // Check for Career
    const careerMatch = line.match(careerRegex);
    if (careerMatch) {
        // Push previous
        if (currentCareer) careers.push(currentCareer);

        // Check if it's a "Macht" career (underlined in PDF, handled as text here)
        // Usually signaled by "Machtwert 1" in skills
        const skillsRaw = careerMatch[2];
        const skills = skillsRaw.split(',').map(s => s.trim());
        
        let forceRating = 0;
        if (skillsRaw.includes('Machtwert 1')) {
            forceRating = 1;
        }

        currentCareer = {
            name: careerMatch[1].trim(),
            careerSkills: skills.filter(s => s !== 'Machtwert 1'),
            forceRating: forceRating,
            specializations: []
        };
    }
}

if (currentCareer) careers.push(currentCareer);

console.log(`Extracted ${careers.length} careers.`);
fs.writeFileSync('data/json/careers.json', JSON.stringify(careers, null, 2));
