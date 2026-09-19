const fs = require('fs');
const file = 'services/ruetScraper.js';
let c = fs.readFileSync(file, 'utf8');
c = c.replace('          title: `[RUET Notice] ${notice.title}`,', '          createdAt: new Date(notice.dateStr.replace(/(\\d+)(st|nd|rd|th)/, "$1")),\n          title: `[RUET Notice] ${notice.title}`,');
fs.writeFileSync(file, c);
console.log("Updated scraper date parsing!");
