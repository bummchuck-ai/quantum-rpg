async function testGM() {
    const url = 'http://localhost:3000/api/chat';
    const payload = {
        gameState: {
            character: { 
                name: 'Test Pilot', 
                species: { name: 'Human' }, 
                career: { name: 'Pilot' },
                characteristics: { brawn: 2, agility: 2, intellect: 2, cunning: 2, willpower: 2, presence: 2 },
                credits: 500,
                ownedGear: [],
                specializations: [],
                backgroundOption: 'Debt',
                backgroundType: 'Obligation',
                backgroundValue: 10
            },
            currentPlanet: 'Tatooine',
            currentScene: 'The Beginning',
            sessionHistory: [],
            destinyPool: { lightSide: 3, darkSide: 1 },
            questLog: [],
            npcRelationships: []
        },
        userMessage: "Hello GM"
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Fetch Error:', e);
    }
}

testGM();
