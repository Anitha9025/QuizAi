require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("No API key");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testModels() {
    try {
        // Attempt gemini-1.5-flash
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Say hi');
        console.log("gemini-1.5-flash SUCCESS:", result.response.text());
    } catch (e) {
        console.error("gemini-1.5-flash ERROR:", e.message);
    }
}

testModels();
