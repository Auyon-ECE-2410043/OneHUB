const fs = require('fs');
const file = 'frontend/src/pages/dashboard/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("{ key: 'clearance', label: 'Clearance' }", "{ key: 'clearance', label: 'Clearance' },\n                        { key: 'ai', label: 'StudyBuddy AI' }");

fs.writeFileSync(file, content);
console.log("Added AI to Dashboard");
