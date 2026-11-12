const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../../frontend/src/pages/courseAssignment/CourseAssignmentList.jsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Update getAllCourses(1, 100) to getAllCourses(1, 500)
content = content.replace(
  'const catalog = await courseService.getAllCourses(1, 100);',
  'const catalog = await courseService.getAllCourses(1, 500);'
);

// 2. Add loadingAssignment state and useEffect for selectedBatch, selectedDept, selectedSemester
const stateAnchor = `  const [message, setMessage] = useState({ text: "", type: "" });`;
const stateAddition = `  const [message, setMessage] = useState({ text: "", type: "" });
  const [loadingAssignment, setLoadingAssignment] = useState(false);

  // Automatically load existing assignment for the selected batch, dept, and semester
  useEffect(() => {
    let isMounted = true;
    const fetchAssignment = async () => {
      setLoadingAssignment(true);
      try {
        const assignment = await courseService.getBatchAssignment(
          selectedBatch,
          selectedDept,
          selectedSemester
        );
        if (isMounted) {
          if (assignment && assignment.courseIds && assignment.courseIds.length > 0) {
            setSelectedCourseIds(assignment.courseIds.map((c) => (c._id || c)));
          } else {
            setSelectedCourseIds([]);
          }
        }
      } catch (err) {
        console.error("Failed to load assignment:", err);
      } finally {
        if (isMounted) setLoadingAssignment(false);
      }
    };

    fetchAssignment();
    return () => {
      isMounted = false;
    };
  }, [selectedBatch, selectedDept, selectedSemester]);`;

content = content.replace(stateAnchor, stateAddition);

// 3. Improve handleSelectAllSemester to select all current filtered semester courses
content = content.replace(
  `  const handleSelectAllSemester = () => {
    const semCourses = filteredCourses.map((c) => c._id);
    setSelectedCourseIds(Array.from(new Set([...selectedCourseIds, ...semCourses])));
  };`,
  `  const handleSelectAllSemester = () => {
    const semCourses = filteredCourses.map((c) => c._id);
    setSelectedCourseIds(semCourses);
  };`
);

// 4. Update ALLIED_DEPTS and matchesDepartment
const oldMatches = `  const ALLIED_DEPTS = ["Math", "Chemistry", "Humanities", "Physics", "Civil", "Mechanical"];

  const matchesDepartment = (courseDept, targetDept) => {
    if (!courseDept || courseDept === targetDept) return true;
    if (targetDept === "ECE" && ALLIED_DEPTS.includes(courseDept)) return true;
    return false;
  };`;

const newMatches = `  const ALLIED_DEPTS = [
    "math", "mathematics",
    "chemistry", "chem",
    "humanities", "hum",
    "physics", "phy",
    "civil", "ce",
    "mechanical", "me",
    "mte", "mechatronics"
  ];

  const matchesDepartment = (courseDept, targetDept) => {
    if (!courseDept) return true;
    const cDept = courseDept.trim().toLowerCase();
    const tDept = (targetDept || "").trim().toLowerCase();
    if (cDept === tDept) return true;
    if (tDept === "ece" && ALLIED_DEPTS.includes(cDept)) return true;
    return false;
  };`;

content = content.replace(oldMatches, newMatches);

// 5. In the UI, add an indicator for loading assignment
const buttonAnchor = `<button
                type="button"
                onClick={handleSelectAllSemester}
                className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-semibold transition-smooth"
              >
                Auto-Select {selectedDept} ({selectedSemester})
              </button>`;

const buttonReplacement = `<button
                type="button"
                onClick={handleSelectAllSemester}
                className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-semibold transition-smooth"
              >
                Auto-Select {selectedDept} ({selectedSemester}) ({filteredCourses.length})
              </button>`;

content = content.replace(buttonAnchor, buttonReplacement);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully updated CourseAssignmentList.jsx');
