const fs = require('fs');
let code = fs.readFileSync('routes/auth.js', 'utf8');

// Add missing !otp check in verify-first-login
code = code.replace(
  'const { userId, otp, newPassword } = req.body;',
  'const { userId, otp, newPassword } = req.body;\n    if (!otp) return res.status(400).json({ error: "Verification code is required." });'
);

// Add missing !otp check in verify-otp
code = code.replace(
  'const { email, otp, newPassword } = req.body;',
  'const { email, otp, newPassword } = req.body;\n    if (!otp) return res.status(400).json({ error: "Verification code is required." });\n    if (!newPassword) return res.status(400).json({ error: "New password is required." });'
);

// Add missing isAdviser check in verify-otp
const brokenVerifyOtpRes = \const userObj = user.toObject();
    delete userObj.passwordHash;

    res.json({ token, userObj, message: "Password reset successful. You are now logged in." });\; // Not quite what I wrote
    
code = code.replace(
  'delete userObj.passwordHash;',
  'delete userObj.passwordHash;\n      if (user.role === "faculty") {\n        const studentCount = await User.countDocuments({ adviserId: user._id });\n        userObj.isAdviser = studentCount > 0;\n      }'
);

fs.writeFileSync('routes/auth.js', code);
console.log('Patched auth.js successfully');
