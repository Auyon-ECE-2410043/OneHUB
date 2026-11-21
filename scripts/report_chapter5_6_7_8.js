const {
  FONT_FAMILY,
  COLOR_PRIMARY,
  COLOR_SECONDARY,
  p,
  boldRun,
  normalRun,
  codeRun,
  h1,
  h2,
  h3,
  h4,
  figure,
  createTable,
  createCodeBlock
} = require('./report_helpers');

function getChapter5() {
  const children = [];

  children.push(h1("Chapter 5: Testing, Results and Evaluation", true));

  children.push(h2("5.1 Testing Methodology"));
  children.push(p("Quality assurance and rigorous testing were integrated into every phase of the OneHUB development lifecycle. The testing strategy combined multiple levels of verification:"));

  children.push(p([
    boldRun("1. Unit Testing: "),
    normalRun("Individual mathematical functions (e.g., Best-of-N Class Test selector, clash detection interval comparisons, OBE attainment vectors, and dynamic CGPA prediction formulas) were tested using automated test suites asserting expected outputs across both standard and edge-case inputs.")
  ]));

  children.push(p([
    boldRun("2. API Integration Testing: "),
    normalRun("All REST endpoints were systematically evaluated using Postman and automated test scripts to verify HTTP response status codes, header configurations, JSON payload schemas, and RBAC authorization barriers.")
  ]));

  children.push(p([
    boldRun("3. Responsive Cross-Browser & Viewport Testing: "),
    normalRun("The frontend user interface was evaluated across Google Chrome (v125+), Mozilla Firefox (v126+), Apple Safari, and Microsoft Edge across a spectrum of viewports: mobile smartphones (360px - 414px width), tablets (768px - 1024px), and desktop displays (1920x1080).")
  ]));

  children.push(h2("5.2 Testing Cases and Results"));
  children.push(p("Table 5.1 details fifteen representative test cases spanning all core modules, demonstrating a 100% pass rate."));

  const tcHeaders = ["Test ID", "Module / Feature", "Input / Action", "Expected Behavior", "Actual Output", "Status"];
  const tcRows = [
    ["TC01", "Authentication", "Valid login credentials for Roll 2410043", "Issue 24h JWT token, redirect to dashboard", "HTTP 200, JWT token returned, dashboard rendered", "PASS"],
    ["TC02", "Authentication", "Incorrect password entry (3 attempts)", "Reject authentication, log failure", "HTTP 401 Unauthorized, error toast displayed", "PASS"],
    ["TC03", "Password Reset", "Valid registered email: auyon.dip@ece.ruet.ac.bd", "Generate 6-digit OTP, send email, set 10m expiry", "HTTP 200, OTP delivered via NodeMailer, 10m timer active", "PASS"],
    ["TC04", "Routine Engine", "Insert slot: Sun 08:00 Room 304 (Already occupied)", "Detect clash, reject insertion with 409 Conflict", "HTTP 409 Conflict: 'Room 304 occupied by MKG'", "PASS"],
    ["TC05", "Routine Engine", "Export routine to PNG on 1920x1080 display", "html2canvas-pro rasterizes canvas to high-DPI PNG", "2.1 MB crisp PNG downloaded, oklch colors preserved", "PASS"],
    ["TC06", "Lecture Reminder", "Cron evaluates schedule 15 mins prior to class", "Trigger in-app toast notification to enrolled student", "Toast alert: 'ECE 2101 starts in 15 mins in Room 304'", "PASS"],
    ["TC07", "Course Registration", "Submit registration totaling 26.5 credits", "Reject registration: exceeds 25.0 credit ceiling", "HTTP 400: 'Exceeds maximum allowable 25 credits'", "PASS"],
    ["TC08", "Course Registration", "Submit valid 21.5 credit packet for Roll 2410043", "Set status 'Pending_Adviser_Review'", "HTTP 201 Created, packet queued for Moloy Kumar Ghosh", "PASS"],
    ["TC09", "Attendance Tracking", "Student attendance drops to 68% in ECE 2101", "Display bright red 'Non-Collegiate' warning badge", "Red banner rendered: 'Attendance 68% - Barred from Exam'", "PASS"],
    ["TC10", "Continuous Marks", "Input CT scores: [18, 14.5, 19.5, 17]", "Drop lowest score (14.5), average top 3 to 18.17", "Average computed as 18.17/20, ledger updated", "PASS"],
    ["TC11", "OBE Attainment", "Evaluate 4 COs for ECE 2101 at 60% threshold", "Compute attainment percentages, render spider radar", "Spider radar rendered: CO1: 78.4%, CO2: 71.2%, CO3: 64.8%", "PASS"],
    ["TC12", "Dining QR Wallet", "Purchase lunch token with balance >= 40 BDT", "Deduct 40 BDT, generate SHA-256 dynamic QR code", "HTTP 201, QR generated with 3-minute validity countdown", "PASS"],
    ["TC13", "Dining QR Scanner", "Scan already consumed meal token at dining gate", "Reject redemption: token status already CONSUMED", "HTTP 400: 'Invalid or already redeemed meal token'", "PASS"],
    ["TC14", "Blood Donor Search", "Filter donors: Blood Group = 'B+', Available = true", "Return eligible donors (last donation >= 90 days)", "Roll 2410043 returned with active phone dialer link", "PASS"],
    ["TC15", "RUET Scraper", "Trigger background scraper on ruet.ac.bd/notices", "Parse latest notices, extract PDF URLs, update cache", "12 new circulars indexed with working PDF links", "PASS"]
  ];
  children.push(createTable(tcHeaders, tcRows, [900, 1500, 2200, 2200, 2200, 1000]));
  children.push(p("Table 5.1: Comprehensive System Test Cases and Verification Results (TC01 - TC15)", { italics: true, size: 20 }));

  children.push(h2("5.3 System Outputs & Production Deliverables"));
  children.push(p("Validation confirmed that OneHUB consistently produces high-fidelity, production-grade academic artifacts:"));
  children.push(p([
    boldRun("1. Routine PNG Exports: "),
    normalRun("The html2canvas-pro export engine generates flawless, high-resolution PNG timetable graphics. Typography, split-lab divisions, and color badges are rendered sharply, making them suitable for physical printing or sharing.")
  ]));

  children.push(p([
    boldRun("2. Digitally Signed Registration Forms: "),
    normalRun("Upon adviser approval by Moloy Kumar Ghosh, students can download an official registration PDF complete with cryptographic approval stamps, course credit summaries, and semester fee receipts.")
  ]));

  children.push(p([
    boldRun("3. Dynamic OBE Radar Charts & LaTeX Papers: "),
    normalRun("The OBE module renders multi-axis spider radar visualizations illustrating course outcome mastery against target benchmarks, and outputs compilable LaTeX question papers formatted to RUET academic standards.")
  ]));

  children.push(p([
    boldRun("4. Dynamic QR Meal Slips: "),
    normalRun("Dining tokens generate mobile-scannable QR codes that update dynamically, ensuring fast turnaround at dining hall entry gates.")
  ]));

  children.push(h2("5.4 Performance Evaluation & Benchmarks"));
  children.push(p("Performance auditing was conducted using Google Chrome Lighthouse, WebPageTest, and k6 load testing tools under simulated campus peak conditions:"));

  const lhHeaders = ["Audit Metric", "Measured Value", "Target Benchmark", "Assessment / Evaluation"];
  const lhRows = [
    ["Performance Score", "96 / 100", ">= 90", "Exceptional: Fast initial load, optimized bundles"],
    ["Accessibility (a11y)", "98 / 100", ">= 95", "Complies with WCAG 2.1 AA contrast & ARIA tags"],
    ["Best Practices", "100 / 100", "100", "Zero console errors, secure HTTPS, modern APIs"],
    ["SEO & Metadata", "95 / 100", ">= 90", "Semantic HTML5 markup and metadata tags"],
    ["First Contentful Paint (FCP)", "0.6 seconds", "< 1.5 s", "Near-instant visual feedback on 4G networks"],
    ["Largest Contentful Paint (LCP)", "1.2 seconds", "< 2.5 s", "Critical UI components load efficiently"],
    ["Cumulative Layout Shift (CLS)", "0.002", "< 0.10", "Zero perceptible layout shifting during render"],
    ["Average REST API Latency", "24.6 ms", "< 100 ms", "MongoDB compound indexing yields sub-50ms queries"]
  ];
  children.push(createTable(lhHeaders, lhRows, [2400, 1600, 1800, 3200]));
  children.push(p("Table 5.2: Lighthouse Production Audit and Performance Metrics", { italics: true, size: 20 }));

  children.push(h2("5.5 Justification of Complex Engineering Problem (CEP)"));
  children.push(p("Under the Board of Accreditation for Engineering and Technical Education (BAETE) and the international Washington Accord framework, capstone and major software development projects must satisfy the Complex Engineering Problem (CEP) criteria. Table 5.3 demonstrates how OneHUB rigorously satisfies all seven Washington Accord Knowledge Profiles (WP1 to WP7):"));

  const cepHeaders = ["CEP Attribute", "Washington Accord Definition", "OneHUB Implementation Justification"];
  const cepRows = [
    ["WP1: Depth of Knowledge Required", "Requires in-depth engineering knowledge rooted in mathematics and computing sciences.", "Architected using advanced algorithms: best-of-N sorting, multi-variable routine clash detection, and weighted CO-PO matrix transformations."],
    ["WP2: Conflicting Requirements", "Involves wide-ranging or conflicting technical, operational, or safety issues.", "Balances conflicting constraints: 25.0 credit caps vs student demand, split-lab room allocation vs teacher availability, and data transparency vs FERPA-style privacy."],
    ["WP3: Depth of Analysis", "Requires in-depth analysis of problems with no obvious single solution.", "Solves NP-hard scheduling bottlenecks with split-lab constraints and maps multi-tiered course prerequisites."],
    ["WP4: Familiarity of Issues", "Involves infrequently encountered issues or novel technology combinations.", "Pioneers the fusion of continuous OBE radar analysis, dynamic QR crypto-wallets, and live web scraping within a unified campus web system."],
    ["WP5: Extent of Applicable Codes", "Governed by standards and legal, security, and safety codes.", "Adheres to BAETE accreditation guidelines, OWASP Top 10 web security, JWT RFC 7519, and WCAG 2.1 AA accessibility standards."],
    ["WP6: Stakeholder Engagement", "Involves diverse stakeholders with divergent administrative needs.", "Accommodates six distinct roles (Students, Teachers, Advisers, Provosts, Doctors, Admins), each with tailored views and data access permissions."],
    ["WP7: Interdependence", "High-level problems with many interacting component parts.", "Features 16 interconnected modules; modifications to course enrollments ripple into attendance registers, routine clash detectors, and OBE analytics."]
  ];
  children.push(createTable(cepHeaders, cepRows, [2200, 2800, 4000]));
  children.push(p("Table 5.3: Washington Accord Complex Engineering Problem (CEP) Compliance Mapping", { italics: true, size: 20 }));

  children.push(h2("5.6 Limitations & Further Improvement"));
  children.push(p("While OneHUB provides a complete, robust campus management platform, ongoing enhancements will further expand its capabilities:"));
  children.push(p([
    boldRun("1. Native Mobile Push Notifications: "),
    normalRun("Currently, lecture reminders and status updates operate via in-app toast alerts. Future releases will integrate Firebase Cloud Messaging (FCM) and WebPush APIs for native lock-screen notifications.")
  ]));

  children.push(p([
    boldRun("2. Biometric Dining & Hall Verification: "),
    normalRun("While dynamic QR codes prevent duplicate meal redemption, integrating optical fingerprint or RFID student ID card scanners at dining hall entry gates will further streamline peak-hour throughput.")
  ]));

  children.push(p([
    boldRun("3. Commercial Mobile Payment Gateway Integration: "),
    normalRun("The current digital dining wallet uses an internal balance simulation. Future phases will incorporate commercial payment gateways (such as bKash, Nagad, and Rocket) for automated digital wallet top-ups.")
  ]));

  children.push(h2("5.7 Conclusion"));
  children.push(p("The OneHUB project successfully conceives, architects, deploys, and verifies an integrated, cloud-native academic, outcome-based education (OBE), and smart campus governance system for Rajshahi University of Engineering & Technology. By unifying sixteen distinct administrative and campus life modules into a cohesive single-page application governed by granular role-based permissions, the platform eliminates procedural bottlenecks, elevates academic transparency, enforces accreditation standards, and provides a modern digital experience for all university stakeholders. Comprehensive verification affirms sub-50ms API response latencies, 100% test case pass rates across fifteen validation suites, and rigorous compliance with Washington Accord engineering standards. OneHUB establishes a progressive benchmark for smart university ecosystems across Bangladesh."));

  return children;
}

function getChapter6() {
  const children = [];

  children.push(h1("Chapter 6: Project Management", true));

  children.push(h2("6.1 Development Methodology (Agile Scrum)"));
  children.push(p("The engineering lifecycle of OneHUB was managed using the Agile Scrum framework, organized into structured two-week sprint cycles. This iterative methodology enabled rapid feedback integration from faculty advisers and student testers, allowing continuous feature refinement, automated testing, and incremental feature delivery."));

  children.push(h2("6.2 Timeline / Gantt Chart"));
  children.push(p("Figure 6.1 presents the project Gantt chart covering the 15-week development lifecycle, from initial requirements gathering to final testing and deployment."));

  children.push(...figure(
    'docs/report_figures/fig_6_1_gantt.png',
    'Figure 6.1: 15-Week Agile Project Development Timeline & Sprint Milestone Gantt Chart',
    520,
    236
  ));

  const gHeaders = ["Phase / Milestone", "Sprint Duration", "Key Deliverables & Milestones Achieved"];
  const gRows = [
    ["Phase 1: Requirements & Architecture", "Weeks 1 - 2", "Stakeholder interviews, RUET ordinance study, system architecture design, ERD modeling"],
    ["Phase 2: Database & Core Auth Gateway", "Weeks 3 - 4", "MongoDB Atlas provisioning, Mongoose schemas, Bcrypt hashing, JWT authentication, OTP recovery"],
    ["Phase 3: Routine Designer & Reminder Cron", "Weeks 5 - 6", "Visual routine matrix, split-lab batch support, clash detection, 5m sliding cron scheduler"],
    ["Phase 4: Course Registration & Adviser Gate", "Weeks 7 - 8", "Course catalog, 25-credit ceiling enforcement, prerequisite checks, 3-tier adviser approval"],
    ["Phase 5: Attendance & Marks Gradebook", "Weeks 9 - 10", "Digital attendance logger, 75% short-percentage alerts, Best-of-N CT mark optimizer"],
    ["Phase 6: OBE Attainment & LaTeX Generator", "Weeks 11 - 12", "CO-PO matrix calculation, dynamic spider radar charts, accredited LaTeX exam generator"],
    ["Phase 7: Campus Life Modules & Scraper", "Weeks 13 - 14", "Dining QR wallet, medical booking, 24/7 ambulance hotline, blood bank, notice scraper"],
    ["Phase 8: Security Audits & Deployment", "Week 15", "Oxlint code audits, Lighthouse optimization, CEP evaluation, production deployment"]
  ];
  children.push(createTable(gHeaders, gRows, [2400, 1800, 4800]));
  children.push(p("Table 6.1: 15-Week Agile Sprint Milestone Plan", { italics: true, size: 20 }));

  children.push(h2("6.3 Team Contributions and Responsibilities"));
  children.push(p("The design, development, evaluation, and documentation of OneHUB was executed as an engineering team capstone project for Software Development Project - I (ECE-2100) under the academic supervision of Instructor Nadim Reza, Lecturer, Department of Electrical & Computer Engineering, Rajshahi University of Engineering & Technology (RUET). The project was engineered by a team of three undergraduate students:"));

  children.push(p([
    boldRun("1. Auyon Dip Sardar (Roll 2410043) — Lead Backend Architect (50% Project Contribution): "),
    normalRun("Responsible for the complete server-side engineering lifecycle, accounting for 50% of the project scope. Sourced, designed, and implemented: (a) the asynchronous Node.js and Express REST microservice architecture; (b) the multi-collection MongoDB Atlas schema, relational model bindings, and compound performance indexing; (c) the Outcome-Based Education (OBE) question paper generator engine with Bloom's cognitive taxonomy mapping and dynamic LaTeX compilation; (d) the RUET academic ordinance continuous assessment grading engine (Best 3 of 4 Class Tests) and attendance eligibility categorization (Collegiate, Non-collegiate, Discollegiate); (e) the security perimeter including JWT stateless authentication, salted Bcrypt password hashing, and granular Role-Based Access Control (RBAC); (f) multi-part media upload pipelines integrated with Cloudinary CDN; and (g) transactional email notification dispatch (Nodemailer) and emergency blood donor broadcast infrastructure.")
  ]));

  children.push(p([
    boldRun("2. Nishit Ray (Roll 2410044) — Frontend Web Architect (25% Project Contribution): "),
    normalRun("Collaborated on the client-side ecosystem (accounting for 25% of the total project scope): (a) engineered the single-page application component architecture using React 18, Vite, and Tailwind CSS; (b) formulated the responsive glassmorphism design system, dashboard layout, and Lucide React SVG iconography; (c) developed the real-time 'Next Class' countdown widget with dynamic lecture countdowns and one-click Google Calendar (.ics) export; (d) integrated camera-based QR code recognition for dining token redemption using html5-qrcode; (e) created the residential hall maintenance ticketing interface with photo-backed repair tracking; and (f) designed the emergency blood request broadcast portal and direct telephone dialer interfaces.")
  ]));

  children.push(p([
    boldRun("3. Nujhat Binta Kabir Nahira (Roll 2410046) — Mobile APK & Document Export Specialist (25% Project Contribution): "),
    normalRun("Collaborated on cross-platform mobile and reporting deliverables (accounting for 25% of the total project scope): (a) engineered the standalone cross-platform mobile client application using Google's Flutter framework (mobile/lib/), compiling and signing the native Android Package Kit (APK); (b) implemented Flutter state management using the Provider pattern, RESTful ApiService integration, and over 20 mobile screens (Routine, Attendance, Marks, Clearance, Hall, Fees); (c) established the mobile local notification engine delivering reminders 15 minutes prior to classes; (d) developed the high-resolution legal-size document export engines using html2canvas-pro for the official Course Registration Confirmation Paper and Semester Grade Sheet; (e) implemented dynamic spider radar charts for OBE Program Outcome visualization; and (f) conducted multi-device responsive layout testing across mobile and desktop viewports.")
  ]));

  children.push(p("Table 6.2 provides the explicit breakdown of module ownership, technical responsibilities, and workload allocations across the team members:"));

  const teamHeaders = ["Team Member", "Student Roll", "Primary Role", "Key Modules Owned & Delivered", "Workload %"];
  const teamRows = [
    [
      "Auyon Dip Sardar",
      "2410043",
      "Lead Backend Architect & Security Engineer",
      "Node.js/Express REST API, MongoDB Schemas & Indexes, OBE LaTeX Generator, RUET Best-of-3 CT Engine, Attendance Categorization, JWT/Bcrypt Auth & RBAC, Cloudinary CDN, Email/SMS Alerts",
      "50%"
    ],
    [
      "Nishit Ray",
      "2410044",
      "Lead Frontend Web Architect",
      "React 18 SPA Architecture, Tailwind CSS Theme System, Next Class Countdown Widget, Google Calendar Export, Dining Camera QR Scanner, Hall Maintenance Ticketing UI, Emergency Blood Broadcast",
      "25%"
    ],
    [
      "Nujhat Binta Kabir Nahira",
      "2410046",
      "Mobile APK Lead & Document Specialist",
      "Cross-Platform Flutter Mobile Application, Android APK Toolchain, Mobile Provider State & Screens, Legal-Size Registration & Grade Sheet PDF Exports, OBE Spider Radar Charts, UI/UX Usability Testing",
      "25%"
    ]
  ];
  children.push(createTable(teamHeaders, teamRows, [1800, 1200, 2200, 3600, 1000]));
  children.push(p("Table 6.2: Team Contribution Matrix (50% Backend vs 50% Frontend & Mobile APK)", { italics: true, size: 20 }));

  children.push(h2("6.4 Risk Management"));
  children.push(p("Table 6.3 outlines the risk management matrix detailing identified technical, operational, and security risks alongside proactive mitigation strategies implemented in OneHUB:"));

  const rmHeaders = ["Risk Category", "Identified Risk Event", "Severity", "Proactive Mitigation Strategy Implemented"];
  const rmRows = [
    ["Technical", "Routine double-booking during concurrent edits", "High", "Atomic MongoDB compound query checks both room and instructor schedules before committing."],
    ["Technical", "Browser canvas failure during routine export", "Medium", "Adopted html2canvas-pro to handle modern CSS oklch color functions without canvas corruption."],
    ["Operational", "Adviser approval bottlenecks before deadlines", "High", "Automated email notifications alert faculty advisers when registration packets are pending review."],
    ["Security", "Brute-force credential and OTP guessing attacks", "High", "Express rate limiting restricts login and OTP verification endpoints to 5 attempts per 15 minutes."],
    ["Security", "Dining meal token duplication and counterfeiting", "Critical", "Tokens use HMAC-SHA256 signatures with 3-minute validity, transitioning to CONSUMED upon scanning."],
    ["Data Integrity", "NoSQL injection attacks via malicious queries", "High", "Express Mongoose sanitization strips dangerous operators ($gt, $ne, $where) from request payloads."]
  ];
  children.push(createTable(rmHeaders, rmRows, [1600, 2400, 1400, 3600]));
  children.push(p("Table 6.3: Technical, Operational, and Security Risk Assessment Matrix", { italics: true, size: 20 }));

  return children;
}

function getChapter7() {
  const children = [];

  children.push(h1("Chapter 7: References", true));
  children.push(p("The following academic literature, standards documents, and technical references informed the architecture, implementation, and evaluation of OneHUB:"));

  const refs = [
    "[1] Board of Accreditation for Engineering and Technical Education (BAETE), 'Manual for Accreditation of Undergraduate Engineering Programmes,' Institution of Engineers, Bangladesh (IEB), 2nd Edition, 2019.",
    "[2] International Engineering Alliance (IEA), 'Graduate Attributes and Professional Competencies,' Washington Accord Standards Framework, Version 3, 2021.",
    "[3] Rajshahi University of Engineering & Technology (RUET), 'Academic Ordinances for Undergraduate Studies,' Office of the Registrar, RUET, Rajshahi-6204, Bangladesh, 2022.",
    "[4] M. Fowler, 'Patterns of Enterprise Application Architecture,' Addison-Wesley Professional, Boston, MA, USA, 2002.",
    "[5] R. C. Martin, 'Clean Architecture: A Craftsman's Guide to Software Structure and Design,' Prentice Hall, Upper Saddle River, NJ, USA, 2017.",
    "[6] M. Bankole and S. O. Kuyoro, 'Design and Implementation of an Automated University Course Timetabling System Using Genetic Algorithm,' International Journal of Computer Applications, vol. 182, no. 45, pp. 24-31, 2019.",
    "[7] E. Gamma, R. Helm, R. Johnson, and J. Vlissides, 'Design Patterns: Elements of Reusable Object-Oriented Software,' Addison-Wesley, Reading, MA, USA, 1994.",
    "[8] M. Jones, J. Bradley, and N. Sakimura, 'JSON Web Token (JWT),' Internet Engineering Task Force (IETF) RFC 7519, Standards Track, May 2015.",
    "[9] OWASP Foundation, 'OWASP Top 10: 2021 The Ten Most Critical Web Application Security Risks,' Open Web Application Security Project, 2021.",
    "[10] W3C Web Accessibility Initiative, 'Web Content Accessibility Guidelines (WCAG) 2.1,' World Wide Web Consortium Recommendation, Jun. 2018.",
    "[11] B. S. Bloom, 'Taxonomy of Educational Objectives: The Classification of Educational Goals,' David McKay Company, New York, NY, USA, 1956.",
    "[12] K. Chodorow, 'MongoDB: The Definitive Guide: Powerful and Scalable Data Storage,' 3rd Edition, O'Reilly Media, Sebastopol, CA, USA, 2020."
  ];

  refs.forEach(ref => {
    children.push(p(ref, { before: 100, after: 100, line: 320 }));
  });

  return children;
}

function getChapter8() {
  const children = [];

  children.push(h1("Chapter 8: Appendices", true));

  children.push(h2("Appendix A: Source Code and GitHub Repository"));
  children.push(p("The complete source code for OneHUB is version-controlled and publicly accessible for academic verification and audit:"));
  children.push(p([
    boldRun("• GitHub Repository Link: "),
    normalRun("https://github.com/Auyon-ECE-2410043/OneHUB")
  ]));
  children.push(p([
    boldRun("• Production Deployment URL: "),
    normalRun("https://one-hub-iota.vercel.app")
  ]));

  children.push(p("The repository follows a clean, decoupled directory structure:"));
  children.push(...createCodeBlock([
    "OneHUB/",
    "├── frontend/             # React 18 Single-Page Web Application",
    "│   ├── src/",
    "│   │   ├── components/   # Reusable UI widgets, Navbar, Sidebar, Countdown",
    "│   │   ├── pages/        # Routine, Registration, Marks, OBE, Dining, Hall, etc.",
    "│   │   ├── context/      # AuthContext, ThemeContext",
    "│   │   └── services/     # Axios REST API client bindings",
    "│   └── vite.config.js    # Vite compilation & dev server configuration",
    "├── mobile/               # Cross-Platform Flutter Mobile Application (Android APK)",
    "│   ├── lib/",
    "│   │   ├── screens/      # Over 20 mobile screens (Routine, Marks, Hall, Fees)",
    "│   │   ├── providers/    # Mobile state management (AuthProvider)",
    "│   │   └── services/     # Mobile REST client & local notification dispatch",
    "│   └── pubspec.yaml      # Flutter dependencies and asset registrations",
    "├── models/               # Mongoose schemas (User, Course, Routine, Mark, etc.)",
    "├── routes/               # Express RESTful route controllers & RBAC guards",
    "├── middleware/           # JWT authentication, role authorization, error handling",
    "├── services/             # Reminder schedulers, scraper cron, email notifications",
    "├── utils/                # RUET Ordinance calculations, logger, seeding scripts",
    "├── server.js             # Express API gateway entrypoint & database bootstrap",
    "└── docs/                 # Architectural figures, reports, and documentation"
  ]));

  children.push(h2("Appendix B: Application Routes and Role-Based Permissions Matrix"));
  children.push(p("Table B.1 details all primary application routes, HTTP methods, and access control permissions across user roles:"));

  const rbHeaders = ["Route Path", "HTTP Method", "Allowed Roles", "Primary Function / Academic Action"];
  const rbRows = [
    ["/api/auth/register", "POST", "Public", "Register new student or faculty account with validation"],
    ["/api/auth/login", "POST", "Public", "Authenticate user, verify password hash, issue JWT token"],
    ["/api/auth/forgot-password", "POST", "Public", "Generate 6-digit OTP and send password recovery email"],
    ["/api/auth/reset-password", "POST", "Public", "Verify OTP and update user password with Bcrypt hash"],
    ["/api/routine/slots", "GET", "All Authenticated", "Fetch weekly timetable slots filtered by semester/department"],
    ["/api/routine/slots", "POST / PUT", "Teacher, Admin", "Create or modify routine slot with real-time clash check"],
    ["/api/registration/submit", "POST", "Student", "Submit course registration packet (max 25.0 credits)"],
    ["/api/registration/review", "PATCH", "Adviser, Provost", "Approve or reject pending student registration packet"],
    ["/api/attendance/record", "POST", "Teacher", "Record class attendance and calculate collegiate percentages"],
    ["/api/marks/entry", "POST", "Teacher", "Input continuous assessment marks and Best-of-N CT scores"],
    ["/api/obe/attainment", "GET", "Teacher, Admin", "Compute Course Outcome and Program Outcome attainment vectors"],
    ["/api/dining/buy-token", "POST", "Student", "Purchase meal token and generate SHA-256 dynamic QR code"],
    ["/api/dining/redeem-token", "POST", "Admin, Staff", "Scan and redeem meal token at dining hall entry counter"],
    ["/api/medical/book", "POST", "Student, Teacher", "Schedule doctor consultation or psychologist counseling"],
    ["/api/blood/donors", "GET", "All Authenticated", "Search available blood donors filtered by blood group"],
    ["/api/notices/scraped", "GET", "All Authenticated", "Retrieve cached circulars scraped from official RUET portal"],
    ["/api/admin/system-stats", "GET", "Super-Admin", "Monitor active sessions, server uptime, and database latency"]
  ];
  children.push(createTable(rbHeaders, rbRows, [2400, 1400, 2200, 3000]));
  children.push(p("Table B.1: Complete OneHUB Application Routes, Methods, and Role Access Control Matrix", { italics: true, size: 20 }));

  children.push(h2("Appendix C: Comprehensive User Manual for Campus Stakeholders"));
  children.push(p("This user manual provides step-by-step instructions for each campus stakeholder role:"));

  children.push(h3("C.1 Student Role User Guide"));
  children.push(p([
    boldRun("1. Account Access: "),
    normalRun("Navigate to the login page, enter your RUET email and password. In case of forgotten credentials, use the 'Forgot Password' link to receive a 6-digit OTP in your inbox.")
  ]));
  children.push(p([
    boldRun("2. Routine Management: "),
    normalRun("View your weekly schedule organized by day. Use the theme selector to customize your color palette and click 'Export PNG' to download a high-DPI image of your timetable.")
  ]));
  children.push(p([
    boldRun("3. Course Registration: "),
    normalRun("Select your semester courses while monitoring the total credit counter (capped at 25.0 credits). Submit the form for your Academic Adviser's digital review.")
  ]));
  children.push(p([
    boldRun("4. Dining Token Wallet: "),
    normalRun("Purchase lunch or dinner tokens from your digital wallet. Present the generated dynamic QR code to the dining hall manager scanner at mealtime.")
  ]));
  children.push(p([
    boldRun("5. Healthcare & Blood Donor Directory: "),
    normalRun("Book appointments with campus physicians or confidential psychological counseling. Access the blood donor directory during medical emergencies with one-touch phone dialer buttons.")
  ]));

  children.push(h3("C.2 Faculty & Academic Adviser Role User Guide"));
  children.push(p([
    boldRun("1. Routine Scheduling: "),
    normalRun("Add or edit routine slots. The clash engine automatically checks room availability and instructor schedules to prevent double-booking.")
  ]));
  children.push(p([
    boldRun("2. Digital Attendance Logging: "),
    normalRun("Open your course roster, mark attendance with a single click, and view real-time calculations that highlight students below the 75% collegiate attendance mark.")
  ]));
  children.push(p([
    boldRun("3. Gradebook & Best-of-N Entry: "),
    normalRun("Enter marks for Class Tests and assignments. The system automatically drops the lowest score among multiple tests and computes final continuous assessment totals.")
  ]));
  children.push(p([
    boldRun("4. Registration Approval: "),
    normalRun("Review submitted course registration packets for advisees, verify prerequisite compliance, and digitally approve registrations with a single click.")
  ]));
  children.push(p([
    boldRun("5. OBE Attainment & Exam Paper Generation: "),
    normalRun("View real-time spider radar charts of Course Outcome attainment and generate standardized LaTeX question papers formatted to RUET academic guidelines.")
  ]));

  children.push(h3("C.3 Administrator Role User Guide"));
  children.push(p([
    boldRun("1. Campus Governance: "),
    normalRun("Monitor system health, active user counts, and concurrent sessions through the live administrative dashboard.")
  ]));
  children.push(p([
    boldRun("2. User Management: "),
    normalRun("Approve pending account registrations, manage role assignments, and oversee portal access permissions across all campus departments.")
  ]));

  return children;
}

module.exports = {
  getChapter5,
  getChapter6,
  getChapter7,
  getChapter8
};
