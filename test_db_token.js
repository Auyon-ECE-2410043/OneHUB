const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require("./models/User");
  const user = await User.findOne();
  if (user) {
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    const axios = require("axios");
    console.log("Requesting LaTeX...");
    try {
      const res = await axios.post("http://localhost:5000/api/ai/latex", { topic: "Graph", course: "ECE 2103" }, { headers: { Authorization: "Bearer " + token }});
      console.log("SUCCESS");
    } catch(e) {
      console.log("FAIL:", e.response?.status, e.response?.data || e.message);
    }
  }
  process.exit(0);
}
run();
