const axios = require("axios");
async function run() {
  try {
    const res = await axios.post("http://localhost:5000/api/ai/latex", { topic: "Graphs, spanning tree, shortest path", course: "ECE 2103" }, { headers: { Authorization: "Bearer TEST" } });
    console.log("SUCCESS:", res.data);
  } catch (e) {
    console.log("FAIL:", e.response?.data || e.message);
  }
}
run();
