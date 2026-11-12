const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('../../models/Course');
const CourseAssignment = require('../../models/CourseAssignment');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB Atlas');

  const batches = ['21', '22', '23', '24', '25'];
  const department = 'ECE';

  // Fetch all courses grouped by semester
  const sem11 = (await Course.find({ department, semester: '1-1' })).map(c => c._id);
  const sem12 = (await Course.find({ department, semester: '1-2' })).map(c => c._id);
  const sem21 = (await Course.find({ department, semester: '2-1' })).map(c => c._id);
  const sem22 = (await Course.find({ department, semester: '2-2' })).map(c => c._id);
  const sem31 = (await Course.find({ department, semester: '3-1' })).map(c => c._id);
  const sem32 = (await Course.find({ department, semester: '3-2' })).map(c => c._id);

  // For 4-1 and 4-2, select standard package
  const sem41All = await Course.find({ department, semester: '4-1' });
  const sem41Codes = [
    'ECE 4000_1', 'ECE 4100', 'ECE 4109', 'ECE 4111', 'ECE 4112',
    'ECE 4115', 'ECE 4116', 'ECE 4122', 'ECE 4127', 'ECE 4128'
  ];
  const sem41 = sem41All.filter(c => sem41Codes.includes(c.courseCode)).map(c => c._id);

  const sem42All = await Course.find({ department, semester: '4-2' });
  const sem42Codes = [
    'ECE 4000', 'ECE 4209', 'ECE 4211', 'ECE 4212',
    'ECE 4223', 'ECE 4224', 'ECE 4245', 'ECE 4246'
  ];
  const sem42 = sem42All.filter(c => sem42Codes.includes(c.courseCode)).map(c => c._id);

  const semesterPackages = {
    '1-1': sem11,
    '1-2': sem12,
    '2-1': sem21,
    '2-2': sem22,
    '3-1': sem31,
    '3-2': sem32,
    '4-1': sem41.length > 0 ? sem41 : sem41All.slice(0, 10).map(c => c._id),
    '4-2': sem42.length > 0 ? sem42 : sem42All.slice(0, 9).map(c => c._id),
  };

  for (const batch of batches) {
    for (const [semester, courseIds] of Object.entries(semesterPackages)) {
      await CourseAssignment.findOneAndUpdate(
        { batch, department, semester },
        { batch, department, semester, courseIds },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`Seeded CourseAssignment for Batch '${batch} - ${department} - Sem ${semester} (${courseIds.length} courses)`);
    }
  }

  console.log('Finished seeding course assignments across all batches and semesters successfully.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
