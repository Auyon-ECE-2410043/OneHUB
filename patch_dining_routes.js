const fs = require('fs');
const file = 'routes/dining.js';
let c = fs.readFileSync(file, 'utf8');

const adminRoutes = `
// Admin: Get all tokens for a specific date
router.get("/admin/tokens", requireAuth, requireRole("admin", "hall_admin", "faculty"), async (req, res) => {
  try {
    const { date } = req.query;
    let query = {};
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      query.date = { \\$gte: startOfDay, \\$lte: endOfDay };
    }
    const tokens = await DiningToken.find(query)
      .populate("studentId", "name studentId department")
      .sort({ date: -1, createdAt: -1 });
    res.json({ tokens });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Admin: Mark token as used
router.patch("/admin/tokens/:id/use", requireAuth, requireRole("admin", "hall_admin", "faculty"), async (req, res) => {
  try {
    const token = await DiningToken.findById(req.params.id).populate("studentId", "name studentId");
    if (!token) return res.status(404).json({ error: "Token not found" });
    if (token.status !== "active") return res.status(400).json({ error: "Token is not active" });
    token.status = "used";
    token.usedAt = new Date();
    await token.save();
    res.json({ message: "Token marked as used", token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
`;

c = c.replace('module.exports = router;', adminRoutes.replace(/\\\\\\$/g, '$') + '\nmodule.exports = router;');
fs.writeFileSync(file, c);
console.log('Added admin dining endpoints!');
