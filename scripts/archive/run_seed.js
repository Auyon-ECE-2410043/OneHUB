const mongoose = require("mongoose");
require("dotenv").config();
const { seedRoutine } = require("./utils/seedEceRoutine");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await seedRoutine();
  process.exit(0);
}).catch(console.error);
