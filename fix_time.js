
const mongoose = require('mongoose');
const ClassSchedule = require('./models/ClassSchedule');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const result = await ClassSchedule.updateMany(
    { dayOfWeek: 'Sunday', courseCode: /2106/ },
    { startTime: '08:00', endTime: '10:30' }
  );
  console.log('Update result:', result);
  process.exit(0);
});

