const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("    ))}\r\n              {loading && (", "    ))), [messages, navigate])}\r\n              {loading && (");
content = content.replace("    ))}\n              {loading && (", "    ))), [messages, navigate])}\n              {loading && (");

fs.writeFileSync(file, content);
console.log("Fixed end of map!");
