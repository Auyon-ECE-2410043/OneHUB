const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "frontend", "src", "pages", "hallApplication", "HallApplicationForm.jsx");
let code = fs.readFileSync(filePath, "utf-8");

code = code.replace(
  /\{loadingCgpa \? "Calculating\.\.\." : Number\(formData\.cgpa\)\.toFixed\(2\)\}/,
  `{loadingCgpa ? "Calculating..." : Number(formData.cgpa) === 0 ? "N/A (No Grades Yet)" : Number(formData.cgpa).toFixed(2)}`
);

fs.writeFileSync(filePath, code);
console.log("Patched CGPA display for 0.00 fallback");

