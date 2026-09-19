const fs = require("fs");
let c = fs.readFileSync("routes/obe.js", "utf8");

const newRoute = `
const Mark = require("../models/Mark");

// Calculate Student PO Attainment Radar
router.get("/student/:studentId/radar", requireAuth, async (req, res) => {
  try {
    const studentId = req.params.studentId === "me" ? req.user.id : req.params.studentId;
    
    // Fetch all marks for this student that have mapped COs
    const marks = await Mark.find({
      studentId: studentId,
      mappedCOs: { $exists: true, $ne: [] },
      marksObtained: { $ne: null }
    });

    // Group marks by course
    const marksByCourse = {};
    for (const m of marks) {
      if (!marksByCourse[m.courseId]) marksByCourse[m.courseId] = [];
      marksByCourse[m.courseId].push(m);
    }

    // Accumulators for POs
    const poStats = {};
    
    // Process each course
    for (const courseId of Object.keys(marksByCourse)) {
      const profile = await CourseProfile.findOne({ courseId }).sort({ createdAt: -1 });
      if (!profile || !profile.mappings) continue;
      
      const courseMarks = marksByCourse[courseId];
      
      for (const mark of courseMarks) {
        if (!mark.totalMarks || mark.totalMarks <= 0) continue;
        const percentage = mark.marksObtained / mark.totalMarks;
        
        for (const coCode of mark.mappedCOs) {
          // Find all POs this CO maps to
          const mappings = profile.mappings.filter(m => m.coCode === coCode);
          for (const mapping of mappings) {
            const po = mapping.poCode;
            const weight = mapping.correlationLevel; // 1, 2, or 3
            
            if (!poStats[po]) poStats[po] = { earnedWeight: 0, maxWeight: 0 };
            poStats[po].earnedWeight += (percentage * weight);
            poStats[po].maxWeight += weight;
          }
        }
      }
    }

    // Format for Recharts
    const allOutcomes = await OBEOutcome.find({ type: "PO" });
    const radarData = allOutcomes.map(out => {
      const stats = poStats[out.code];
      const attainment = stats && stats.maxWeight > 0 ? (stats.earnedWeight / stats.maxWeight) * 100 : 0;
      return {
        subject: out.code,
        title: out.title,
        A: Math.round(attainment),
        fullMark: 100
      };
    });

    res.json({ radarData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error calculating OBE radar" });
  }
});
`;

c = c.replace("module.exports = router;", newRoute + "\nmodule.exports = router;");
fs.writeFileSync("routes/obe.js", c);
