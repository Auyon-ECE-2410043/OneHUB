const fs = require("fs");
let c = fs.readFileSync("models/Mark.js", "utf8");
c = c.replace(
  "enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: \"User\", required: true },",
  "enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: \"User\", required: true },\n    mappedCOs: [{ type: String }], // Array of CO codes (e.g. [\"CO1\", \"CO2\"])"
);
fs.writeFileSync("models/Mark.js", c);
