const fs = require('fs');
const file = 'services/ruetScraper.js';
let c = fs.readFileSync(file, 'utf8');

const newCode = \
const cron = require("node-cron");

function initRuetScraper() {
  console.log("RUET Notice Scraper initialized (running every 6 hours)");
  cron.schedule("0 */6 * * *", () => {
    scrapeRuetNotices();
  });
}
\;

c = c.replace('module.exports = { scrapeRuetNotices };', newCode + '\nmodule.exports = { scrapeRuetNotices, initRuetScraper };');
fs.writeFileSync(file, c);
console.log('Added initRuetScraper!');
