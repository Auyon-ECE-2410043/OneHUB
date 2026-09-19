const fs = require('fs');
const file = 'routes/auth.js';
let content = fs.readFileSync(file, 'utf8');

const newRoute = 
// POST /api/auth/heartbeat
router.post('/heartbeat', requireAuth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { lastActiveAt: new Date() });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Heartbeat failed' });
  }
});

module.exports = router;
;

content = content.replace('module.exports = router;', newRoute);
fs.writeFileSync(file, content);
console.log("Added heartbeat to auth routes");
