const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "routes", "marks.js");
let code = fs.readFileSync(filePath, "utf-8");

code = code.replace(
  /const cgpa = cumulativeCredits > 0 \? parseFloat\(\(cumulativeEarnedPoints \/ cumulativeCredits\)\.toFixed\(2\)\) : 0\.0;/,
  `let cgpa = cumulativeCredits > 0 ? parseFloat((cumulativeEarnedPoints / cumulativeCredits).toFixed(2)) : 0.0;
    
    // Fallback to OfficialResult if no digital marks are present but they have official results
    if (cgpa === 0.0) {
      const OfficialResult = require("../models/OfficialResult");
      const latestOfficial = await OfficialResult.findOne({ studentId: req.user.id }).sort({ semester: -1 });
      if (latestOfficial && latestOfficial.cgpa) {
        cgpa = latestOfficial.cgpa;
      }
    }`
);

fs.writeFileSync(filePath, code);
console.log("Patched marks.js to use OfficialResult fallback");

