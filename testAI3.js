require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const chat = model.startChat({});
    const result = await chat.sendMessage("hi");
    console.log(result.response.text());
  } catch (err) {
    console.error(err);
  }
}
test();
