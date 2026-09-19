const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/courses/CourseDetails.jsx', 'utf8');
c = c.replace("{(user?.role === 'admin' || user?.role === 'faculty') && (", "{(user?.role === 'admin' || user?.role === 'faculty') && isObeEnabled && (");
c = c.replace("{activeTab === \"obe\" && (", "{isObeEnabled && activeTab === \"obe\" && (");
fs.writeFileSync('frontend/src/pages/courses/CourseDetails.jsx', c);