const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

async function testModel() {
    const modelId = 'gemini-1.5-flash';
    console.log('Testing model:', modelId);
    
    try {
        const model = genAI.getGenerativeModel({ model: modelId });
        const result = await model.generateContent("Hello, describe a starship in one sentence.");
        const response = await result.response;
        console.log('Success:', response.text());
    } catch (e) {
        console.error('Failed:', e.message);
    }
}

testModel();
