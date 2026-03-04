require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("No API key");
    process.exit(1);
}

async function listModels() {
    try {
        const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey);
        const data = await res.json();
        if (data.models) {
            console.log("Available models:", data.models.map(m => m.name).join(', '));
        } else {
            console.log("Unexpected response:", data);
        }
    } catch (e) {
        console.error("Fetch error:", e.message);
    }
}

listModels();
