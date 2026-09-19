const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect("mongodb://localhost:27017/onehub").then(async () => {
  const user = await User.findOne({ name: /Nafisa/i });
  console.log(user);
  process.exit();
});

