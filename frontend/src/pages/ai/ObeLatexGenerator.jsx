import { useState } from "react";
import { FileCode, Loader2, Copy, CheckCircle2, Download, BookOpen, AlertCircle } from "lucide-react";
import api from "../../services/api";

export default function ObeLatexGenerator() {
  const [topic, setTopic] = useState("");
  const [course, setCourse] = useState("");
  const [loading, setLoading] = useState(false);
  const [latexCode, setLatexCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic || !course) return;
    
    setLoading(true);
    setError("");
    setLatexCode("");
    
    try {
      const res = await api.post("/ai/latex", { topic, course });
      let code = res.data.latex || "";
      
      // Extract from markdown block if present
      if (code.includes("```latex")) {
        const parts = code.split("```latex");
        if (parts.length > 1) {
          code = parts[1].split("```")[0].trim();
        }
      } else if (code.includes("```")) {
        const parts = code.split("```");
        if (parts.length > 1) {
          code = parts[1].trim();
        }
      }
      
      setLatexCode(code);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "An error occurred while generating the LaTeX document.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(latexCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([latexCode], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${topic.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_obe_ct.tex`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2.5">
          <FileCode className="w-7 h-7 text-indigo-600" />
          <span>OBE LaTeX Generator</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Generate perfectly formatted LaTeX study guides with Bloom''s Taxonomy questions, suitable for Overleaf.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Document Details
            </h3>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Course Name / Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., ECE 2103: Data Structures"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Specific Topic</label>
                <textarea
                  required
                  placeholder="e.g., Graph, Spanning Tree & Shortest Path"
                  rows={4}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !topic || !course}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Document...
                  </>
                ) : (
                  <>
                    <FileCode className="w-4 h-4" />
                    Generate LaTeX
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-sm text-indigo-800">
            <h4 className="font-bold mb-2">What this generates:</h4>
            <ul className="space-y-1.5 list-disc list-inside opacity-90">
              <li>Complete Overleaf-ready LaTeX code</li>
              <li>Deep theoretical explanations</li>
              <li>Relevant TikZ diagrams/figures</li>
              <li>Algorithm pseudocode</li>
              <li>Complexity summary tables</li>
              <li>5+ OBE-mapped Practice Questions</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 flex flex-col h-[600px] overflow-hidden relative">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <div className="flex items-center gap-2">
                {latexCode && (
                  <>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download .tex
                    </button>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied!" : "Copy Code"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-auto bg-[#0d1117] p-4 text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap select-text">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                  <div className="text-center">
                    <p className="font-semibold text-slate-400">Drafting OBE Document...</p>
                    <p className="text-xs opacity-70 mt-1">This takes ~15-30 seconds due to high detail.</p>
                  </div>
                </div>
              ) : latexCode ? (
                latexCode
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 italic">
                  LaTeX code will appear here after generation.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

