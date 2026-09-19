const fs = require("fs");
let c = fs.readFileSync("routes/dining.js", "utf8");
c = c.replace("{ \\$gte: startOfDay, \\$lte: endOfDay }", "{ $gte: startOfDay, $lte: endOfDay }");
fs.writeFileSync("routes/dining.js", c);
