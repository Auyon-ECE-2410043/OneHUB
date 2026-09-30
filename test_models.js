require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const models = ["gemini-flash-latest", "gemini-pro-latest", "gemini-3.5-flash", "gemini-omni-1.1-flash"];
async function run() {
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      await model.generateContent("test");
      console.log(modelName + " SUCCESS");
    } catch (e) {
      console.log(modelName + " FAIL:", e.message);
    }
  }
}
run();
