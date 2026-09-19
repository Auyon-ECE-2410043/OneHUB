const fs = require('fs');
const file = 'frontend/src/components/dashboard/LiveSidebar.jsx';
let c = fs.readFileSync(file, 'utf8');
const search = '{feed.type === "achievement" ? <Award className="w-6 h-6" /> : feed.type === "ruet_news" ? <Globe className="w-6 h-6" /> : <Bell className="w-6 h-6" />}';
const replacement = '{feed.type === "achievement" ? <Award className="w-6 h-6" /> : feed.type === "ruet_news" ? <img src="/ruet-logo.png" className="w-6 h-6 object-contain" alt="RUET" /> : <Bell className="w-6 h-6" />}';
c = c.replace(search, replacement);
fs.writeFileSync(file, c);
console.log("Added RUET Logo!");
