const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/onehub")
  .then(async () => {
    const ClassSchedule = require('./models/ClassSchedule');
    const classes = await ClassSchedule.find({ dayOfWeek: "Tuesday" });
    console.log(JSON.stringify(classes, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
