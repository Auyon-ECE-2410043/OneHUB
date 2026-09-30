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

export default function CGPACalculator() {
  const [currentCGPA, setCurrentCGPA] = useState("");
  const [currentCredits, setCurrentCredits] = useState("");
  
  const [courses, setCourses] = useState([
    { id: 1, name: "", credit: 3.0, grade: "A+" },
    { id: 2, name: "", credit: 1.5, grade: "A+" },
    { id: 3, name: "", credit: 0.75, grade: "A+" }
  ]);

  const addCourse = () => {
    setCourses([...courses, { id: Date.now(), name: "", credit: 3.0, grade: "A+" }]);
  };

  const removeCourse = (id) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const updateCourse = (id, field, value) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const resetCalculator = () => {
    setCourses([
      { id: 1, name: "", credit: 3.0, grade: "A+" },
      { id: 2, name: "", credit: 1.5, grade: "A+" }
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
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Semester Courses</h2>
              <button onClick={resetCalculator} className="text-sm text-slate-500 hover:text-rose-500 flex items-center gap-1">
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
                    <select
                      value={course.credit}
                      onChange={(e) => updateCourse(course.id, "credit", e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                    >
                      <option value="4.0">4.0</option>
                      <option value="3.0">3.0</option>
                      <option value="2.0">2.0</option>
                      <option value="1.5">1.5</option>
                      <option value="0.75">0.75</option>
                    </select>
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

