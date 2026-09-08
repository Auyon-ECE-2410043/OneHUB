const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');
code = code.replace('app.use("/api/settings", require("./routes/settings"));', 'app.use("/api/settings", require("./routes/settings"));\napp.use("/api/livefeed", require("./routes/livefeed"));');
fs.writeFileSync('server.js', code);
