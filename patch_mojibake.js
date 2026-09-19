const fs = require('fs');
const file = 'frontend/src/pages/dashboard/Dashboard.jsx';
let c = fs.readFileSync(file, 'utf8');
c = c.replace('u.department ? "ï¿½ " + u.department : ""', 'u.department ? " • " + u.department : ""');
fs.writeFileSync(file, c);
console.log("Fixed Mojibake!");
