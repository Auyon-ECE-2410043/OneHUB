require("dotenv").config();
const mongoose = require("mongoose");
const OfficialResult = require("./models/OfficialResult");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const res = await OfficialResult.find({});
  console.log("All Official Results count:", res.length);
  if (res.length > 0) {
    console.log(res[0]);
  }
  process.exit();
}).catch(console.error);

