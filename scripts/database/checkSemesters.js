const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('../../models/Course');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const semesters = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];
  for (const s of semesters) {
    const list = await Course.find({ semester: s }).sort({ courseCode: 1 });
    console.log('=== Semester ' + s + ' (Count: ' + list.length + ') ===');
    console.log(list.map(c => c.courseCode + ' [' + c.credit + ' Cr | ' + c.department + ']').join(', '));
  }
  process.exit(0);
}
check();
