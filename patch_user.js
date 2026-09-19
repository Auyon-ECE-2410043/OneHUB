const fs = require('fs');
const file = 'models/User.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('lastActiveAt')) {
    content = content.replace('fcmTokens: [{ type: String }], // Added for mobile push notifications', 'fcmTokens: [{ type: String }], // Added for mobile push notifications\n    lastActiveAt: { type: Date, default: null },');
    fs.writeFileSync(file, content);
    console.log("Added lastActiveAt to User model");
}
