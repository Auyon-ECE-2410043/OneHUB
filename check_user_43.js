require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require("./models/User");
  const users = await User.find({ email: /2410043/i });
  console.log("Found:", users.map(u => ({ email: u.email, name: u.name, roll: u.rollNo })));
  process.exit(0);
});
