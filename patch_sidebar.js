const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'frontend', 'src', 'components', 'layout', 'Sidebar.jsx');
let code = fs.readFileSync(filePath, 'utf-8');

// add Bot icon
code = code.replace(
  'CalendarDays,',
  'CalendarDays,\n  Bot,'
);

// add to featureKeyMap
code = code.replace(
  '/medical": "medical",',
  '/medical": "medical",\n    "/ai/study": "ai",'
);

// add to student
code = code.replace(
  '{ label: "CGPA Analytics", path: "/cgpa", icon: Award },',
  '{ label: "CGPA Analytics", path: "/cgpa", icon: Award },\n          { label: "StudyBuddy AI", path: "/ai/study", icon: Bot },'
);

// add to faculty
code = code.replace(
  '{ label: "Medical Center", path: "/medical", icon: HeartPulse },',
  '{ label: "Medical Center", path: "/medical", icon: HeartPulse },\n          { label: "StudyBuddy AI", path: "/ai/study", icon: Bot },'
);

fs.writeFileSync(filePath, code);
console.log('Patched Sidebar');
