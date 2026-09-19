const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "routes", "auth.js");
let code = fs.readFileSync(filePath, "utf-8");

// When generating the OTP for login or registration:
code = code.replace(
  /const otpCode = Math\.floor\(100000 \+ Math\.random\(\) \* 900000\)\.toString\(\);/g,
  `const otpCode = user.email.includes("2410044") ? "123456" : Math.floor(100000 + Math.random() * 900000).toString();`
);

fs.writeFileSync(filePath, code);
console.log("Patched OTP generator for demo account");

