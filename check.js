const fs = require('fs');
const lines = fs.readFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('className="flex flex-col xl:flex-row'));
console.log(lines.slice(start, start + 30).join('\n'));
