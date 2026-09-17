const express = require("express");
const User = require("../models/User");
const Clearance = require("../models/Clearance");
const HallApplication = require("../models/HallApplication");
const Mark = require("../models/Mark");
const Registration = require("../models/Registration");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/users -> List all users (Admin only)
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id -> Delete a user and cascade delete records (Admin only)
router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Protect admin from deleting themselves
    if (req.user.id === userId) {
      return res.status(400).json({ error: "Cannot delete your own admin account." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Cascade delete associated student records
    await Clearance.deleteMany({ studentId: userId });
    await HallApplication.deleteMany({ studentId: userId });
    await Mark.deleteMany({ studentId: userId });
    await Registration.deleteMany({ studentId: userId });
    
    // Delete the actual user record
    await User.findByIdAndDelete(userId);

    res.json({ message: "Account and all associated records deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/active", requireAuth, requireRole("admin"), async (req, res) => { try { const activeSince = new Date(Date.now() - 5 * 60 * 1000); const users = await User.find({ lastActiveAt: { $gte: activeSince } }).select("name role department lastActiveAt"); res.json({ users }); } catch(err) { res.status(500).json({ error: err.message }); } }); module.exports = router;

