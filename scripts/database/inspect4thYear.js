const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('../../models/Course');

async function inspect4thYear() {
  await mongoose.connect(process.env.MONGO_URI);
  const sem41 = await Course.find({ semester: '4-1' }).sort({ courseCode: 1 });
  console.log('=== Semester 4-1 ===');
  sem41.forEach(c => console.log(`${c.courseCode}: ${c.courseName} (${c.credit} Cr)`));

  const sem42 = await Course.find({ semester: '4-2' }).sort({ courseCode: 1 });
  console.log('=== Semester 4-2 ===');
  sem42.forEach(c => console.log(`${c.courseCode}: ${c.courseName} (${c.credit} Cr)`));

  process.exit(0);
}
inspect4thYear();
