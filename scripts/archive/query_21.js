const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const ClassSchedule = require('./models/ClassSchedule');
    const classes = await ClassSchedule.find({ semester: "2-1" });
    console.log(JSON.stringify(classes, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
