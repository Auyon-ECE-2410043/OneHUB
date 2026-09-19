const fs = require("fs");
let c = fs.readFileSync("frontend/src/pages/marks/MarksEntry.jsx", "utf8");

c = c.replace(
  "grade: studentBuffer.grade || \"A+\",\n            });",
  "grade: studentBuffer.grade || \"A+\",\n              mappedCOs: selectedCOs,\n            });"
);

c = c.replace(
  "totalMarks: parseFloat(totalMarks),\n            });",
  "totalMarks: parseFloat(totalMarks),\n              mappedCOs: selectedCOs,\n            });"
);

fs.writeFileSync("frontend/src/pages/marks/MarksEntry.jsx", c);
