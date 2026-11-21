require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const u = await User.find({ rollNo: { $in: ["2410042", "2410043"] } }).select("name rollNo email isFirstLogin");
  console.log("Users:", JSON.stringify(u, null, 2));
  await mongoose.disconnect();
}
check();
