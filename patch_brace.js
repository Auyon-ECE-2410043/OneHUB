const fs = require('fs');
const file = 'frontend/src/pages/dashboard/Dashboard.jsx';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(": ''}}</p>", ": ''}</p>");
fs.writeFileSync(file, c);
console.log('Fixed extra brace!');
