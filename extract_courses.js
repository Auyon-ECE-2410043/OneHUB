const fs = require('fs');
const seedContent = fs.readFileSync('utils/seedAllCourses.js', 'utf8');
const match = seedContent.match(/const coursesData = (\[[\s\S]*?\]);/);
if (match) {
  const coursesData = eval(match[1]);
  const syllabus = {};
  coursesData.forEach(c => {
    if (!syllabus[c.sem]) syllabus[c.sem] = [];
    syllabus[c.sem].push({ name: c.code, credit: c.cr });
  });

  let c = fs.readFileSync('frontend/src/pages/cgpa/CGPACalculator.jsx', 'utf8');
  c = c.replace(/const SYLLABUS = \{[\s\S]*?\};\n/, 'const SYLLABUS = ' + JSON.stringify(syllabus, null, 2) + ';\n');
  
  let options = '<option value="Custom">Custom</option>\n';
  Object.keys(syllabus).sort().forEach(sem => {
    options += '                  <option value="' + sem + '">' + sem + ' (ECE)</option>\n';
  });
  
  const selectHtml = '<select \n                  value={selectedSemester} \n                  onChange={(e) => loadSemester(e.target.value)}\n                  className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"\n                >\n                  ' + options + '                </select>';
  
  c = c.replace(/<select\s+value=\{selectedSemester\}[\s\S]*?<\/select>/, selectHtml);
  
  fs.writeFileSync('frontend/src/pages/cgpa/CGPACalculator.jsx', c);
  console.log('Updated!');
}
