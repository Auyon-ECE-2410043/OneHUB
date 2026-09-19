const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/courses/CourseDetails.jsx', 'utf8');

c = c.replace('const [searchTerm, setSearchTerm] = useState("");', 'const [searchTerm, setSearchTerm] = useState("");\n  const [activeTab, setActiveTab] = useState("roster");\n  const { user } = require("../../context/AuthContext").useAuth();');

const tabsUI = `
      <div className="flex border-b border-slate-200 mt-6">
        <button
          onClick={() => setActiveTab("roster")}
          className={\`px-6 py-3 font-semibold text-sm transition-colors \${activeTab === "roster" ? "border-b-2 border-sky-500 text-sky-600" : "text-slate-500 hover:text-slate-700"}\`}
        >
          Approved Roster
        </button>
        {(user?.role === 'admin' || user?.role === 'faculty') && (
          <button
            onClick={() => setActiveTab("obe")}
            className={\`px-6 py-3 font-semibold text-sm transition-colors \${activeTab === "obe" ? "border-b-2 border-sky-500 text-sky-600" : "text-slate-500 hover:text-slate-700"}\`}
          >
            OBE Configuration
          </button>
        )}
      </div>

      {activeTab === "roster" ? (
`;

c = c.replace('{/* Student Roster Table */}', tabsUI + '\n      {/* Student Roster Table */}');
c = c.replace('    </div>\n  );\n}', '      ) : (\n        <CourseOBEProfile courseId={id} />\n      )}\n    </div>\n  );\n}');
c = c.replace('import { PageLoader }', 'import CourseOBEProfile from "./CourseOBEProfile";\nimport { PageLoader }');
fs.writeFileSync('frontend/src/pages/courses/CourseDetails.jsx', c);
