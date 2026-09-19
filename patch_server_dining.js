const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "server.js");
let code = fs.readFileSync(filePath, "utf-8");

code = code.replace(
  /app\.use\("\/api\/users", require\("\.\/routes\/users"\)\);/,
  `app.use("/api/users", require("./routes/users"));\napp.use("/api/dining", require("./routes/dining"));`
);

fs.writeFileSync(filePath, code);
console.log("Patched server.js with dining route");

