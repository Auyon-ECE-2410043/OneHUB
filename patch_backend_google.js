const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'routes', 'auth.js');
let code = fs.readFileSync(filePath, 'utf-8');

const googleEndpoint = \
// POST /api/auth/google
router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "No Google token provided" });

    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();
    
    // Optional: Restrict to specific domains
    // if (!email.endsWith('@student.ruet.ac.bd') && !email.endsWith('@ruet.ac.bd')) {
    //   return res.status(403).json({ error: "Please use your official RUET email address." });
    // }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Account not found. Please ask an admin to create an account for you." });
    }

    // Since they authenticated via Google, we can bypass the first login check and just log them in directly
    if (user.isFirstLogin) {
      user.isFirstLogin = false;
      await user.save();
    }

    const tokenJwt = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "defaultsecret", { expiresIn: "7d" });

    res.json({
      token: tokenJwt,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        batch: user.batch
      }
    });

  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ error: "Google authentication failed. " + err.message });
  }
});
\;

code = code.replace(
  /module\.exports = router;/,
  googleEndpoint + "\nmodule.exports = router;"
);

fs.writeFileSync(filePath, code);
console.log('Patched auth.js with Google endpoint');
