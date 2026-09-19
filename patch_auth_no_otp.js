const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "routes", "auth.js");
let code = fs.readFileSync(filePath, "utf-8");

// For student registration, replace requiresOtp with requirePasswordChange (or just bypass OTP for demo)
// Wait, actually, let us just completely remove the OTP logic for students first login
code = code.replace(
  /if \(user\.role === "student" && user\.isFirstLogin !== false\) \{[\s\S]*?return res\.json\(\{ \s*requiresOtp: true,[\s\S]*?\}\);\s*\}/,
  `if (user.isFirstLogin !== false) {
      return res.json({ 
        requirePasswordChange: true, 
        userId: user._id, 
        message: "Please set up your new password to continue." 
      });
    }`
);

// We should also replace the registration OTP response just in case they use it.
code = code.replace(
  /if \(user\.role === "student" && user\.isFirstLogin !== false\) \{[\s\S]*?res\.status\(201\)\.json\(\{ \s*requiresOtp: true,[\s\S]*?\}\);\s*\}/,
  `if (user.isFirstLogin !== false) {
      res.status(201).json({ 
        requirePasswordChange: true, 
        userId: user._id, 
        message: "Account created! Please set up your new password." 
      });
    }`
);

// Remove the strict check in force-password-change route that limits it to non-students
code = code.replace(
  /if \(user\.role === "student"\) \{[\s\S]*?return res\.status\(403\)\.json\(\{ error: "Students must use OTP verification for first login." \}\);\s*\}/,
  `// Removed student OTP restriction for presentation`
);

fs.writeFileSync(filePath, code);
console.log("Patched auth.js to remove OTP verification");

