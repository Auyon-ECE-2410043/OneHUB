const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const ClassSchedule = require('./models/ClassSchedule');
    const classes = await ClassSchedule.find({ dayOfWeek: "Tuesday" });
    console.log(JSON.stringify(classes, null, 2));
    
    // Also check Monday just in case
    const classesMon = await ClassSchedule.find({ dayOfWeek: "Monday" });
    console.log("Monday:", JSON.stringify(classesMon, null, 2));
    
    // Also check Sunday
    const classesSun = await ClassSchedule.find({ dayOfWeek: "Sunday" });
    console.log("Sunday:", JSON.stringify(classesSun, null, 2));

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
