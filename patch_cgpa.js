const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "frontend", "src", "pages", "hallApplication", "HallApplicationForm.jsx");
let code = fs.readFileSync(filePath, "utf-8");

code = code.replace(
  /<div className="w-full px-3\.5 py-2 border border-slate-200 bg-slate-50 rounded-xl text-sm \r?\n?text-slate-500 italic">\r?\n?\s*Auto-calculated from database\r?\n?\s*<\/div>/m,
  `<div className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 rounded-xl text-sm font-semibold text-slate-800">
                  {formData.cgpa}
                </div>`
);

fs.writeFileSync(filePath, code);
console.log("Patched CGPA display");

