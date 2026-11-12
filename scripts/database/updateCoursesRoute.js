const fs = require('fs');

let code = fs.readFileSync('routes/courses.js', 'utf8');
code = code.replace(/\r\n/g, '\n');

// Update /all endpoint
const searchStr = 'const skip = (page - 1) * limit;';
const replaceStr = `const isAll = req.query.limit === "all" || parseInt(req.query.limit) >= 500;
    if (isAll) {
      const courses = await Course.find().sort({ courseCode: 1 });
      return res.json({
        courses,
        pagination: {
          total: courses.length,
          page: 1,
          pages: 1
        }
      });
    }

    const skip = (page - 1) * limit;`;

if (!code.includes(searchStr)) {
  console.error("Could not find searchStr in routes/courses.js");
  process.exit(1);
}

code = code.replace(searchStr, replaceStr);

// Add GET /admin/assignments before POST /admin/assignments
const postStr = 'router.post("/admin/assignments", requireAuth, requireRole("admin"), async (req, res) => {';
const getStr = `// GET /api/courses/admin/assignments -> Admin retrieves assigned course list for a batch, department & semester
router.get("/admin/assignments", requireAuth, requireRole("faculty", "admin"), async (req, res) => {
  try {
    const { batch, department, semester } = req.query;
    const filter = {};
    if (batch) filter.batch = batch;
    if (department) filter.department = department;
    if (semester) filter.semester = semester;

    const assignment = await CourseAssignment.findOne(filter).populate("courseIds");
    res.json({ assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/admin/assignments", requireAuth, requireRole("admin"), async (req, res) => {`;

if (!code.includes(postStr)) {
  console.error("Could not find postStr in routes/courses.js");
  process.exit(1);
}

code = code.replace(postStr, getStr);

fs.writeFileSync('routes/courses.js', code, 'utf8');
console.log("Updated routes/courses.js successfully!");
