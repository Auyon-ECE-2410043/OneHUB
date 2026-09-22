const fs = require("fs");
let c = fs.readFileSync("routes/ai.js", "utf8");

const latexRoute = `

// POST /api/ai/latex
router.post("/latex", requireAuth, async (req, res) => {
  try {
    const { topic, course } = req.body;
    if (!topic || !course) return res.status(400).json({ error: "Topic and course are required" });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "Gemini API key is not configured" });

    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro", systemInstruction: \`You are an expert LaTeX document generator specializing in Outcome-Based Education (OBE) curriculum for engineering and computer science students.

The user will provide a specific topic and course name.
Your task is to generate a COMPLETE, extremely detailed, and perfectly compiling LaTeX document for a "Class Test (CT) Preparation Guide" on that topic.

The document MUST strictly follow this exact structure:
1. Document Class: \\\\documentclass[12pt,a4paper]{article}
2. Packages: \\\\usepackage{amsmath, amssymb, tikz, geometry, hyperref, booktabs, xcolor}
3. Geometry: \\\\geometry{margin=1in}
4. Title: Include the Topic, "Complete CT Preparation - Theory + OBE-Style Practice Questions", and the Course Name.
5. Section 1: Theory & Basics. Explain the topic deeply, step-by-step, as if teaching a beginner. Include ALL necessary definitions, formulas, and theorems. Use TikZ for AT LEAST ONE relevant diagram, graph, or figure (ensure it compiles).
6. Section 2: Core Algorithms/Mechanisms. Provide pseudocode (using \\\\begin{verbatim}) or step-by-step mathematical derivations.
7. Section 3: Master Complexity/Summary Table. Use \\\\begin{table} and \\\\toprule/\\\\midrule/\\\\bottomrule to summarize key concepts.
8. Section 4: One-Page Final Revision (Cheat Sheet). A bulleted list of 5-10 ultra-high-yield points to memorize before the exam.
9. Section 5: OBE-Style Practice Questions with Model Answers. This is the MOST IMPORTANT section. You must generate at least 5 highly specific questions covering ALL Bloom''s Taxonomy levels:
   - Remember (Definitions, factual recall)
   - Understand (Explain, compare, illustrate)
   - Apply (Construct, solve with given data, trace an algorithm)
   - Analyze (Compare approaches, justify time complexity, trace faults)
   - Evaluate (Judge a design choice, recommend an algorithm for a specific scenario)
   For EACH question, provide a detailed, perfect "Model Answer".

CRITICAL INSTRUCTIONS:
- Generate ONLY the raw LaTeX code. Do NOT output any conversational text before or after.
- Ensure all braces {}, environments \\\\begin/\\\\end, and math modes $...$ are perfectly balanced.
- Do NOT use non-standard packages that Overleaf doesn''t support by default.
- The output MUST be a complete, self-contained LaTeX document from \\\\documentclass to \\\\end{document}.
- ALWAYS wrap your entire response inside a single \\\`\\\`\\\`latex ... \\\`\\\`\\\` markdown code block.\`});

    const prompt = \`Course: \${course}\\nTopic: \${topic}\\n\\nPlease generate the complete OBE CT Preparation Guide LaTeX document now.\`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({ latex: text });
  } catch (error) {
    console.error("LaTeX generation error:", error);
    res.status(500).json({ error: "Failed to generate LaTeX document" });
  }
});
`;

c = c.replace("// POST /api/ai/history", latexRoute + "\n// POST /api/ai/history");
fs.writeFileSync("routes/ai.js", c);
console.log("Patched AI routes");

