const fs = require("fs");
let c = fs.readFileSync("routes/marks.js", "utf8");

c = c.replace(
  "const { studentId, courseId, semester, type, instanceNumber, marksObtained, totalMarks, grade } = req.body;",
  "const { studentId, courseId, semester, type, instanceNumber, marksObtained, totalMarks, grade, mappedCOs } = req.body;"
);

c = c.replace(
  "enteredBy: req.user.id,\n    };",
  "enteredBy: req.user.id,\n      mappedCOs: mappedCOs || [],\n    };"
);

c = c.replace(
  "const { courseId, semester, type, instanceNumber, entries } = req.body;",
  "const { courseId, semester, type, instanceNumber, mappedCOs, entries } = req.body;"
);

c = c.replace(
  "enteredBy: req.user.id,\n        };",
  "enteredBy: req.user.id,\n          mappedCOs: mappedCOs || [],\n        };"
);

fs.writeFileSync("routes/marks.js", c);
