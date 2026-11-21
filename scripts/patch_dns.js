const fs = require('fs');

let s = fs.readFileSync('server.js', 'utf8');
if (!s.includes('setDefaultResultOrder')) {
  s = 'const dns = require("dns");\ndns.setDefaultResultOrder("ipv4first");\n\n' + s;
  fs.writeFileSync('server.js', s, 'utf8');
  console.log('server.js patched successfully with dns.setDefaultResultOrder');
} else {
  console.log('server.js already contains setDefaultResultOrder');
}
