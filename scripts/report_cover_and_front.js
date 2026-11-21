const fs = require('fs');
const path = require('path');
const docx = require('docx');
const { Paragraph, TextRun, AlignmentType, ImageRun } = docx;
const {
  FONT_FAMILY,
  COLOR_PRIMARY,
  COLOR_SECONDARY,
  COLOR_TEXT,
  p,
  boldRun,
  normalRun,
  h1,
  h2,
  createTable
} = require('./report_helpers');

function getCoverPage() {
  const children = [];

  // RUET Motto
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 120, line: 360 },
    children: [
      new TextRun({
        text: "Heaven’s Light is Our Guide",
        font: FONT_FAMILY,
        size: 32, // 16pt
        bold: true,
        color: COLOR_PRIMARY
      })
    ]
  }));

  // RUET Crest Logo
  const logoPath = path.resolve('docs/report_figures/ruet_logo.png');
  if (fs.existsSync(logoPath)) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 160 },
      children: [
        new ImageRun({
          data: fs.readFileSync(logoPath),
          transformation: { width: 110, height: 125 }
        })
      ]
    }));
  }

  // Project Title
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 80, line: 360 },
    children: [
      new TextRun({
        text: "OneHUB: Centralized Smart Academic & Campus Automation Ecosystem with Outcome-Based Education (OBE) Integration",
        font: FONT_FAMILY,
        size: 34, // 17pt
        bold: true,
        color: COLOR_PRIMARY
      })
    ]
  }));

  // Course Subtitle
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 200, line: 360 },
    children: [
      new TextRun({
        text: "Software Development Project- I (ECE-2100)",
        font: FONT_FAMILY,
        size: 26, // 13pt
        bold: true,
        italics: true,
        color: COLOR_SECONDARY
      })
    ]
  }));

  // By Section Header
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 60, line: 320 },
    children: [
      new TextRun({
        text: "By",
        font: FONT_FAMILY,
        size: 26, // 13pt
        bold: true,
        color: COLOR_TEXT
      })
    ]
  }));

  // Team Members
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 40, after: 200, line: 340 },
    children: [
      new TextRun({
        text: "Auyon Dip Sardar (2410043)\nNishit Ray (2410044)\nNujhat Binta Kabir Nahira (2410046)\n",
        font: FONT_FAMILY,
        size: 24, // 12pt
        bold: true,
        color: COLOR_TEXT
      }),
      new TextRun({
        text: "Series: '24 (2nd Year, 1st Semester)\nDepartment of Electrical & Computer Engineering",
        font: FONT_FAMILY,
        size: 22, // 11pt
        italics: true,
        color: COLOR_TEXT
      })
    ]
  }));

  // Instructor Box / Table (as styled in template)
  const instructorHeaders = ["Designation", "Instructor Information"];
  const instructorRows = [
    [
      "Name of Instructor:",
      "Nadim Reza\nLecturer, Department of Electrical & Computer Engineering\nRajshahi University of Engineering & Technology (RUET)"
    ]
  ];
  children.push(createTable(instructorHeaders, instructorRows, [3000, 6200]));

  // Department & University Footer
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 260, after: 40, line: 320 },
    children: [
      new TextRun({
        text: "Rajshahi University of Engineering & Technology\nFaculty of Electrical & Computer Engineering\nDepartment of Electrical & Computer Engineering\nRajshahi-6204, Bangladesh\nMay 2026",
        font: FONT_FAMILY,
        size: 24, // 12pt
        bold: true,
        color: COLOR_PRIMARY
      })
    ]
  }));

  return children;
}

function getFrontMatter() {
  const children = [];

  // Acknowledgment
  children.push(h1("Acknowledgment", true));
  children.push(p("First and foremost, we express our profound gratitude to Almighty Allah for providing us with the health, strength, resilience, and intellect required to successfully design, develop, and document this engineering capstone project, 'OneHUB: Centralized Smart Academic & Campus Automation Ecosystem with Outcome-Based Education (OBE) Integration.'"));

  children.push(p("We extend our heartfelt gratitude and sincere appreciation to our esteemed course instructor and project supervisor, Nadim Reza, Lecturer, Department of Electrical & Computer Engineering, Rajshahi University of Engineering & Technology (RUET). His invaluable guidance, continuous technical encouragement, constructive critiques, and meticulous review throughout the lifecycle of Software Development Project - I (ECE-2100) have been pivotal in shaping this platform into a production-ready enterprise solution."));

  children.push(p("We also convey our sincere thanks to the Head of the Department and the distinguished faculty members of the Department of Electrical & Computer Engineering for nurturing an environment of innovation, academic rigor, and engineering excellence. We express appreciation to our peers and student representatives whose practical feedback and campus insights directly contributed to identifying operational bottlenecks in class routine scheduling, course registration, dining management, and continuous OBE assessments."));

  children.push(p("Finally, we express our deepest appreciation to our parents and families for their unwavering encouragement, understanding, and prayers during long hours of research, development, and system testing."));

  // Table of Contents
  children.push(h1("Table of Contents", true));
  const tocHeaders = ["Section", "Content Description", "Page"];
  const tocRows = [
    ["", "Abstract", "iii"],
    ["", "Acknowledgment", "iv"],
    ["", "List of Figures", "v"],
    ["", "List of Tables", "vi"],
    ["Chapter 1", "Introduction", "1"],
    ["1.1", "Introduction", "1"],
    ["1.2", "Problem Statement", "2"],
    ["1.3", "Project Aims and Objectives", "3"],
    ["1.4", "Significance of the Study", "4"],
    ["Chapter 2", "Software & Hardware Requirements", "5"],
    ["2.1", "Introduction", "5"],
    ["2.2", "Software Requirements", "5"],
    ["2.3", "Programming Languages & Frameworks Used", "6"],
    ["2.4", "Development Tools (IDE, Version Control, Libraries)", "7"],
    ["2.5", "Used Languages Specification", "8"],
    ["Chapter 3", "System Design", "9"],
    ["3.1", "Table Design & Database Schema", "9"],
    ["3.2", "Entity Relationship Diagram (ERD)", "13"],
    ["3.3", "Data Flow Diagram (DFD - Level 0 & Level 1)", "15"],
    ["3.4", "Object-Oriented Class Diagram", "18"],
    ["3.5", "User Interface (UI/UX) Design Architecture", "20"],
    ["Chapter 4", "System Implementation", "22"],
    ["4.1", "Introduction", "22"],
    ["4.2", "System Architecture Overview", "22"],
    ["4.3", "Module-wise Implementation & Working Live Examples", "25"],
    ["4.4", "Algorithms and Core Computational Logic", "45"],
    ["4.5", "Security Features Implemented", "49"],
    ["Chapter 5", "Testing, Results and Evaluation", "52"],
    ["5.1", "Testing Methodology", "52"],
    ["5.2", "Testing Cases and Results", "53"],
    ["5.3", "System Outputs & Production Deliverables", "56"],
    ["5.4", "Performance Evaluation & Benchmarks", "57"],
    ["5.5", "Justification of Complex Engineering Problem (CEP)", "58"],
    ["5.6", "Limitations & Further Improvement", "60"],
    ["5.7", "Conclusion", "61"],
    ["Chapter 6", "Project Management", "62"],
    ["6.1", "Development Methodology (Agile Scrum)", "62"],
    ["6.2", "Timeline / Gantt Chart", "63"],
    ["6.3", "Team Contributions and Responsibilities (50% Backend / 50% Frontend & APK)", "64"],
    ["6.4", "Risk Management and Mitigation Matrix", "65"],
    ["Chapter 7", "References", "66"],
    ["Chapter 8", "Appendices", "68"],
    ["Appendix A", "Source Code and GitHub Repository", "68"],
    ["Appendix B", "Application Routes and Role-Based Permissions Matrix", "69"],
    ["Appendix C", "Comprehensive User Manual for Campus Stakeholders", "71"]
  ];
  children.push(createTable(tocHeaders, tocRows, [1400, 6800, 1000]));

  // List of Figures
  children.push(h1("List of Figures", true));
  const figHeaders = ["Figure", "Caption / Description", "Page"];
  const figRows = [
    ["Figure 1.1", "High-Level Distributed Architecture of OneHUB (Client, API Gateway, Services, Persistence)", "23"],
    ["Figure 3.1", "Complete MongoDB Relational & Document Schema Entity Relationship Diagram (ERD)", "14"],
    ["Figure 3.2", "Data Flow Diagram (DFD) Level 0: Context-Level Process Flow of OneHUB", "16"],
    ["Figure 3.3", "Data Flow Diagram (DFD) Level 1: Course Registration & Adviser Approval Subsystem", "17"],
    ["Figure 3.4", "Object-Oriented Domain Class Diagram for OneHUB Core Entities & Methods", "19"],
    ["Figure 4.1", "Visual Routine Generator, Conflict Prevention, and PNG Export Engine", "28"],
    ["Figure 4.2", "Outcome-Based Education (OBE) CO-PO Calculation & Spider Radar Matrix Pipeline", "38"],
    ["Figure 6.1", "15-Week Agile Project Development Timeline & Sprint Milestone Gantt Chart", "63"]
  ];
  children.push(createTable(figHeaders, figRows, [1400, 6800, 1000]));

  // List of Tables
  children.push(h1("List of Tables", true));
  const tblHeaders = ["Table", "Description", "Page"];
  const tblRows = [
    ["Table 2.1", "Minimum and Recommended Hardware Specifications", "5"],
    ["Table 2.2", "Software Stack and Core Framework Versions (Web & Mobile Flutter APK)", "6"],
    ["Table 3.1", "Users Collection Schema Definition", "9"],
    ["Table 3.2", "Courses Collection Schema Definition", "10"],
    ["Table 3.3", "Registrations Collection Schema Definition", "10"],
    ["Table 3.4", "RoutineSlots Collection Schema Definition", "11"],
    ["Table 3.5", "Attendances Collection Schema Definition", "11"],
    ["Table 3.6", "Marks Collection Schema Definition", "12"],
    ["Table 3.7", "OBE Assessments Collection Schema Definition", "12"],
    ["Table 3.8", "Dining Tokens Collection Schema Definition", "12"],
    ["Table 3.9", "Medical Appointments Collection Schema Definition", "13"],
    ["Table 3.10", "Blood Donors Collection Schema Definition", "13"],
    ["Table 4.1", "Best-of-N Class Test Mark Selection Simulation Matrix", "46"],
    ["Table 4.2", "Bloom's Taxonomy Cognitive Domains and Question Weightings", "47"],
    ["Table 5.1", "Comprehensive System Test Cases and Verification Results (TC01 - TC15)", "53"],
    ["Table 5.2", "Lighthouse Production Audit and Performance Metrics", "57"],
    ["Table 5.3", "Washington Accord Complex Engineering Problem (CEP) Compliance Mapping", "58"],
    ["Table 6.1", "15-Week Agile Sprint Milestone Plan", "64"],
    ["Table 6.2", "Team Contribution Matrix (50% Backend vs 50% Frontend & Mobile APK)", "65"],
    ["Table 6.3", "Technical, Operational, and Security Risk Assessment Matrix", "65"],
    ["Table B.1", "Complete OneHUB Application Routes, Methods, and Role Access Control Matrix", "69"]
  ];
  children.push(createTable(tblHeaders, tblRows, [1400, 6800, 1000]));

  // Abstract
  children.push(h1("Abstract", true));
  children.push(p("In contemporary technological universities, fragmented administrative systems and legacy paper workflows pose significant barriers to academic productivity, accreditation compliance, and student welfare. Rajshahi University of Engineering & Technology (RUET) operates complex engineering curricula requiring rigorous routine scheduling, prerequisite-checked course registrations, continuous assessments, and compliance with the Board of Accreditation for Engineering and Technical Education (BAETE) under the Washington Accord. However, manual paper slips, chaotic messaging threads, and scattered spreadsheets cause severe administrative delays, schedule clashes, and data silos."));

  children.push(p("To resolve these structural campus bottlenecks, this report presents 'OneHUB', an integrated, cloud-native academic governance, Outcome-Based Education (OBE) automation, and smart campus utility ecosystem. Developed for Software Development Project - I (ECE-2100), OneHUB delivers a unified web single-page application (React 18, Vite, Tailwind CSS) and cross-platform mobile client (Flutter, Android APK) powered by an asynchronous microservice backend (Node.js, Express, MongoDB Atlas, Cloudinary)."));

  children.push(p("The backend architecture—engineered as 50% of the project scope—implements automated course registrations with real-time credit checks, atomic routine clash prevention, Best-of-N Class Test calculators adhering to RUET Ordinance, attendance eligibility categorization (Collegiate, Non-collegiate, Discollegiate), an automated LaTeX question paper generator mapped to Bloom's taxonomy, and a hardened JWT/Bcrypt security perimeter. Complementing the core backend, the client-side and mobile APK ecosystem—engineered as 50% combined scope—delivers responsive role-based dashboards, a real-time 'Next Class' countdown widget with one-click Google Calendar export, camera-based dining token QR scanners, hall maintenance ticketing, emergency blood broadcast alerts, and official legal-size PDF/print document exports. System evaluations confirm sub-100ms API responses, 99.9% uptime, zero routine double-booking errors, and full compliance with Complex Engineering Problem (CEP) accreditation standards."));

  return children;
}

module.exports = {
  getCoverPage,
  getFrontMatter
};
