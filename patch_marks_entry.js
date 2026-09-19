const fs = require("fs");
let c = fs.readFileSync("frontend/src/pages/marks/MarksEntry.jsx", "utf8");

c = c.replace(
  "const [submitting, setSubmitting] = useState(false);",
  "const [submitting, setSubmitting] = useState(false);\n  const [courseCOs, setCourseCOs] = useState([]);\n  const [selectedCOs, setSelectedCOs] = useState([]);"
);

c = c.replace(
  "import { PageLoader } from \"../../components/common/Loader\";",
  "import { PageLoader } from \"../../components/common/Loader\";\nimport api from \"../../services/api\";"
);

c = c.replace(
  "const enrolled = await courseService.getCourseStudents(selectedCourseId);\n        setStudents(enrolled);",
  "const enrolled = await courseService.getCourseStudents(selectedCourseId);\n        setStudents(enrolled);\n        try {\n          const obeRes = await api.get(`/api/obe/course/${selectedCourseId}`);\n          setCourseCOs(obeRes.data.profile?.cos || []);\n          setSelectedCOs([]);\n        } catch(e) {}"
);

fs.writeFileSync("frontend/src/pages/marks/MarksEntry.jsx", c);
