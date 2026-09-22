require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash", systemInstruction: "Say hi" });
    const result = await model.generateContent("hello");
    console.log(result.response.text());
  } catch (e) {
    console.error("ERROR:", e);
  }
}
run();
