/**
 * File: CGPAAnalytics.jsx
 * Description: React component rendering the CGPAAnalytics UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useState, useEffect } from "react";
import { markService } from "../../services/markService";
import { PageLoader } from "../../components/common/Loader";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { GraduationCap, BookOpen, Target, TrendingUp, Award, AlertTriangle } from "lucide-react";

export default function CGPAAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [officialResults, setOfficialResults] = useState([]);
  const [selectedOfficialSem, setSelectedOfficialSem] = useState("");
  
  const [targetCGPA, setTargetCGPA] = useState(3.5);
  const [nextSemCredits, setNextSemCredits] = useState(19.5);
  const [requiredGPA, setRequiredGPA] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [res, officialRes] = await Promise.all([
          markService.getAcademicSummary().catch(() => null),
          markService.getOfficialResults().catch(() => [])
        ]);
        setData(res);
        setOfficialResults(officialRes);
        if (officialRes && officialRes.length > 0) {
          setSelectedOfficialSem(officialRes[0].semester);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const calculateRequiredGPA = () => {
    if (!data) return;
    // Formula: (TargetCGPA * (TotalCompletedCredits + NextSemCredits) - (CurrentCGPA * TotalCompletedCredits)) / NextSemCredits
    const currentTotalCredits = data.cgpa ? data.semesterResults.reduce((acc, s) => acc + s.totalCredits, 0) : 0;
    const currentPoints = data.cgpa ? data.cgpa * currentTotalCredits : 0;
    
    const requiredPoints = (targetCGPA * (currentTotalCredits + Number(nextSemCredits))) - currentPoints;
    let reqGPA = requiredPoints / Number(nextSemCredits);
    
    if (reqGPA > 4.0) reqGPA = 4.01; // Impossible
    if (reqGPA < 0) reqGPA = 0; // Extremely easy
    setRequiredGPA(reqGPA);
  };

  if (loading) return <PageLoader />;

  const hasData = data && data.semesterResults && data.semesterResults.length > 0;
  const hasOfficial = officialResults && officialResults.length > 0;

  if (!hasData && !hasOfficial) {
    return (
      <div className="p-6 text-center text-gray-500">
        <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-bold">No Results Yet</h2>
        <p>Your analytics and official results will appear here once published.</p>
      </div>
    );
  }

  // Map data for chart
  const chartData = hasData ? data.semesterResults.map(sem => ({
    name: sem.semester,
    GPA: sem.gpa,
  })) : [];

  const selectedOfficial = officialResults.find(r => r.semester === selectedOfficialSem);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-blue-100 rounded-lg">
          <TrendingUp className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Academic Analytics & CGPA</h1>
          <p className="text-sm text-gray-500">Track your performance progression</p>
        </div>
      </div>

      {hasOfficial && (
        <div className="bg-white p-6 rounded-xl shadow border border-emerald-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-gray-800">Official Semester Results</h2>
            </div>
            <select
              value={selectedOfficialSem}
              onChange={(e) => setSelectedOfficialSem(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-emerald-500"
            >
              {officialResults.map(r => (
                <option key={r.semester} value={r.semester}>Semester {r.semester}</option>
              ))}
            </select>
          </div>
          
          {selectedOfficial && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 font-semibold uppercase">SGPA</p>
                <p className="text-2xl font-black text-gray-800">{selectedOfficial.sgpa.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 font-semibold uppercase">CGPA</p>
                <p className="text-2xl font-black text-gray-800">{selectedOfficial.cgpa.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">Total Earned Credits</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-gray-800">{selectedOfficial.totalEarnedCredit}</span>
                  {selectedOfficial.semesterEarnedCredit && (
                    <span className="text-[10px] font-bold text-gray-400 ml-1">
                      (+{selectedOfficial.semesterEarnedCredit} this sem)
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 font-semibold uppercase">SGP</p>
                <p className="text-2xl font-black text-gray-800">{selectedOfficial.sgp}</p>
              </div>
              
              {(selectedOfficial.failedSubjects || selectedOfficial.needToRegisterAgain) && (
                <div className="col-span-2 md:col-span-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 mt-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-red-800">Remarks</h4>
                    {selectedOfficial.failedSubjects && (
                      <p className="text-sm text-red-700 mt-1"><strong>Failed Subjects:</strong> {selectedOfficial.failedSubjects}</p>
                    )}
                    {selectedOfficial.needToRegisterAgain && (
                      <p className="text-sm text-red-700 mt-1"><strong>Need to Register Again:</strong> {selectedOfficial.needToRegisterAgain}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {hasData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center justify-center">
              <GraduationCap className="w-10 h-10 text-blue-500 mb-2" />
              <h3 className="text-gray-500 font-medium">Cumulative GPA (CGPA)</h3>
              <span className="text-4xl font-black text-gray-800">{data.cgpa.toFixed(2)}</span>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center justify-center">
              <BookOpen className="w-10 h-10 text-indigo-500 mb-2" />
              <h3 className="text-gray-500 font-medium">Total Semesters Completed</h3>
              <span className="text-4xl font-black text-gray-800">{data.semesterResults.length}</span>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center justify-center">
              <Target className="w-10 h-10 text-emerald-500 mb-2" />
              <h3 className="text-gray-500 font-medium">Latest Semester GPA</h3>
              <span className="text-4xl font-black text-gray-800">
                {data.semesterResults[data.semesterResults.length - 1].gpa.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">GPA Progression Chart</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 4.0]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="GPA" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Target Calculator</h2>
              <p className="text-sm text-gray-500 mb-4">Calculate the GPA you need in your next semester to reach a target CGPA.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target CGPA</label>
                  <input 
                    type="number" step="0.01" min="0" max="4.0"
                    value={targetCGPA} onChange={e => setTargetCGPA(e.target.value)}
                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Semester Credits</label>
                  <input 
                    type="number" step="0.5" min="0" max="30"
                    value={nextSemCredits} onChange={e => setNextSemCredits(e.target.value)}
                    className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button 
                  onClick={calculateRequiredGPA}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Calculate Required GPA
                </button>

                {requiredGPA !== null && (
                  <div className={`mt-4 p-4 rounded-lg text-center ${requiredGPA > 4.0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    <p className="text-sm">You need a GPA of</p>
                    <p className="text-3xl font-black">{requiredGPA > 4.0 ? "Impossible" : requiredGPA.toFixed(2)}</p>
                    <p className="text-xs mt-1">in your next semester to reach {targetCGPA} CGPA.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
