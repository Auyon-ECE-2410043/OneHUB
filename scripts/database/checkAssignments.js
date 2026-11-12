const mongoose = require('mongoose');
require('dotenv').config();
require('../../models/Course');
const CourseAssignment = require('../../models/CourseAssignment');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const assignments = await CourseAssignment.find().populate('courseIds');
  console.log('Total assignments in DB:', assignments.length);
  for (const a of assignments) {
    console.log(`Batch '${a.batch} | Dept: ${a.department} | Sem: ${a.semester} | Courses: ${a.courseIds.length}`);
  }
  process.exit(0);
}
check();
