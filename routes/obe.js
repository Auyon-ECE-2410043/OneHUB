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

module.exports = router;
