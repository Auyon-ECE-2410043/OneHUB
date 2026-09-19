require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const OfficialResult = require("./models/OfficialResult");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const nafisa = await User.findOne({ name: /Nafisa/i });
  console.log("Nafisa found:", nafisa ? nafisa.name : "No");
  if (nafisa) {
    const res = await OfficialResult.findOne({ studentId: nafisa._id }).sort({ semester: -1 });
    console.log("Nafisa OfficialResult:", res ? res.cgpa : "No Result Found");
  }
  process.exit();
}).catch(console.error);

