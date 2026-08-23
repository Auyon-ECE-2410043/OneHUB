
const mongoose = require('mongoose');
const ClassSchedule = require('./models/ClassSchedule');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const docs = await ClassSchedule.find({ dayOfWeek: 'Sunday', courseCode: /2106/ });
  console.log(JSON.stringify(docs, null, 2));
  process.exit(0);
});

