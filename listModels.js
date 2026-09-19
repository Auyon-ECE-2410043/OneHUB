require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // There is no listModels in the new SDK easily exposed, but we can fetch it via REST
    const axios = require('axios');
    const response = await axios.get('https://generativelanguage.googleapis.com/v1beta/models?key=' + process.env.GEMINI_API_KEY);
    console.log("Available models:");
    response.data.models.forEach(m => console.log(m.name, m.supportedGenerationMethods));
  } catch(e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
run();
