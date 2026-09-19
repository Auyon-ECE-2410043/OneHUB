const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'server.js');
let code = fs.readFileSync(filePath, 'utf-8');

code = code.replace(
  /app\.use\(express\.json\(\)\);/,
  "app.use(express.json({ limit: '50mb' }));\napp.use(express.urlencoded({ extended: true, limit: '50mb' }));"
);

fs.writeFileSync(filePath, code);
console.log('Patched server.js with 50mb limit');
