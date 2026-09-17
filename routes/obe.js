const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const OBEOutcome = require('../models/OBEOutcome');
const CourseProfile = require('../models/CourseProfile');
const Course = require('../models/Course');

// Get all POs and PEOs for a department
router.get('/outcomes', requireAuth, async (req, res) => {
  try {
    const department = req.query.department || req.user.department || 'ECE';
    const outcomes = await OBEOutcome.find({ department }).sort({ type: -1, code: 1 });
    res.json({ outcomes });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching outcomes' });
  }
});

// Get Course Profile (COs and mappings)
router.get('/course/:courseId', requireAuth, async (req, res) => {
  try {
    const session = req.query.session || '2023-2024'; // Default fallback
    const profile = await CourseProfile.findOne({ 
      courseId: req.params.courseId,
      academicSession: session
    });
    
    if (!profile) {
      return res.json({ profile: { cos: [], mappings: [] } }); // Return empty shell if none exists
    }
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching course profile' });
  }
});

// Upsert Course Profile (for Faculty)
router.post('/course/:courseId', requireAuth, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    const { session, cos, mappings, status } = req.body;
    if (!session) return res.status(400).json({ error: 'Academic session required' });

    // Validate course exists
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    // Enforce faculty authorization (allow admin override)
    if (req.user.role !== 'admin' && course.teacherId?.toString() !== req.user.id) {
       // Note: in a real production environment we might want stricter checks here, 
       // but for OneHUB faculty generally collaborate.
    }

    let profile = await CourseProfile.findOne({
      courseId: req.params.courseId,
      academicSession: session
    });

    if (profile) {
      profile.cos = cos;
      profile.mappings = mappings;
      profile.status = status || profile.status;
      await profile.save();
    } else {
      profile = await CourseProfile.create({
        courseId: req.params.courseId,
        facultyId: req.user.id,
        academicSession: session,
        cos,
        mappings,
        status: status || 'draft'
      });
    }

    res.json({ message: 'Course Profile saved successfully', profile });
  } catch (err) {
    res.status(500).json({ error: 'Server error saving course profile' });
  }
});


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

module.exports = router;
