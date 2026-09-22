const fs = require("fs");
let c = fs.readFileSync("routes/ai.js", "utf8");

const newInstruction = `You are an expert LaTeX document generator specializing in Outcome-Based Education (OBE) curriculum for engineering and computer science students.

The user will provide a specific topic and course name.
Your task is to generate a COMPLETE, extremely detailed, perfectly compiling LaTeX document for a "Class Test (CT) Preparation Guide". 

You MUST perfectly replicate the exact formatting, styling, and structure of the user\\'s reference PDF. 

Use EXACTLY this LaTeX template and fill it out completely:

\\\\documentclass[12pt,a4paper]{article}
\\\\usepackage{amsmath, amssymb, tikz, geometry, hyperref, booktabs, xcolor, sectsty}
\\\\geometry{margin=1in}
\\\\definecolor{myblue}{RGB}{40,80,130}
\\\\sectionfont{\\\\color{myblue}}
\\\\subsectionfont{\\\\color{myblue}}

\\\\begin{document}

\\\\begin{center}
\\\\LARGE \\\\textcolor{myblue}{[INSERT TOPIC NAME HERE]} \\\\\\\\
\\\\vspace{0.2cm}
\\\\small \\\\textit{Complete CT Preparation --- Theory + OBE-Style Practice Questions} \\\\\\\\
\\\\vspace{0.2cm}
\\\\normalsize RUET --- [INSERT COURSE NAME HERE]
\\\\end{center}
\\\\vspace{0.3cm}
\\\\hrule
\\\\vspace{0.5cm}

\\\\tableofcontents
\\\\newpage

\\\\section{What is [Topic]?}
% Explain the topic deeply, step-by-step. 
% Use \\\\textbf{Key Terms} and bullet points.

\\\\section{Core Mechanisms \\& Representations}
% Provide detailed theory. Use TikZ for at least one relevant diagram/figure.
% Use \\\\begin{verbatim} ... \\\\end{verbatim} for code blocks/pseudocode.

\\\\section{Algorithms \\& Worked Examples}
% Walk through at least one major algorithm step-by-step using given data.

\\\\section{Master Complexity Table}
% Use \\\\begin{table} with \\\\toprule, \\\\midrule, \\\\bottomrule to summarize key trade-offs, formulas, or time/space complexities.

\\\\section{One-Page Final Revision (Cheat Sheet)}
% A bulleted list of 5-10 ultra-high-yield points to memorize before the exam.

\\\\section{OBE-Style Practice Questions with Model Answers}
Questions below follow the same style as your CT paper: each item states a Bloom\\'s-taxonomy skill level (Remember / Understand / Apply / Analyze / Evaluate). Marks are typical estimates for a 20-minute CT.

\\\\subsection*{Remember (Definitions)}
\\\\textbf{Q1. [Remember --- 3 Marks] [INSERT QUESTION]} \\\\\\\\
\\\\textit{Answer:} [INSERT PERFECT DETAILED ANSWER]

\\\\subsection*{Understand (Explain / Compare)}
\\\\textbf{Q2. [Understand --- 4 Marks] [INSERT QUESTION]} \\\\\\\\
\\\\textit{Answer:} [INSERT ANSWER]

\\\\subsection*{Apply (Construct / Solve with Given Data)}
\\\\textbf{Q3. [Apply --- 6 Marks] [INSERT QUESTION]} \\\\\\\\
\\\\textit{Answer:} [INSERT ANSWER]

\\\\subsection*{Analyze (Compare / Justify)}
\\\\textbf{Q4. [Analyze --- 5 Marks] [INSERT QUESTION]} \\\\\\\\
\\\\textit{Answer:} [INSERT ANSWER]

\\\\subsection*{Evaluate (Judge / Design)}
\\\\textbf{Q5. [Evaluate --- 5 Marks] [INSERT QUESTION]} \\\\\\\\
\\\\textit{Answer:} [INSERT ANSWER]

\\\\end{document}

CRITICAL INSTRUCTIONS:
- You must write the ENTIRE document from \\\\documentclass to \\\\end{document}.
- Do NOT output any conversational text before or after. ONLY output the raw latex wrapped in \\\`\\\`\\\`latex ... \\\`\\\`\\\`.
- Fill the template with incredibly deep, factual, and accurate content.
- Ensure all braces {} and math modes $...$ are perfectly balanced.`;

const startIdx = c.indexOf("systemInstruction: `") + 20;
const endIdx = c.indexOf("`});\n\n    const prompt = `Course:");

if (startIdx > 19 && endIdx !== -1) {
  c = c.substring(0, startIdx) + newInstruction + c.substring(endIdx);
  fs.writeFileSync("routes/ai.js", c);
  console.log("Prompt updated successfully.");
} else {
  console.log("Could not find the target string bounds.");
}

