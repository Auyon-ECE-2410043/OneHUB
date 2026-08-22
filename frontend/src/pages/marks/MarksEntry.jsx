import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import courseService from "../../services/courseService";
import markService from "../../services/markService";
import { SEMESTERS, GRADE_POINTS } from "../../utils/constants";
import { PageLoader } from "../../components/common/Loader";
import {
  Award,
  CheckCircle2,
  Save,
  AlertCircle,
  Users,
} from "lucide-react";

export function MarksEntry() {
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";
  const initialSemester = searchParams.get("semester") || "2-1";

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [selectedSemester, setSelectedSemester] = useState(initialSemester);

  // Mark Form Config
  const [markType, setMarkType] = useState("ct"); // 'ct' | 'quiz' | 'assignment' | 'final'
  const [instanceNumber, setInstanceNumber] = useState(1);
  const [totalMarks, setTotalMarks] = useState(20);

  // Student list & marks buffer
  const [students, setStudents] = useState([]);
  const [marksBuffer, setMarksBuffer] = useState({}); // { [studentId]: { marksObtained, grade } }
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const list = await courseService.getAllCourses();
        setCourses(list);
        if (!selectedCourseId && list.length > 0) {
          setSelectedCourseId(list[0]._id);
          if (list[0].semester) setSelectedSemester(list[0].semester);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [selectedCourseId]);

  // Fetch enrolled students when selectedCourseId changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedCourseId) return;
      try {
        const enrolled = await courseService.getCourseStudents(selectedCourseId);
        setStudents(enrolled);

        // Reset buffer
        const initBuffer = {};
        enrolled.forEach((s) => {
          initBuffer[s._id] = { marksObtained: "", grade: "A+" };
        });
        setMarksBuffer(initBuffer);
      } catch (e) {
        console.warn("Could not fetch students for course", e);
      }
    };
    fetchStudents();
  }, [selectedCourseId]);

  const handleMarkChange = (studentId, value) => {
    setMarksBuffer({
      ...marksBuffer,
      [studentId]: {
        ...marksBuffer[studentId],
        marksObtained: value,
      },
    });
  };

  const handleGradeChange = (studentId, grade) => {
    setMarksBuffer({
      ...marksBuffer,
      [studentId]: {
        ...marksBuffer[studentId],
        grade,
      },
    });
  };

  const handleSaveAll = async () => {
    setSubmitting(true);
    setStatusMsg({ text: "", type: "" });
    try {
      let savedCount = 0;
      for (const student of students) {
        const studentBuffer = marksBuffer[student._id];
        if (!studentBuffer) continue;

        if (markType === "final") {
          await markService.enterMark({
            studentId: student._id,
            courseId: selectedCourseId,
            semester: selectedSemester,
            type: "final",
            instanceNumber: 1,
            grade: studentBuffer.grade || "A+",
          });
          savedCount++;
        } else if (studentBuffer.marksObtained !== "" && studentBuffer.marksObtained !== undefined) {
          await markService.enterMark({
            studentId: student._id,
            courseId: selectedCourseId,
            semester: selectedSemester,
            type: markType,
            instanceNumber: Number(instanceNumber) || 1,
            marksObtained: parseFloat(studentBuffer.marksObtained),
            totalMarks: parseFloat(totalMarks),
          });
          savedCount++;
        }
      }

      setStatusMsg({
        text: `Successfully entered/updated marks for ${savedCount} student(s).`,
        type: "success",
      });
    } catch (err) {
      setStatusMsg({
        text: err.message || "Failed to submit marks",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader text="Loading evaluation spreadsheet..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2.5">
          <Award className="w-7 h-7 text-purple-600" />
          <span>Marks & Evaluation Entry Center</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Record Class Tests, Lab Quizzes, Assignments, and Semester Final Grades for enrolled student batches.
        </p>
      </div>

      {statusMsg.text && (
        <div
          className={`p-4 rounded-2xl border flex items-center space-x-3 text-sm animate-in fade-in duration-200 ${
            statusMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Control Panel */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Evaluation Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Select Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.courseCode} - {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
            >
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Assessment Type
            </label>
            <select
              value={markType}
              onChange={(e) => {
                const val = e.target.value;
                setMarkType(val);
                if (val === "ct" || val === "quiz") setTotalMarks(20);
                if (val === "assignment") setTotalMarks(10);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
            >
              <option value="ct">Class Test (CT)</option>
              <option value="quiz">Sessional Quiz</option>
              <option value="assignment">Assignment</option>
              <option value="final">Final Semester Grade</option>
            </select>
          </div>

          {markType === "ct" && (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                CT Instance (1 - 4)
              </label>
              <select
                value={instanceNumber}
                onChange={(e) => setInstanceNumber(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
              >
                <option value={1}>CT 1</option>
                <option value={2}>CT 2</option>
                <option value={3}>CT 3</option>
                <option value={4}>CT 4</option>
              </select>
            </div>
          )}

          {markType === "quiz" && (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Quiz Instance
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={instanceNumber}
                onChange={(e) => setInstanceNumber(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Spreadsheet Input Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-800">
              Student Roster ({students.length} Enrolled)
            </h3>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={submitting || students.length === 0}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-smooth shadow-sm flex items-center space-x-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Saving Marks..." : "Save All Marks"}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Dept & Batch</th>
                <th className="py-3 px-4">
                  {markType === "final" ? "Final Grade" : `Score (Max: ${totalMarks})`}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No approved enrolled students found for this course. Please ensure student registrations are approved first.
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => (
                  <tr key={student._id} className="hover:bg-slate-50/80 transition-smooth">
                    <td className="py-3 px-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-sky-700">
                      {student.rollNo || "N/A"}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{student.name}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {student.department} • Batch '{student.batch}
                    </td>
                    <td className="py-3 px-4">
                      {markType === "final" ? (
                        <select
                          value={marksBuffer[student._id]?.grade || "A+"}
                          onChange={(e) => handleGradeChange(student._id, e.target.value)}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500"
                        >
                          {Object.keys(GRADE_POINTS).map((grade) => (
                            <option key={grade} value={grade}>
                              {grade} (GPA {GRADE_POINTS[grade].toFixed(2)})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max={totalMarks}
                            placeholder="0.0"
                            value={marksBuffer[student._id]?.marksObtained || ""}
                            onChange={(e) => handleMarkChange(student._id, e.target.value)}
                            className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                          <span className="text-xs text-slate-400 font-mono">/ {totalMarks}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MarksEntry;
