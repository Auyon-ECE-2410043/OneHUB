const fs = require('fs');
let code = fs.readFileSync('routes/auth.js', 'utf8');

const mockSend = \// POST /api/auth/send-otp
router.post(\"/send-otp\", async (req, res) => {
  res.json({ message: \"OTP sent successfully (mocked)\" });
});\;

const realSend = \// POST /api/auth/send-otp (Password Reset)
router.post(\"/send-otp\", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: \"Email is required\" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: \"User not found\" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.findOneAndDelete({ email: user.email });
    await Otp.create({ email: user.email, otp: otpCode });
    
    await sendEmail({
      to: user.email,
      subject: \"OneHUB - Password Reset Verification\",
      text: \\\Your password reset verification code is: \\\\,
      html: generateOTPTemplate(otpCode, 'login') // Reuse the auth template
    });

    res.json({ message: \"A password reset code has been sent to your email.\" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});\;

const mockVerify = \// POST /api/auth/verify-otp
router.post(\"/verify-otp\", async (req, res) => {
  res.json({ message: \"OTP verified successfully (mocked)\", token: \"mock_reset_token\" });
});\;

const realVerify = \// POST /api/auth/verify-otp (Password Reset Verify)
router.post(\"/verify-otp\", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: \"User not found\" });

    const otpRecord = await Otp.findOne({ email: user.email, otp });
    if (!otpRecord) return res.status(400).json({ error: \"Invalid or expired verification code.\" });

    if (newPassword) {
      const bcrypt = require(\"bcryptjs\");
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      await user.save();
    }

    await Otp.deleteOne({ _id: otpRecord._id });
    
    // Auto-login after password reset
    const jwt = require(\"jsonwebtoken\");
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: \"7d\" });
    
    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.json({ token, user: userObj, message: \"Password reset successful. You are now logged in.\" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});\;

if (code.includes(mockSend)) {
  code = code.replace(mockSend, realSend);
  code = code.replace(mockVerify, realVerify);
  fs.writeFileSync('routes/auth.js', code);
  console.log(\"Successfully un-mocked OTP endpoints.\");
} else {
  console.log(\"Mock endpoints not found or already replaced.\");
}
