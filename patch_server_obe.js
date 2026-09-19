const fs = require("fs");
let c = fs.readFileSync("server.js", "utf8");
c = c.replace(
  "app.use(\"/api/ai\", require(\"./routes/ai\"));",
  "app.use(\"/api/ai\", require(\"./routes/ai\"));\napp.use(\"/api/obe\", require(\"./routes/obe\"));"
);
fs.writeFileSync("server.js", c);
