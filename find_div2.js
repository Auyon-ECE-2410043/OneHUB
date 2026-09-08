const fs = require('fs');
const code = fs.readFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', 'utf8');

const blocks = {
  "studentMetrics": /{\/\* STUDENT DASHBOARD METRICS \*\/}([\s\S]*?){\/\* FACULTY \/ ADMIN DASHBOARD METRICS \*\/}/,
  "facultyMetrics": /{\/\* FACULTY \/ ADMIN DASHBOARD METRICS \*\/}([\s\S]*?){\/\* ADMIN SETTINGS SECTION \*\/}/,
  "adminSettings": /{\/\* ADMIN SETTINGS SECTION \*\/}([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/
};

for (const [name, regex] of Object.entries(blocks)) {
  const m = code.match(regex);
  if (!m) continue;
  const chunk = m[1];
  const open = (chunk.match(/<div/g) || []).length;
  const close = (chunk.match(/<\/div>/g) || []).length;
  console.log(name, "Open:", open, "Close:", close);
}
