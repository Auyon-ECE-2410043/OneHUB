const fs = require("fs");
let c = fs.readFileSync("routes/settings.js", "utf8");
c = c.replace(
  "calendar: true\n};",
  "calendar: true,\n  obe: true,\n  dining: true,\n  ai: true\n};"
);
fs.writeFileSync("routes/settings.js", c);
