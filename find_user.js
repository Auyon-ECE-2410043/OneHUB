require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require("./models/User");
  const users = await User.find({});
  const matches = users.filter(u => u.email && u.email.includes("2410044"));
  console.log("Matches:", matches.map(u => ({ email: u.email, rollNo: u.rollNo })));
  process.exit(0);
});
