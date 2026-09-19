const fs = require('fs');
const file = 'frontend/src/components/dashboard/LiveSidebar.jsx';
let c = fs.readFileSync(file, 'utf8');
c = c.replace('src="/ruet-logo.png"', 'src="/ruet-logo.svg"');
fs.writeFileSync(file, c);
console.log("Updated to SVG!");
