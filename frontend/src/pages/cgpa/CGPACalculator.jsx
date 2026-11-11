import { useState, useMemo } from "react";
import { Calculator, Plus, Trash2, ArrowRight, Save, RotateCcw } from "lucide-react";

const GRADES = {
  "A+": 4.00,
  "A": 3.75,
  "A-": 3.50,
  "B+": 3.25,
  "B": 3.00,
  "B-": 2.75,
  "C+": 2.50,
  "C": 2.25,
  "D": 2.00,
  "F": 0.00
};


const SYLLABUS = {
  "1-1": [
    {
      "name": "ECE 1101",
      "credit": 3
    },
    {
      "name": "ECE 1102",
      "credit": 1.5
    },
    {
      "name": "ECE 1103",
      "credit": 3
    },
    {
      "name": "ECE 1104",
      "credit": 1.5
    },
    {
      "name": "Math 1117",
      "credit": 3
    },
    {
      "name": "Phy 1117",
      "credit": 3
    },
    {
      "name": "Phy 1118",
      "credit": 0.75
    },
    {
      "name": "Hum 1117",
      "credit": 3
    },
    {
      "name": "Hum 1118",
      "credit": 0.75
    },
    {
      "name": "ECE 1100",
      "credit": 0.75
    }
  ],
  "1-2": [
    {
      "name": "ECE 1201",
      "credit": 3
    },
    {
      "name": "ECE 1202",
      "credit": 0.75
    },
    {
      "name": "ECE 1203",
      "credit": 3
    },
    {
      "name": "ECE 1204",
      "credit": 1.5
    },
    {
      "name": "ECE 1205",
      "credit": 3
    },
    {
      "name": "ECE 1206",
      "credit": 0.75
    },
    {
      "name": "Math 1217",
      "credit": 3
    },
    {
      "name": "Hum 1217",
      "credit": 3
    },
    {
      "name": "ECE 1200",
      "credit": 0.75
    }
  ],
  "2-1": [
    {
      "name": "ECE 2103",
      "credit": 3
    },
    {
      "name": "ECE 2104",
      "credit": 1.5
    },
    {
      "name": "ECE 2105",
      "credit": 3
    },
    {
      "name": "ECE 2106",
      "credit": 0.75
    },
    {
      "name": "ECE 2111",
      "credit": 3
    },
    {
      "name": "ECE 2112",
      "credit": 0.75
    },
    {
      "name": "Math 2117",
      "credit": 3
    },
    {
      "name": "Chem 2117",
      "credit": 3
    },
    {
      "name": "Chem 2118",
      "credit": 0.75
    },
    {
      "name": "ECE 2100",
      "credit": 0.75
    }
  ],
  "2-2": [
    {
      "name": "ECE 2207",
      "credit": 3
    },
    {
      "name": "ECE 2208",
      "credit": 0.75
    },
    {
      "name": "ECE 2213",
      "credit": 3
    },
    {
      "name": "ECE 2214",
      "credit": 1.5
    },
    {
      "name": "ECE 2215",
      "credit": 3
    },
    {
      "name": "ECE 2216",
      "credit": 1.5
    },
    {
      "name": "Math 2217",
      "credit": 3
    },
    {
      "name": "Hum 2217",
      "credit": 3
    },
    {
      "name": "ECE 2200",
      "credit": 1.5
    }
  ],
  "3-1": [
    {
      "name": "ECE 3107",
      "credit": 3
    },
    {
      "name": "ECE 3108",
      "credit": 0.75
    },
    {
      "name": "ECE 3111",
      "credit": 3
    },
    {
      "name": "ECE 3112",
      "credit": 1.5
    },
    {
      "name": "ECE 3117",
      "credit": 3
    },
    {
      "name": "ECE 3118",
      "credit": 0.75
    },
    {
      "name": "ECE 3119",
      "credit": 3
    },
    {
      "name": "ECE 3121",
      "credit": 3
    },
    {
      "name": "CE 3100",
      "credit": 0.75
    },
    {
      "name": "ECE 3100",
      "credit": 0.75
    }
  ],
  "3-2": [
    {
      "name": "ECE 3205",
      "credit": 3
    },
    {
      "name": "ECE 3206",
      "credit": 0.75
    },
    {
      "name": "ECE 3207",
      "credit": 3
    },
    {
      "name": "ECE 3208",
      "credit": 0.75
    },
    {
      "name": "ECE 3221",
      "credit": 3
    },
    {
      "name": "ECE 3222",
      "credit": 0.75
    },
    {
      "name": "ME 3219",
      "credit": 3
    },
    {
      "name": "ME 3220",
      "credit": 0.75
    },
    {
      "name": "Hum 3217",
      "credit": 3
    },
    {
      "name": "ECE 3200",
      "credit": 1.5
    }
  ],
  "4-1": [
    {
      "name": "ECE 4109",
      "credit": 3
    },
    {
      "name": "MTE 4117",
      "credit": 3
    },
    {
      "name": "MTE 4118",
      "credit": 0.75
    },
    {
      "name": "ECE 4123",
      "credit": 3
    },
    {
      "name": "ECE 4124",
      "credit": 0.75
    },
    {
      "name": "ECE 4000_1",
      "credit": 1
    },
    {
      "name": "ECE 4100",
      "credit": 0.75
    },
    {
      "name": "ECE 4122",
      "credit": 0.75
    },
    {
      "name": "ECE 4111",
      "credit": 3
    },
    {
      "name": "ECE 4115",
      "credit": 3
    },
    {
      "name": "ECE 4117",
      "credit": 3
    },
    {
      "name": "ECE 4125",
      "credit": 3
    },
    {
      "name": "ECE 4141",
      "credit": 3
    },
    {
      "name": "ECE 4143",
      "credit": 3
    },
    {
      "name": "ECE 4127",
      "credit": 3
    },
    {
      "name": "ECE 4129",
      "credit": 3
    },
    {
      "name": "ECE 4131",
      "credit": 3
    },
    {
      "name": "ECE 4133",
      "credit": 3
    },
    {
      "name": "ECE 4135",
      "credit": 3
    }
  ],
  "4-2": [
    {
      "name": "ECE 4209",
      "credit": 3
    },
    {
      "name": "ECE 4211",
      "credit": 3
    },
    {
      "name": "ECE 4212",
      "credit": 0.75
    },
    {
      "name": "ECE 4223",
      "credit": 3
    },
    {
      "name": "ECE 4224",
      "credit": 1.5
    },
    {
      "name": "ECE 4000_2",
      "credit": 3
    },
    {
      "name": "ECE 4221",
      "credit": 3
    },
    {
      "name": "ECE 4227",
      "credit": 3
    },
    {
      "name": "ECE 4237",
      "credit": 3
    },
    {
      "name": "ECE 4239",
      "credit": 3
    },
    {
      "name": "ECE 4241",
      "credit": 3
    },
    {
      "name": "ECE 4243",
      "credit": 3
    },
    {
      "name": "ECE 4245",
      "credit": 3
    },
    {
      "name": "ECE 4247",
      "credit": 3
    },
    {
      "name": "ECE 4249",
      "credit": 3
    },
    {
      "name": "ECE 4251",
      "credit": 3
    },
    {
      "name": "ECE 4253",
      "credit": 3
    },
    {
      "name": "ECE 4255",
      "credit": 3
    },
    {
      "name": "ECE 4257",
      "credit": 3
    },
    {
      "name": "ECE 4259",
      "credit": 3
    }
  ]
};

export default function CGPACalculator() {
  const [currentCGPA, setCurrentCGPA] = useState("");
  const [currentCredits, setCurrentCredits] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("2-2");
  
  const [courses, setCourses] = useState(() => {
    return SYLLABUS["2-2"] ? SYLLABUS["2-2"].map((c, i) => ({
      id: Date.now() + i,
      name: c.name,
      credit: Number(c.credit),
      grade: "A+",
      isCustom: false
    })) : [
      { id: 1, name: "", credit: 3.0, grade: "A+", isCustom: true },
      { id: 2, name: "", credit: 1.5, grade: "A+", isCustom: true }
    ];
  });

  const loadSemester = (sem) => {
    setSelectedSemester(sem);
    if (sem !== "Custom" && SYLLABUS[sem]) {
      setCourses(SYLLABUS[sem].map((c, i) => ({
        id: Date.now() + i,
        name: c.name,
        credit: Number(c.credit),
        grade: "A+",
        isCustom: false
      })));
    } else {
      resetCalculator();
    }
  };

  const addCourse = () => {
    setCourses([...courses, { id: Date.now(), name: "", credit: 3.0, grade: "A+", isCustom: true }]);
  };

  const removeCourse = (id) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const updateCourse = (id, field, value) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const resetCalculator = () => {
    setCourses([
      { id: 1, name: "", credit: 3.0, grade: "A+", isCustom: true },
      { id: 2, name: "", credit: 1.5, grade: "A+", isCustom: true }
    ]);
    setCurrentCGPA("");
    setCurrentCredits("");
  };

  const results = useMemo(() => {
    let semesterPoints = 0;
    let semesterCredits = 0;

    courses.forEach(course => {
      const credit = parseFloat(course.credit) || 0;
      const gradePoint = GRADES[course.grade] || 0;
      semesterPoints += (credit * gradePoint);
      semesterCredits += credit;
    });

    const semesterGPA = semesterCredits > 0 ? (semesterPoints / semesterCredits) : 0;

    let predictedCGPA = semesterGPA;
    let totalCredits = semesterCredits;

    const prevCGPA = parseFloat(currentCGPA);
    const prevCredits = parseFloat(currentCredits);

    if (!isNaN(prevCGPA) && !isNaN(prevCredits) && prevCredits > 0) {
      const prevPoints = prevCGPA * prevCredits;
      totalCredits = prevCredits + semesterCredits;
      predictedCGPA = (prevPoints + semesterPoints) / totalCredits;
    }

    return {
      semesterGPA: semesterGPA.toFixed(2),
      predictedCGPA: predictedCGPA.toFixed(2),
      semesterCredits,
      totalCredits
    };
  }, [courses, currentCGPA, currentCredits]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 rounded-lg">
          <Calculator className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">CGPA Predictor</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Estimate your upcoming GPA and overall CGPA</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Semester Courses</h2>
                <select 
                  value={selectedSemester} 
                  onChange={(e) => loadSemester(e.target.value)}
                  className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Custom">Custom</option>
                  <option value="1-1">1-1 (ECE)</option>
                  <option value="1-2">1-2 (ECE)</option>
                  <option value="2-1">2-1 (ECE)</option>
                  <option value="2-2">2-2 (ECE)</option>
                  <option value="3-1">3-1 (ECE)</option>
                  <option value="3-2">3-2 (ECE)</option>
                  <option value="4-1">4-1 (ECE)</option>
                  <option value="4-2">4-2 (ECE)</option>
                </select>
              </div>
              <button onClick={() => loadSemester("Custom")} className="text-sm text-slate-500 hover:text-rose-500 flex items-center gap-1">
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                <div className="col-span-5">Course Name</div>
                <div className="col-span-3">Credits</div>
                <div className="col-span-3">Expected Grade</div>
                <div className="col-span-1"></div>
              </div>
              
              {courses.map(course => (
                <div key={course.id} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="e.g. ECE 2101"
                      value={course.name}
                      onChange={(e) => updateCourse(course.id, "name", e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    />
                  </div>
                  <div className="col-span-3">
                    {selectedSemester !== "Custom" && !course.isCustom ? (
                      <div className="w-full px-3 py-2 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 rounded-lg text-sm font-bold text-indigo-700 dark:text-indigo-300 text-center flex items-center justify-center gap-1 shadow-xs" title="Fixed from syllabus">
                        <span>{Number(course.credit).toFixed(course.credit % 1 === 0 ? 1 : 2)}</span>
                        <span className="text-xs font-normal text-indigo-500/80">Credits</span>
                      </div>
                    ) : (
                      <select
                        value={String(Number(course.credit))}
                        onChange={(e) => updateCourse(course.id, "credit", parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white font-medium"
                      >
                        <option value="4">4.0 Credits</option>
                        <option value="3">3.0 Credits</option>
                        <option value="2">2.0 Credits</option>
                        <option value="1.5">1.5 Credits</option>
                        <option value="1">1.0 Credit</option>
                        <option value="0.75">0.75 Credit</option>
                      </select>
                    )}
                  </div>
                  <div className="col-span-3">
                    <select
                      value={course.grade}
                      onChange={(e) => updateCourse(course.id, "grade", e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    >
                      {Object.keys(GRADES).map(g => (
                        <option key={g} value={g}>{g} ({GRADES[g].toFixed(2)})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => removeCourse(course.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addCourse}
              className="mt-4 w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Course
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Overall Status (Optional)</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Current CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                placeholder="e.g. 3.45"
                value={currentCGPA}
                onChange={(e) => setCurrentCGPA(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Completed Credits</label>
              <input
                type="number"
                step="0.5"
                min="0"
                placeholder="e.g. 65.5"
                value={currentCredits}
                onChange={(e) => setCurrentCredits(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
              />
            </div>
          </div>

          <div className="bg-indigo-600 rounded-2xl p-6 shadow-md text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Calculator className="w-24 h-24" />
            </div>
            <div className="relative z-10 space-y-4">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Predicted Semester GPA</p>
                <div className="text-4xl font-bold">{results.semesterGPA}</div>
                <p className="text-indigo-200 text-xs mt-1">Based on {results.semesterCredits} credits</p>
              </div>
              
              <div className="h-px bg-indigo-500/50 w-full"></div>
              
              <div>
                <p className="text-indigo-100 text-sm font-medium">Estimated New CGPA</p>
                <div className="text-3xl font-bold flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-indigo-300" />
                  {results.predictedCGPA}
                </div>
                <p className="text-indigo-200 text-xs mt-1">Total {results.totalCredits} credits</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

