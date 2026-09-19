const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

lines[341] = "            {React.useMemo(() => messages.map((msg, idx) => (\r";
lines[414] = "    )), [messages, navigate])}\r";

fs.writeFileSync(file, lines.join('\n'));
console.log("Safely patched lines!");
