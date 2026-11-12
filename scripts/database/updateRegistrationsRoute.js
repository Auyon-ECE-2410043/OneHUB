const fs = require('fs');

let code = fs.readFileSync('routes/registrations.js', 'utf8');
code = code.replace(/\r\n/g, '\n');

const targetStr = `    const assignment = await CourseAssignment.findOne({
      batch: student.batch,
      department: student.department,
      semester,
    }).populate("courseIds");

    if (!assignment) {
      return res.status(404).json({ error: "No fixed course list found for your batch and semester" });
    }

    const totalCredit = assignment.courseIds.reduce((sum, c) => sum + (c.credit || 0), 0);

    const registration = await Registration.create({
      studentId: student._id,
      semester,
      academicSession: student.batch,
      previouslyEarnedCredit: student.previouslyEarnedCredit || 0,
      backlogCourseIds: backlogCourseIds || [],
      courseIds: assignment.courseIds.map((c) => c._id),
      totalCredit,
      status: "pending_approval",
    });`;

const replaceStr = `    const assignment = await CourseAssignment.findOne({
      batch: student.batch,
      department: student.department,
      semester,
    }).populate("courseIds");

    let registeredCourses = [];
    if (assignment && assignment.courseIds && assignment.courseIds.length > 0) {
      registeredCourses = assignment.courseIds;
    } else {
      // Fallback: automatically fetch courses for this department and semester from the global catalog
      registeredCourses = await Course.find({ department: student.department, semester });
    }

    if (!registeredCourses || registeredCourses.length === 0) {
      return res.status(404).json({ error: \`No course package found for \${student.department} Semester \${semester}\` });
    }

    const totalCredit = registeredCourses.reduce((sum, c) => sum + (c.credit || 0), 0);

    const registration = await Registration.create({
      studentId: student._id,
      semester,
      academicSession: student.batch,
      previouslyEarnedCredit: student.previouslyEarnedCredit || 0,
      backlogCourseIds: backlogCourseIds || [],
      courseIds: registeredCourses.map((c) => c._id),
      totalCredit,
      status: "pending_approval",
    });`;

if (!code.includes(targetStr)) {
  console.error("targetStr not found in routes/registrations.js");
  process.exit(1);
}

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('routes/registrations.js', code, 'utf8');
console.log("Updated routes/registrations.js successfully!");
