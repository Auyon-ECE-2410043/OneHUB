const mongoose = require('mongoose');
require('dotenv').config();

async function fixCourseDepartments() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const coursesColl = mongoose.connection.collection('courses');

    // List of allied courses in RUET ECE syllabus currently stored under allied department names
    const alliedCourseCodes = [
      'Hum 1117', 'Hum 1118', 'Phy 1118',
      'Math 1217', 'Hum 1217',
      'Math 2117', 'Chem 2117', 'Chem 2118',
      'Math 2217', 'Hum 2217',
      'CE 3100',
      'ME 3219', 'ME 3220', 'Hum 3217'
    ];

    console.log('Updating courses to department: "ECE" so they belong to the ECE academic curriculum...');
    const result = await coursesColl.updateMany(
      { courseCode: { $in: alliedCourseCodes } },
      { $set: { department: 'ECE' } }
    );

    console.log(`Updated ${result.modifiedCount} courses to department: 'ECE'.`);

    // Verify all 2-1 courses
    const courses21 = await coursesColl.find({ semester: '2-1' }).toArray();
    console.log(`\nAll Semester 2-1 courses now under department: 'ECE' (Total: ${courses21.length}):`);
    courses21.forEach(c => console.log(` - ${c.courseCode}: ${c.courseName} (${c.credit} Cr, ${c.department})`));

    process.exit(0);
  } catch (err) {
    console.error('Error updating course departments:', err);
    process.exit(1);
  }
}

fixCourseDepartments();
