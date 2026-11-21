const {
  AlignmentType,
  FONT_FAMILY,
  COLOR_PRIMARY,
  COLOR_SECONDARY,
  p,
  boldRun,
  normalRun,
  h1,
  h2,
  h3,
  createTable
} = require('./report_helpers');

function getChapter1() {
  const children = [];

  children.push(h1("Chapter 1: Introduction", true));

  children.push(h2("1.1 Introduction"));
  children.push(p("In the contemporary higher education landscape, the rapid proliferation of digital technologies has fundamentally transformed academic administration, instructional delivery, and student lifecycle management. Academic institutions worldwide are progressively abandoning fragmented manual workflows in favor of centralized, automated enterprise resource planning (ERP) platforms. However, specialized technological universities present distinct organizational complexities that off-the-shelf commercial ERPs fail to adequately address. Engineering curricula require intricate laboratory scheduling, split-batch section management, strict course prerequisite validation, credit ceilings, continuous assessment computations, outcome-based education (OBE) curriculum compliance, and interconnected residential governance."));

  children.push(p("Rajshahi University of Engineering & Technology (RUET), as one of the premier public engineering universities in Bangladesh, encompasses over 4,500 undergraduate students across multiple engineering faculties, hundreds of faculty members, administrative staff, residential halls, and dedicated healthcare facilities. Historically, the management of daily academic activities at RUET—ranging from class routine design and course registrations to continuous mark entries and OBE attainment reporting—has relied on a disparate combination of manual paper registers, physical notice boards, scattered Google Sheets, and ad-hoc social media communication channels."));

  children.push(p("To address these profound structural bottlenecks, this project presents 'OneHUB', an integrated, cloud-native, responsive academic and campus governance platform engineered specifically to serve the holistic needs of RUET. OneHUB unifies student academic management, continuous assessment, outcome-based educational analytics, residential hall governance, smart dining facilities, medical care services, and administrative surveillance into a cohesive, secure, and user-friendly digital ecosystem. Built across modern web technologies (React 18, Vite, Tailwind CSS) and cross-platform mobile architecture (Flutter, Android APK), OneHUB bridges administrative silos and empowers students, faculty members, and university administrators alike."));

  children.push(h2("1.2 Problem Statement"));
  children.push(p("A comprehensive pre-development operational audit conducted across multiple academic departments and residential halls at RUET revealed critical operational deficiencies that severely hindered institutional efficiency, data integrity, and student satisfaction:"));

  children.push(p([
    boldRun("1. Complex Routine Clashes and Split-Lab Coordination: "),
    normalRun("In engineering education, theory classes are conducted for full cohorts (e.g., 60 students), while laboratory practicals must be partitioned into split batches (Batch 1: Roll 1-30, Batch 2: Roll 31-60) to accommodate physical lab bench equipment constraints. Manual scheduling frequently results in instructor time conflicts, room double-booking, and students missing practical sessions due to schedule ambiguities.")
  ]));

  children.push(p([
    boldRun("2. Cumbersome Course Registration and Approval Latency: "),
    normalRun("The traditional semester registration workflow requires students to manually fill physical paper forms, track down their designated Academic Adviser for physical signatures, obtain clearance from Residential Hall Provosts, and submit physical receipts to the Academic Section. This multi-day manual endeavor introduces substantial administrative latency, lost forms, and zero real-time enforcement of maximum credit ceilings (capped at 25.0 credits per semester) or prerequisite compliance.")
  ]));

  children.push(p([
    boldRun("3. Manual Continuous Assessment and Best-of-N Calculations: "),
    normalRun("Under RUET academic ordinances, course instructors conduct three to four Class Tests (CTs) per semester, with the best three scores determining the final continuous assessment mark. Calculating averages across hundreds of students by hand is prone to arithmetic transcription errors and delays mark publication until final exam preparations.")
  ]));

  children.push(p([
    boldRun("4. Unimplemented Outcome-Based Education (OBE) Reporting: "),
    normalRun("In accordance with the Board of Accreditation for Engineering and Technical Education (BAETE) and Washington Accord criteria, engineering departments are mandated to compute Course Outcome (CO) and Program Outcome (PO) attainment matrices. Faculty members struggle to manually map individual exam questions to Bloom's taxonomy cognitive levels and calculate multi-variable attainment vectors without dedicated software tools.")
  ]));

  children.push(p([
    boldRun("5. Fragmented Dining, Hall Allocation, and Health Utilities: "),
    normalRun("Outside academics, hall resident students queue for plastic dining tokens during peak meal times, face delayed maintenance repairs due to missing physical complaint logbooks, and struggle to mobilize blood donors during medical emergencies at Rajshahi Medical College Hospital.")
  ]));

  children.push(h2("1.3 Project Aims and Objectives"));
  children.push(p("The primary objective of this project is to conceptualize, engineer, evaluate, and deploy 'OneHUB'—a centralized digital campus automation ecosystem tailored specifically to the statutory ordinances and daily operational workflows of RUET. The specific technical aims are:"));

  children.push(p([
    boldRun("1. Conflict-Free Visual Routine Engine: "),
    normalRun("Develop an interactive administrative routine builder that performs real-time double-booking clash detection across physical classrooms, split laboratory batches, and teacher schedules, with one-click high-DPI visual schedule export.")
  ]));

  children.push(p([
    boldRun("2. Automated Course Registration Workflow: "),
    normalRun("Implement a validated, credit-capped course registration pipeline with digital adviser approvals, dynamic status tracking, and automated generation of official legal-size registration confirmation documents.")
  ]));

  children.push(p([
    boldRun("3. Cross-Platform Mobile Experience (Flutter & APK): "),
    normalRun("Engineer a responsive cross-platform mobile application compiled to native Android APK using the Flutter framework, enabling students and faculty to access academic schedules, clearance status, and real-time push notifications on mobile devices.")
  ]));

  children.push(p([
    boldRun("4. Continuous Attendance & Exam Eligibility Tracking: "),
    normalRun("Provide faculty with one-click roll-call interfaces and automatically categorize students into RUET statutory exam eligibility brackets (Collegiate: ≥75%, Non-collegiate: 60%–74%, Discollegiate: <60%).")
  ]));

  children.push(p([
    boldRun("5. Automated RUET Ordinance CT Calculation: "),
    normalRun("Build an automated grading engine that parses continuous assessment inputs, dynamically selects the highest N Class Test scores (Best 3 of 4), and computes final student grade distributions.")
  ]));

  children.push(p([
    boldRun("6. Accredited OBE Attainment & Radar Visualization: "),
    normalRun("Formulate mathematical engines to calculate CO-PO attainment matrices against customizable benchmark thresholds (60%), generate dynamic visual spider radar charts, and produce accredited LaTeX examination papers.")
  ]));

  children.push(p([
    boldRun("7. Predictive CGPA Target Simulator: "),
    normalRun("Design a dynamic analytical calculator that tracks historical GPA trends and computes the exact future semester SGPA required to achieve a target graduation CGPA.")
  ]));

  children.push(p([
    boldRun("8. Cryptographic Dining Token QR Wallet: "),
    normalRun("Deploy a secure dining hall meal management system featuring digital balance management, automated token purchase, and HMAC-SHA256 encrypted dynamic QR codes with 3-minute validity to prevent token duplication.")
  ]));

  children.push(p([
    boldRun("9. Comprehensive Campus Welfare Services: "),
    normalRun("Incorporate integrated portals for residential hall seat allocation, campus medical center doctor appointments with dedicated psychologist consultation, an emergency blood donor directory with direct dialer links, and an automated scraper for official RUET circulars.")
  ]));

  children.push(h2("1.4 Significance of the Study"));
  children.push(p("The deployment of OneHUB carries profound institutional, academic, and socio-technical significance for Rajshahi University of Engineering & Technology. Firstly, it represents a decisive transition from labor-intensive, error-prone bureaucratic paper processes to an instantaneous, audit-trailed, and environmentally sustainable digital governance model. Administrative cycle times for course registrations and continuous mark processing are reduced from several days to mere seconds."));

  children.push(p("Secondly, from an academic accreditation perspective, OneHUB directly empowers academic departments to fulfill BAETE and Washington Accord criteria. The automated calculation and visual rendering of CO-PO attainment matrices remove subjective estimations, providing external evaluation committees with mathematically verified, granular evidence of student competency."));

  children.push(p("Finally, OneHUB significantly enhances campus life and student well-being. By consolidating healthcare appointments, emergency blood mobilization, residential hall management, and dining hall tokens into a unified mobile-first web interface and Android APK, the platform minimizes student stress and fosters a vibrant, technologically forward campus community."));

  return children;
}

function getChapter2() {
  const children = [];

  children.push(h1("Chapter 2: Software & Hardware Requirements", true));

  children.push(h2("2.1 Introduction"));
  children.push(p("Architecting an enterprise-grade university operating system necessitates a robust, scalable, and resilient technological foundation. OneHUB is engineered using modern web standards, lightweight client-side execution models, cross-platform mobile architecture, and cloud-native backend services. This chapter delineates the hardware specifications, core software runtime environments, frameworks, development utilities, and programming languages utilized to construct the platform."));

  children.push(h2("2.2 Software Requirements"));
  children.push(p("The software architecture of OneHUB adheres to a modern, decoupled client-server paradigm. The frontend is built as a single-page application (SPA) optimized for high rendering performance, zero reload latencies, and cross-platform mobile compatibility. In parallel, a standalone cross-platform mobile application compiled for Android (APK) provides native device performance, push notifications, and quick utility access. The backend is structured as a RESTful microservice API communicating over secure TLS/HTTPS channels with JSON serialization."));

  const hwHeaders = ["Component", "Minimum Requirement", "Recommended Specification"];
  const hwRows = [
    ["Server Processor (CPU)", "Dual-Core 2.0 GHz x86-64 / ARM64", "Quad-Core Intel Xeon / AMD EPYC 3.2 GHz"],
    ["Server Memory (RAM)", "2 GB DDR4 ECC RAM", "8 GB DDR4 / DDR5 ECC RAM"],
    ["Server Storage", "10 GB NVMe SSD Storage", "50 GB High-IOPS NVMe SSD"],
    ["Network Bandwidth", "100 Mbps uplink", "1 Gbps redundant low-latency network"],
    ["Client Hardware (PC)", "Any PC with modern browser (Chrome, Edge, Firefox)", "Quad-core PC with 8GB RAM, 1080p display"],
    ["Client Mobile (Android)", "Android 8.0 (Oreo, API 26), 2GB RAM", "Android 12+ (API 31+), 4GB+ RAM, 1080x2400 AMOLED"]
  ];
  children.push(createTable(hwHeaders, hwRows, [2600, 3200, 3400]));
  children.push(p("Table 2.1: Minimum and Recommended Hardware Specifications", { alignment: AlignmentType.CENTER, italics: true, size: 20 }));

  children.push(h2("2.3 Programming Languages & Frameworks Used"));
  children.push(p("The implementation of OneHUB leverages a proven, battle-tested modern full-stack web and mobile engineering ecosystem:"));

  const swHeaders = ["Layer / Role", "Technology / Framework", "Version", "Key Functionality / Purpose"];
  const swRows = [
    ["Frontend Web Core", "React.js", "18.3.1", "Component-driven declarative UI rendering, virtual DOM reconciliation"],
    ["Web Build Tooling", "Vite", "5.4.2", "Ultra-fast Hot Module Replacement (HMR) and optimized Rollup bundling"],
    ["Styling Engine", "Tailwind CSS", "3.4.1", "Utility-first CSS, dark/light theme tokens, responsive flex/grid layouts"],
    ["Mobile Framework", "Flutter", "3.24.x", "Cross-platform mobile UI framework compiling to native ARM/x86 Android APK"],
    ["Mobile Language", "Dart", "3.5.x", "Sound null-safe object-oriented language powering the mobile client app"],
    ["Backend Runtime", "Node.js", "20.18.0 LTS", "Asynchronous, event-driven server runtime for high concurrent I/O"],
    ["Web Application Framework", "Express.js", "4.19.2", "RESTful routing, middleware pipelining, request validation, RBAC"],
    ["Database Server", "MongoDB Atlas", "7.0.x", "Distributed NoSQL document database, flexible schema indexing, ACID transactions"],
    ["Object Modeling", "Mongoose ODM", "8.5.1", "Schema validation, population hooks, query chaining, virtual fields"],
    ["Client Icons", "Lucide React", "0.428.0", "Crisp, lightweight SVG iconography across all portal views"],
    ["Canvas Rasterization", "html2canvas-pro", "1.5.8", "Client-side high-DPI routine image generation with modern oklch support"],
    ["Camera QR Scanner", "html5-qrcode", "2.3.8", "Real-time browser-based video feed QR code recognition for dining tokens"],
    ["Security & Auth", "JSON Web Tokens (JWT)", "9.0.2", "Stateless, HMAC-SHA256 encrypted authentication tokens"],
    ["Password Hashing", "Bcrypt.js", "2.4.3", "Salted adaptive cryptographic hashing with work factor 10"],
    ["Cloud Media Storage", "Cloudinary SDK", "1.41.0", "Cloud image storage, face crop transformations, secure CDN delivery"]
  ];
  children.push(createTable(swHeaders, swRows, [1600, 2200, 1400, 4000]));
  children.push(p("Table 2.2: Software Stack and Core Framework Versions (Web & Mobile Flutter APK)", { alignment: AlignmentType.CENTER, italics: true, size: 20 }));

  children.push(h2("2.4 Development Tools (IDE, Version Control, Libraries)"));
  children.push(p("The development and engineering lifecycle of OneHUB was conducted utilizing industry-standard developer tooling:"));
  children.push(p([
    boldRun("1. Integrated Development Environments (IDEs): "),
    normalRun("Visual Studio Code (v1.95), Android Studio (Koala Feature Drop), and Antigravity AI IDE equipped with Flutter/Dart tools, ESLint, Prettier, Tailwind CSS IntelliSense, and MongoDB Compass extensions for real-time schema inspection.")
  ]));

  children.push(p([
    boldRun("2. Mobile Build Toolchain: "),
    normalRun("Android SDK Build-Tools (v34.0.0), Java Development Kit (OpenJDK 17), and Gradle 8.3 build automation engine used to compile, sign, and optimize release Android Package Kits (APKs).")
  ]));

  children.push(p([
    boldRun("3. Version Control & CI/CD: "),
    normalRun("Git distributed version control coupled with GitHub for repository management, automated branch protection, pull request reviews, and GitHub Actions continuous integration pipelines.")
  ]));

  children.push(p([
    boldRun("4. API Testing & Profiling: "),
    normalRun("Postman and Bruno HTTP Client used for comprehensive endpoint mocking, JSON schema verification, header assertion, and performance benchmarking.")
  ]));

  children.push(p([
    boldRun("5. Code Quality & Linting: "),
    normalRun("Oxlint, ESLint, and Dart Analyze were configured to enforce strict coding standards, eliminating runtime memory leaks, unhandled promise rejections, and unused dependencies.")
  ]));

  children.push(h2("2.5 Used Languages"));
  children.push(p("OneHUB integrates several specialized programming and markup languages, each deployed to maximize performance and maintainability across specific application tiers:"));

  children.push(p([
    boldRun("• JavaScript (ECMAScript 2023): "),
    normalRun("The primary language of both web client and server layers. Features modern asynchronous paradigms (async/await), optional chaining, object destructuring, and functional array transformations (map, filter, reduce).")
  ]));

  children.push(p([
    boldRun("• Dart (v3.5+): "),
    normalRun("The modern, typed, sound null-safe programming language powering the Flutter mobile client application, handling mobile state providers, native Android channels, and local notification dispatch.")
  ]));

  children.push(p([
    boldRun("• HTML5 (Hypertext Markup Language 5): "),
    normalRun("Provides semantic document structuring, accessible ARIA attributes, canvas rendering contexts, and native multimedia embedding.")
  ]));

  children.push(p([
    boldRun("• CSS3 & PostCSS: "),
    normalRun("Utilized via Tailwind CSS utility classes to achieve glassmorphism, responsive breakpoints, backdrop filters, CSS grid alignments, and smooth hardware-accelerated transitions.")
  ]));

  children.push(p([
    boldRun("• JSON (JavaScript Object Notation): "),
    normalRun("Standard data interchange format across all REST API payloads, client state stores, and MongoDB document persistence.")
  ]));

  children.push(p([
    boldRun("• LaTeX: "),
    normalRun("Specialized typesetting syntax generated dynamically by the OBE Exam Generator module to render professional, accredited examination question papers.")
  ]));

  children.push(p([
    boldRun("• PowerShell & Bash: "),
    normalRun("Scripting languages utilized for automated deployment, build pipeline verification, environment synchronization, and graphic diagram generation.")
  ]));

  return children;
}

module.exports = {
  getChapter1,
  getChapter2
};
