/**
 * File: updateSemester22.js
 * Description: Updates CourseAssignment and student Registrations to the running 2-2 semester for Batch '24.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../../models/User');
const Course = require('../../models/Course');
const CourseAssignment = require('../../models/CourseAssignment');
const Registration = require('../../models/Registration');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // 1. Get 2-2 Courses
    const courseCodes22 = [
      'ECE 2207', 'ECE 2208', 'ECE 2213', 'ECE 2214',
      'ECE 2215', 'ECE 2216', 'ECE 2200', 'Math 2217', 'Hum 2217'
    ];
    const courses22 = await Course.find({
      courseCode: { $in: courseCodes22.map(c => new RegExp('^' + c + '$', 'i')) }
    });
    console.log(`Found ${courses22.length} courses for 2-2:`, courses22.map(c => c.courseCode));

    const totalCredit22 = courses22.reduce((sum, c) => sum + (c.credit || 0), 0);
    console.log(`Total 2-2 credits: ${totalCredit22}`);

    // 2. Upsert CourseAssignment for Batch 24, Semester 2-2
    let assignment24 = await CourseAssignment.findOne({ department: 'ECE', batch: '24', semester: '2-2' });
    if (!assignment24) {
      assignment24 = await CourseAssignment.create({
        department: 'ECE',
        batch: '24',
        semester: '2-2',
        courseIds: courses22.map(c => c._id)
      });
      console.log("Created CourseAssignment for Batch 24 (2-2)");
    } else {
      assignment24.courseIds = courses22.map(c => c._id);
      await assignment24.save();
      console.log("Updated CourseAssignment for Batch 24 (2-2)");
    }

    // 3. Update Registrations for all Batch 24 ECE students
    const students24 = await User.find({ role: 'student', department: 'ECE', batch: '24' });
    console.log(`Found ${students24.length} students in Batch 24 ECE`);

    for (const student of students24) {
      await Registration.findOneAndUpdate(
        { studentId: student._id, semester: '2-2' },
        {
          studentId: student._id,
          semester: '2-2',
          academicSession: student.batch,
          courseIds: courses22.map(c => c._id),
          totalCredit: totalCredit22,
          status: 'approved',
          adviserComment: 'Enrolled in 2-2 regular courses'
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Enrolled all ${students24.length} Batch 24 students into Semester 2-2!`);

    // 4. Also handle Batch 25 for Semester 1-2
    const courseCodes12 = [
      'ECE 1201', 'ECE 1202', 'ECE 1203', 'ECE 1204',
      'ECE 1205', 'ECE 1206', 'ECE 1200', 'Math 1217', 'Hum 1217'
    ];
    const courses12 = await Course.find({
      courseCode: { $in: courseCodes12.map(c => new RegExp('^' + c + '$', 'i')) }
    });
    console.log(`Found ${courses12.length} courses for 1-2:`, courses12.map(c => c.courseCode));
    const totalCredit12 = courses12.reduce((sum, c) => sum + (c.credit || 0), 0);

    let assignment25 = await CourseAssignment.findOne({ department: 'ECE', batch: '25', semester: '1-2' });
    if (!assignment25) {
      assignment25 = await CourseAssignment.create({
        department: 'ECE',
        batch: '25',
        semester: '1-2',
        courseIds: courses12.map(c => c._id)
      });
      console.log("Created CourseAssignment for Batch 25 (1-2)");
    } else {
      assignment25.courseIds = courses12.map(c => c._id);
      await assignment25.save();
      console.log("Updated CourseAssignment for Batch 25 (1-2)");
    }

    const students25 = await User.find({ role: 'student', department: 'ECE', batch: '25' });
    console.log(`Found ${students25.length} students in Batch 25 ECE`);

    for (const student of students25) {
      await Registration.findOneAndUpdate(
        { studentId: student._id, semester: '1-2' },
        {
          studentId: student._id,
          semester: '1-2',
          academicSession: student.batch,
          courseIds: courses12.map(c => c._id),
          totalCredit: totalCredit12,
          status: 'approved',
          adviserComment: 'Enrolled in 1-2 regular courses'
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Enrolled all ${students25.length} Batch 25 students into Semester 1-2!`);

    console.log("SUCCESS! All students and assignments updated to active running semesters.");
    process.exit(0);
  } catch (err) {
    console.error("Error updating semester:", err);
    process.exit(1);
  }
}

run();
