const fs = require('fs');
let code = fs.readFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/hallApplication/HallApplicationForm.jsx', 'utf8');

// 1. Add HALL_NAMES to the import
code = code.replace(
  'import { MALE_HALLS, FEMALE_HALLS, SEMESTERS } from "../../utils/constants";',
  'import { MALE_HALLS, FEMALE_HALLS, SEMESTERS, HALL_NAMES } from "../../utils/constants";'
);

// 2. Define allowedHalls right inside the component
code = code.replace(
  '  const [errorMsg, setErrorMsg] = useState("");',
  '  const [errorMsg, setErrorMsg] = useState("");\n  const allowedHalls = currentUser?.gender === "female" ? FEMALE_HALLS : MALE_HALLS;'
);

fs.writeFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/hallApplication/HallApplicationForm.jsx', code);
console.log("Patched HallApplicationForm.jsx");
