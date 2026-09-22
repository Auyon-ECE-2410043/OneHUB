const axios = require("axios");
async function run() {
  try {
    // 1. Register a fake user
    const email = "test" + Date.now() + "@test.com";
    await axios.post("http://localhost:5000/api/auth/register", { name: "Test", email, password: "password", studentId: "1234567" }).catch(e=>null);
    
    // 2. Login
    const loginRes = await axios.post("http://localhost:5000/api/auth/login", { email, password: "password" });
    const token = loginRes.data.token;
    
    // 3. Request LaTeX
    console.log("Requesting LaTeX...");
    const res = await axios.post("http://localhost:5000/api/ai/latex", { topic: "Graph", course: "ECE 2103" }, { headers: { Authorization: "Bearer " + token }});
    console.log("SUCCESS:", res.data.latex.substring(0, 100));
  } catch (e) {
    console.log("FAIL:", e.response?.status, e.response?.data || e.message);
  }
}
run();
