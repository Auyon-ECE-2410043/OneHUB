const {
  AlignmentType,
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

function getChapter4() {
  const children = [];

  children.push(h1("Chapter 4: System Implementation", true));

  children.push(h2("4.1 Introduction"));
  children.push(p("System implementation translates conceptual system designs, entity schemas, and user experience requirements into executable, production-grade software artifacts. OneHUB is deployed as an enterprise web application engineered with high modularity, strict separation of concerns, and defensive programming standards. This chapter details the multi-tiered system architecture, provides comprehensive module-by-module implementation explanations accompanied by concrete working live examples across all sixteen functional portals, formulates core algorithmic engines, and details the robust cybersecurity perimeter protecting sensitive institutional data."));

  children.push(h2("4.2 System Architecture Overview"));
  children.push(p("OneHUB is architected upon a four-tier distributed cloud-native model comprising: (1) the Presentation Layer (Client Tier), (2) the Security and API Gateway Layer, (3) the Microservice Domain Processing Layer, and (4) the Distributed Persistence Layer. Figure 1.1 illustrates the structural relationship and data communications bridging these tiers."));

  children.push(...figure(
    'docs/report_figures/fig_1_1_architecture.png',
    'Figure 1.1: High-Level Distributed Architecture of OneHUB (Client, API Gateway, Services, Data)',
    520,
    325
  ));

  children.push(p("The client tier delivers a single-page application built on React 18, bundled with Vite for near-instant rendering. When a client initiates a request, it traverses TLS 1.3 encrypted HTTPS channels to the Express API Gateway. The gateway executes preliminary security routines—evaluating CORS whitelists, rate limiting brute-force attacks, sanitizing request bodies against NoSQL injection, and validating cryptographic JSON Web Tokens. Validated requests are routed to isolated domain controller engines (Routine, Registration, Attendance, Marks, OBE, Dining, Medical, Scraper, AI), which interact transactionally with MongoDB Atlas document clusters."));

  children.push(h2("4.3 Module-wise Implementation & Working Live Examples"));
  children.push(p("To demonstrate the operational depth of OneHUB, this section presents all sixteen integrated portal modules. Each module is documented with its operational objective, client-side input parameters, concrete live API request payloads, backend business logic validations, live JSON response payloads, and rendered user interface states, using the real academic profile of Student Auyon Dip Sardar (Roll No: 2410043, 2nd Year 1st Semester, Department of Electrical & Computer Engineering, RUET)."));

  // ==========================================
  // Module 1: Auth & OTP Recovery
  // ==========================================
  children.push(h3("4.3.1 Module 1: Authentication, Role-Based Access Control (RBAC), and OTP Password Recovery"));
  children.push(p([
    boldRun("Operational Objective: "),
    normalRun("Provide secure, multi-tier user authentication, granular role-based route gating, and self-service password recovery utilizing time-limited, cryptographic 6-digit One-Time Passwords (OTPs) delivered directly to official student/faculty email addresses.")
  ]));

  children.push(p([
    boldRun("Working Live Example Scenario: "),
    normalRun("Student Auyon Dip Sardar forgets his account password and initiates an automated password recovery sequence via the OneHUB portal.")
  ]));

  children.push(h4("Step 1: Client OTP Dispatch Request"));
  children.push(p("The student enters his registered academic email address into the password recovery interface. The client issues an asynchronous POST request to the authentication gateway:"));
  children.push(...createCodeBlock([
    "POST /api/auth/forgot-password HTTP/1.1",
    "Host: onehub.ruet.ac.bd",
    "Content-Type: application/json",
    "",
    "{",
    '  "email": "auyon.dip@ece.ruet.ac.bd"',
    "}"
  ]));

  children.push(h4("Step 2: Backend Processing & Verification"));
  children.push(p("The authentication service queries the Users collection. Upon locating the record matching Roll 2410043, the server generates a cryptographically secure 6-digit pseudo-random OTP (`842915`) using `crypto.randomInt(100000, 999999)`, sets `resetPasswordExpires = Date.now() + 600000` (10 minutes validity), hashes the OTP token, and saves the user document. The NodeMailer transport immediately dispatches a styled HTML email containing the OTP code."));

  children.push(h4("Step 3: Password Reset Execution & Response"));
  children.push(p("Upon receiving the email, Auyon submits the OTP along with his desired new password:"));
  children.push(...createCodeBlock([
    "POST /api/auth/reset-password HTTP/1.1",
    "Content-Type: application/json",
    "",
    "{",
    '  "email": "auyon.dip@ece.ruet.ac.bd",',
    '  "otp": "842915",',
    '  "newPassword": "SecureRuetPassword@2026"',
    "}",
    "",
    "HTTP/1.1 200 OK",
    "{",
    '  "success": true,',
    '  "message": "Password successfully reset. You may now log in with your new credentials."',
    "}"
  ]));
  children.push(p("The password is salted with Bcrypt (cost factor 10) and saved. The OTP fields are cleared to prevent replay attacks."));

  // ==========================================
  // Module 2: Visual Routine Generator
  // ==========================================
  children.push(h3("4.3.2 Module 2: Interactive Visual Routine Generator & Dynamic Class Scheduler"));
  children.push(p([
    boldRun("Operational Objective: "),
    normalRun("Deliver an interactive, drag-and-drop weekly timetable designer specifically configured for RUET engineering schedules. Supports split-lab batch assignments (1st 30 / 2nd 30), dedicated Tea (10:30-10:50) and Lunch (1:20-2:30) breaks, real-time room/teacher clash detection, custom color palettes, and client-side high-DPI PNG export.")
  ]));

  children.push(...figure(
    'docs/report_figures/fig_4_1_routine_workflow.png',
    'Figure 4.1: Visual Routine Generator, Conflict Prevention, and PNG Export Engine',
    520,
    213
  ));

  children.push(p([
    boldRun("Working Live Example Scenario: "),
    normalRun("The Department Routine Committee schedules a theory lecture for ECE 2101 (Electronic Devices and Circuits) with teacher 'MKG' (Moloy Kumar Ghosh) in Room 304 on Sunday from 08:00 AM to 09:40 AM for 2nd Year 1st Semester students.")
  ]));

  children.push(h4("Client Routine Slot Submission Payload:"));
  children.push(...createCodeBlock([
    "POST /api/routine/slots HTTP/1.1",
    "Authorization: Bearer <ADMIN_OR_TEACHER_JWT_TOKEN>",
    "Content-Type: application/json",
    "",
    "{",
    '  "day": "Sunday",',
    '  "startTime": "08:00",',
    '  "endTime": "09:40",',
    '  "courseCode": "ECE 2101",',
    '  "teacherInitials": "MKG",',
    '  "roomNumber": "Room 304",',
    '  "semester": "2nd Year 1st Semester",',
    '  "department": "ECE",',
    '  "labBatch": "ALL"',
    "}"
  ]));

  children.push(p("The clash engine executes an atomic MongoDB aggregation query checking if Room 304 or Instructor MKG is booked on Sunday during any overlapping time window. Finding zero conflicts, the slot is committed and broadcast to connected clients."));

  // ==========================================
  // Module 3: Lecture Reminder Scheduler
  // ==========================================
  children.push(h3("4.3.3 Module 3: Lecture Reminder & Notification Scheduler"));
  children.push(p([
    boldRun("Operational Objective: "),
    normalRun("Operate an autonomous, low-overhead background sliding-window cron worker that evaluates active routines and delivers proactive in-app notifications to students 15 minutes prior to scheduled lectures.")
  ]));

  children.push(p([
    boldRun("Working Live Example Scenario: "),
    normalRun("On Sunday at 07:45 AM, the background cron worker evaluates upcoming classes for Student Auyon Dip Sardar. It identifies ECE 2101 scheduled at 08:00 AM in Room 304.")
  ]));

  children.push(h4("Cron Dispatch Logic & In-App Notification Payload:"));
  children.push(...createCodeBlock([
    "// lectureReminderService.js cron execution at 07:45:00 AM",
    "Target Window: [2026-05-17T07:55:00Z to 2026-05-17T08:05:00Z]",
    "Identified Slot: ECE 2101 | MKG | Room 304 | Starts: 08:00 AM",
    "",
    "Dispatched Client Toast Notification:",
    "{",
    '  "type": "LECTURE_REMINDER",',
    '  "title": "Upcoming Class Alert (Starts in 15 mins)",',
    '  "message": "ECE 2101: Electronic Devices & Circuits with Moloy Kumar Ghosh (MKG) in Room 304.",',
    '  "timestamp": "2026-05-17T07:45:02.114Z"',
    "}"
  ]));

  // ==========================================
  // Module 4: Course Registration & Approval
  // ==========================================
  children.push(h3("4.3.4 Module 4: Online Course Registration, Credit Limiting, and 3-Tier Adviser Approval Gate"));
  children.push(p([
    boldRun("Operational Objective: "),
    normalRun("Enforce strict academic ordinance compliance by verifying course prerequisites, capping registered credits at a maximum of 25.0, and managing a 3-tier digital sign-off pipeline involving the Student, Academic Adviser (Moloy Kumar Ghosh), and Residential Hall Provost.")
  ]));

  children.push(p([
    boldRun("Working Live Example Scenario: "),
    normalRun("Auyon Dip Sardar registers for his 2nd Year 1st Semester curriculum totaling 21.5 credits across 5 theory and 4 laboratory courses.")
  ]));

  children.push(h4("Course Registration Request Payload:"));
  children.push(...createCodeBlock([
    "POST /api/registration/submit HTTP/1.1",
    "Authorization: Bearer <STUDENT_JWT_AUYON>",
    "Content-Type: application/json",
    "",
    "{",
    '  "studentId": "664c1f9b8a1c9e0012345678",',
    '  "rollNumber": "2410043",',
    '  "semester": "2nd Year 1st Semester",',
    '  "academicSession": "2024-2025",',
    '  "selectedCourses": [',
    '    { "courseCode": "ECE 2101", "credits": 3.00 },',
    '    { "courseCode": "ECE 2102", "credits": 1.50 },',
    '    { "courseCode": "ECE 2103", "credits": 3.00 },',
    '    { "courseCode": "ECE 2104", "credits": 1.50 },',
    '    { "courseCode": "MATH 2109", "credits": 3.00 },',
    '    { "courseCode": "HUM 2109", "credits": 3.00 },',
    '    { "courseCode": "ECE 2100", "credits": 1.50 }',
    "  ],",
    '  "totalCredits": 16.50',
    "}"
  ]));

  children.push(p("The backend verifies that `totalCredits <= 25.0` (16.50 <= 25.0 is valid) and confirms prerequisite ECE 1201 was passed. The record is transitioned to `Pending_Adviser_Review`. When Adviser Moloy Kumar Ghosh clicks 'Approve Registration' in his faculty portal, the status updates to `Approved`, generating a digitally signed registration clearance token."));

  // ==========================================
  // Module 5: Attendance Tracking & Warnings
  // ==========================================
  children.push(h3("4.3.5 Module 5: Digital Attendance Tracking & 75% Short-Attendance Warning System"));
  children.push(p([
    boldRun("Operational Objective: "),
    normalRun("Enable rapid, mobile-friendly attendance recording for faculty, automatically compute aggregate percentages, and immediately issue red visual warning banners for students falling below the statutory 75% collegiate attendance mark.")
  ]));

  children.push(p([
    boldRun("Working Live Example Scenario: "),
    normalRun("Faculty member Moloy Kumar Ghosh logs attendance for course ECE 2101 on May 17, 2026. Out of 60 students, Roll 2410043 (Auyon) is marked Present.")
  ]));

  children.push(h4("Teacher Batch Attendance Submission:"));
  children.push(...createCodeBlock([
    "POST /api/attendance/record HTTP/1.1",
    "Authorization: Bearer <TEACHER_JWT_MKG>",
    "Content-Type: application/json",
    "",
    "{",
    '  "courseCode": "ECE 2101",',
    '  "date": "2026-05-17",',
    '  "attendees": [',
    '    { "rollNumber": "2410043", "status": "Present" },',
    '    { "rollNumber": "2410044", "status": "Absent" },',
    '    { "rollNumber": "2410045", "status": "Present" }',
    "  ]",
    "}"
  ]));

  children.push(p("The student dashboard queries aggregate attendance. For Auyon: Total Classes: 28, Attended: 24 (85.71% - Status: Collegiate). For Roll 2410044: Total Classes: 28, Attended: 19 (67.86% - Red Alert: Non-Collegiate Status < 75%)."));

  // ==========================================
  // Module 6: Continuous Assessment & Best-of-N
  // ==========================================
  children.push(h3("4.3.6 Module 6: Continuous Assessment, Marks Entry, and Best-of-N Class Test Optimizer"));
  children.push(p([
    boldRun("Operational Objective: "),
    normalRun("Provide an intuitive continuous assessment gradebook that records multiple Class Tests, automatically selects the highest N scores (Best-of-3 out of 4), and computes weighted internal marks out of 30.")
  ]));

  children.push(p([
    boldRun("Working Live Example Scenario: "),
    normalRun("Student Auyon Dip Sardar takes 4 Class Tests in ECE 2101. The Best-of-3 algorithm dynamically drops his lowest score and averages the top three.")
  ]));

  children.push(h4("Mark Ledger Record & Calculation Payload:"));
  children.push(...createCodeBlock([
    "Class Test Scores for Roll 2410043 in ECE 2101 (Max 20 marks each):",
    "CT1: 18.0 / 20.0",
    "CT2: 14.5 / 20.0  <- Lowest Score (Dropped)",
    "CT3: 19.5 / 20.0",
    "CT4: 17.0 / 20.0",
    "",
    "Best 3 Scores Selected: [19.5, 18.0, 17.0]",
    "Average CT Score = (19.5 + 18.0 + 17.0) / 3 = 18.17 / 20.0 (90.85%)",
    "Attendance Contribution (85.71%): 7.0 / 8.0",
    "Continuous Assessment Total: 18.17 + 7.0 = 25.17 / 30.0"
  ]));

  // ==========================================
  // Module 7: OBE CO-PO Attainment & Radar Chart
  // ==========================================
  children.push(h3("4.3.7 Module 7: Outcome-Based Education (OBE) CO-PO Attainment & Radar Visualization Engine"));
  children.push(p([
    boldRun("Operational Objective: "),
    normalRun("Quantify student learning outcomes against BAETE accreditation criteria, calculating Course Outcome (CO) attainment percentages against a 60% threshold, mapping them to Program Outcomes (PO1-PO12), and rendering interactive spider radar charts.")
  ]));

  children.push(...figure(
    'docs/report_figures/fig_4_2_obe_flow.png',
    'Figure 4.2: Outcome-Based Education (OBE) CO-PO Calculation & Spider Radar Matrix Pipeline',
    520,
    213
  ));

  children.push(p([
    boldRun("Working Live Example Scenario: "),
    normalRun("Evaluation of Course ECE 2101 across four defined Course Outcomes for the 24 Series student cohort.")
  ]));

  children.push(h4("OBE CO Attainment Results Payload:"));
  children.push(...createCodeBlock([
    "GET /api/obe/attainment?courseCode=ECE2101 HTTP/1.1",
    "",
    "HTTP/1.1 200 OK",
    "{",
    '  "courseCode": "ECE 2101",',
    '  "benchmarkThreshold": 60.0,',
    '  "coAttainment": [',
    '    { "coId": "CO1", "description": "Analyze semiconductor physics", "bloom": "C4", "attained": 78.4, "target": 65.0, "status": "ATTAINED" },',
    '    { "coId": "CO2", "description": "Design BJT & MOSFET amplifiers", "bloom": "C6", "attained": 71.2, "target": 60.0, "status": "ATTAINED" },',
    '    { "coId": "CO3", "description": "Evaluate frequency response", "bloom": "C5", "attained": 64.8, "target": 60.0, "status": "ATTAINED" },',
    '    { "coId": "CO4", "description": "Simulate SPICE circuits", "bloom": "C3", "attained": 82.5, "target": 70.0, "status": "ATTAINED" }',
    '  ],',
    '  "poProjection": { "PO1": 78.4, "PO2": 71.2, "PO3": 75.6, "PO5": 82.5 }',
    "}"
  ]));

  // ==========================================
  // Module 8: Dynamic CGPA Predictor
  // ==========================================
  children.push(h3("4.3.8 Module 8: Academic Performance Analytics & Dynamic Target CGPA Predictor"));
  children.push(p([
    boldRun("Operational Objective: "),
    normalRun("Enable students to analyze historical semester GPAs, track cumulative CGPA progression, and simulate target graduation CGPAs to determine the precise SGPA required across future semesters.")
  ]));

  children.push(p([
    boldRun("Working Live Example Scenario: "),
    normalRun("Student Auyon Dip Sardar has completed 38.5 credits with a CGPA of 3.74. He targets graduating with a First Class Honors CGPA of 3.80 across the 160-credit engineering program.")
  ]));

  children.push(h4("Simulation Logic & Output:"));
  children.push(...createCodeBlock([
    "Input Completed Credits: 38.50 | Current CGPA: 3.740",
    "Total Program Credits: 160.00 | Remaining Credits: 121.50",
    "Desired Target CGPA: 3.800",
    "",
    "Formula: Required_SGPA = ((Target_CGPA * Total_Credits) - (Current_CGPA * Completed_Credits)) / Remaining_Credits",
    "Calculation: ((3.80 * 160.0) - (3.74 * 38.5)) / 121.5 = (608.0 - 143.99) / 121.5 = 464.01 / 121.5 = 3.819",
    "",
    "UI Feedback: 'To achieve your target CGPA of 3.80, you must maintain an average SGPA of 3.82 across remaining semesters.'"
  ]));

  // ==========================================
  // Module 9: Hall Seat Allocation
  // ==========================================
  children.push(h3("4.3.9 Module 9: Residential Hall Seat Allocation & Provost Review System"));
  children.push(p([
    boldRun("Operational Objective: "),
    normalRun("Digitize the competitive residential hall room allocation process based on home district distance, academic CGPA merit, and provost digital authorization.")
  ]));

  children.push(p([
    boldRun("Working Live Example Scenario: "),
    normalRun("Auyon applies for residential accommodation at Shahid Abdul Hamid Hall. Provost reviews room occupancy in Block B and allocates Room 208, Seat 2.")
  ]));

  children.push(h4("Provost Seat Allocation Request Payload:"));
  children.push(...createCodeBlock([
    "POST /api/hall/allocate-seat HTTP/1.1",
    "Authorization: Bearer <PROVOST_JWT>",
    "Content-Type: application/json",
    "",
    "{",
    '  "applicationId": "664c3a1e9c2d1b0023456789",',
    '  "studentId": "664c1f9b8a1c9e0012345678",',
    '  "rollNumber": "2410043",',
    '  "hallName": "Shahid Abdul Hamid Hall",',
    '  "allocatedRoom": "Room 208",',
    '  "allocatedSeat": "Seat 2",',
    '  "effectiveSession": "2024-2025",',
    '  "provostApprovalDate": "2026-05-18T10:30:00Z"',
    "}"
  ]));

  // ==========================================
  // Module 10: Dining QR-Token Wallet
  // ==========================================
  children.push(h3("4.3.10 Module 10: Smart Dining Hall QR-Token Wallet & Meal Management"));
  children.push(p([
    boldRun("Operational Objective: "),
    normalRun("Eliminate paper meal tokens and physical cash queues through a digital wallet with instant meal token purchase and HMAC-SHA256 encrypted dynamic QR codes with 3-minute validity to prevent token copying or reuse.")
  ]));

  children.push(p([
    boldRun("Working Live Example Scenario: "),
    normalRun("Auyon purchases a Lunch token for 40 BDT at Shahid Abdul Hamid Hall dining hall and presents the dynamic QR code to the dining manager scanner.")
  ]));

  children.push(h4("Dining Token Purchase & QR Payload:"));
  children.push(...createCodeBlock([
    "POST /api/dining/buy-token HTTP/1.1",
    "Authorization: Bearer <STUDENT_JWT_AUYON>",
    "Content-Type: application/json",
    "",
    "{",
    '  "mealType": "Lunch",',
    '  "hallName": "Shahid Abdul Hamid Hall",',
    '  "price": 40.0',
    "}",
    "",
    "HTTP/1.1 201 Created",
    "{",
    '  "tokenId": "664c4b8f0a3e2c0034567890",',
    '  "qrPayload": "ONEHUB_MEAL_TOKEN:664c4b8f0a3e2c0034567890:2410043:1747569600:sha256_sig_9f83a",',
    '  "expiresInSeconds": 180,',
    '  "status": "ACTIVE"',
    "}"
  ]));
  children.push(p("When the dining hall manager scans the QR code at the serving counter, the backend verifies the signature, confirms `status == 'ACTIVE'`, transitions the record to `CONSUMED`, and increments the daily meal ledger."));

  // ==========================================
  // Module 11: Medical Center & Ambulance
  // ==========================================
  children.push(h3("4.3.11 Module 11: Campus Medical Center Appointment Booking & 24/7 Ambulance Dispatch"));
  children.push(p([
    boldRun("Operational Objective: "),
    normalRun("Provide digital appointment scheduling for on-campus healthcare officers, private mental health and counseling bookings, and one-click emergency dispatch for the RUET campus ambulance.")
  ]));

  children.push(p([
    boldRun("Working Live Example Scenario: "),
    normalRun("Student Auyon books an outpatient clinical consultation with Chief Medical Officer Dr. Tanjir Ahmmed Tushar for seasonal fever, while another student books psychological counseling.")
  ]));

  children.push(h4("Medical Appointment Booking Payload:"));
  children.push(...createCodeBlock([
    "POST /api/medical/book-appointment HTTP/1.1",
    "Authorization: Bearer <STUDENT_JWT_AUYON>",
    "Content-Type: application/json",
    "",
    "{",
    '  "doctorName": "Dr. Tanjir Ahmmed Tushar",',
    '  "designation": "Chief Medical Officer",',
    '  "date": "2026-05-19",',
    '  "timeSlot": "10:30 AM - 11:00 AM",',
    '  "symptoms": "High grade fever, headache, throat irritation for 2 days",',
    '  "emergencyLevel": "Standard"',
    "}"
  ]));
  children.push(p("Speciality Feature: For emergency medical distress, the portal features a prominent red 24/7 Ambulance hotline button linking directly to the campus emergency vehicle dispatch (`tel:+8801711234567`), enabling zero-latency calling from any smartphone."));

  // ==========================================
  // Module 12: Emergency Blood Donor Directory
  // ==========================================
  children.push(h3("4.3.12 Module 12: Emergency Blood Donor Directory & One-Touch Direct Calling"));
  children.push(p([
    boldRun("Operational Objective: "),
    normalRun("Facilitate life-saving blood donations during critical hospital emergencies in Rajshahi medical area through an indexed, real-time searchable blood donor registry with direct phone dialer integration.")
  ]));

  children.push(p([
    boldRun("Working Live Example Scenario: "),
    normalRun("An emergency blood transfusion requires 2 bags of 'B+' blood at Rajshahi Medical College Hospital (RMCH). A student searches the OneHUB blood donor directory.")
  ]));

  children.push(h4("Donor Query API Request & Filter Output:"));
  children.push(...createCodeBlock([
    "GET /api/blood/donors?bloodGroup=B%2B&isAvailable=true HTTP/1.1",
    "",
    "HTTP/1.1 200 OK",
    "[",
    "  {",
    '    "donorName": "Auyon Dip Sardar",',
    '    "rollNumber": "2410043",',
    '    "department": "ECE",',
    '    "bloodGroup": "B+",',
    '    "hallName": "Shahid Abdul Hamid Hall",',
    '    "phone": "+8801700000043",',
    '    "lastDonation": "2026-01-15",',
    '    "daysSinceLastDonation": 122,',
    '    "eligibility": "ELIGIBLE (>= 90 Days)"',
    "  }",
    "]"
  ]));
  children.push(p("The UI displays an interactive call button with `href='tel:+8801700000043'`, allowing instant contact without manual number copying."));

  // ==========================================
  // Module 13: RUET Notices Scraper
  // ==========================================
  children.push(h3("4.3.13 Module 13: Automated Web-Scraped Live RUET Notices & Circulars Aggregator"));
  children.push(p([
    boldRun("Operational Objective: "),
    normalRun("Automate official information discovery by running a scheduled server-side scraper that parses the official RUET web portal (`ruet.ac.bd/notices`), extracts PDF circulars, and caches them for offline student access.")
  ]));

  children.push(p([
    boldRun("Working Live Example Scenario: "),
    normalRun("A new circular regarding 'Semester Final Examination Schedule 2026' is published on the official RUET website. OneHUB automatically indexes the notice.")
  ]));

  children.push(h4("Scraped Circular Record Payload:"));
  children.push(...createCodeBlock([
    "{",
    '  "title": "Examination Schedule for 2nd Year 1st Semester 2024-2025 Session",',
    '  "publishedDate": "2026-05-18",',
    '  "category": "Academic / Examination",',
    '  "fileUrl": "https://www.ruet.ac.bd/uploads/notices/exam_schedule_24s.pdf",',
    '  "scrapedAt": "2026-05-18T06:00:15.823Z",',
    '  "source": "RUET Official Web Portal"',
    "}"
  ]));

  // ==========================================
  // Module 14: StudyBuddy AI & Video Tutor
  // ==========================================
  children.push(h3("4.3.14 Module 14: AI StudyBuddy & YouTube Playlist Interactive Learning Companion"));
  children.push(p([
    boldRun("Operational Objective: "),
    normalRun("Provide an on-demand generative AI academic tutor tailored for ECE curriculum queries, paired with a native embedded YouTube player that seamlessly plays educational video playlists without page redirection.")
  ]));

  children.push(p([
    boldRun("Working Live Example Scenario: "),
    normalRun("Student Auyon pastes a YouTube playlist for 'BJT Small Signal Analysis' (`PL2B3...`) into StudyBuddy and asks the AI to summarize hybrid-pi parameters.")
  ]));

  children.push(h4("StudyBuddy Chat & Video Embed Payload:"));
  children.push(...createCodeBlock([
    "POST /api/ai/studybuddy-query HTTP/1.1",
    "Content-Type: application/json",
    "",
    "{",
    '  "courseContext": "ECE 2101",',
    '  "query": "Explain how the transconductance gm of a BJT is calculated in the hybrid-pi model.",',
    '  "activePlaylistId": "PLxCzCOWd7aiEed7SKZBnC6ypFDWYLTvB2"',
    "}",
    "",
    "HTTP/1.1 200 OK",
    "{",
    '  "response": "In the hybrid-pi model, the transconductance gm relates small-signal collector current ic to base-emitter voltage vbe: gm = Ic / VT, where Ic is DC collector current and VT is thermal voltage (~26mV at 300K).",',
    '  "embedUrl": "https://www.youtube.com/embed/videoseries?list=PLxCzCOWd7aiEed7SKZBnC6ypFDWYLTvB2"',
    "}"
  ]));

  // ==========================================
  // Module 15: OBE LaTeX Question Paper Gen
  // ==========================================
  children.push(h3("4.3.15 Module 15: OBE LaTeX Class Test Question Paper Generator"));
  children.push(p([
    boldRun("Operational Objective: "),
    normalRun("Generate syntactically flawless LaTeX source code conforming to the standardized RUET examination question format, tagging every question item with its associated Course Outcome (CO) and Bloom's cognitive level.")
  ]));

  children.push(p([
    boldRun("Working Live Example Scenario: "),
    normalRun("Instructor Moloy Kumar Ghosh generates the LaTeX examination source for ECE 2101 Class Test 1.")
  ]));

  children.push(h4("Generated LaTeX Output Snippet:"));
  children.push(...createCodeBlock([
    "\\documentclass[11pt,a4paper]{article}",
    "\\usepackage{amsmath,amssymb,graphicx}",
    "\\begin{document}",
    "\\begin{center}",
    "\\textbf{Rajshahi University of Engineering \\& Technology}\\\\",
    "\\textbf{Department of Electrical \\& Computer Engineering}\\\\",
    "Course Code: ECE 2101 \\quad Course Title: Electronic Devices and Circuits\\\\",
    "Class Test - 1 \\quad Time: 45 Minutes \\quad Full Marks: 20",
    "\\end{center}",
    "\\hrule \\vspace{10pt}",
    "\\begin{enumerate}",
    "\\item \\textbf{[CO1, C4]} (a) Derive the expression for the built-in potential Vbi of an abrupt p-n junction in terms of acceptor and donor doping concentrations. \\hfill [5]",
    "\\item \\textbf{[CO2, C6]} (b) Design a common-emitter voltage-divider bias circuit using a 2N3904 BJT to achieve a quiescent collector current of 2mA with Vcc = 12V. \\hfill [10]",
    "\\end{enumerate}",
    "\\end{document}"
  ]));

  // ==========================================
  // Module 16: Admin Governance & Live Users
  // ==========================================
  children.push(h3("4.3.16 Module 16: Super-Admin Enterprise Governance & Real-time Live Active Users Tracking"));
  children.push(p([
    boldRun("Operational Objective: "),
    normalRun("Provide central administrative governance over user authorizations, system telemetry, and a real-time active user tracking widget monitoring concurrent authenticated sessions.")
  ]));

  children.push(p([
    boldRun("Working Live Example Scenario: "),
    normalRun("System Administrator logs in to inspect active system load during the peak morning course registration period.")
  ]));

  children.push(h4("Admin Live Metrics API Response:"));
  children.push(...createCodeBlock([
    "GET /api/admin/system-stats HTTP/1.1",
    "Authorization: Bearer <SUPER_ADMIN_JWT>",
    "",
    "HTTP/1.1 200 OK",
    "{",
    '  "activeUsersCount": 184,',
    '  "totalRegisteredStudents": 4250,',
    '  "totalFaculty": 168,',
    '  "activeRegistrationPackets": 842,',
    '  "serverUptime": "99.98%",',
    '  "mongodbLatencyMs": 12.4,',
    '  "memoryUsageMB": 186.2',
    "}"
  ]));

  // ==========================================
  // Module 17: Flutter Mobile App & Android APK
  // ==========================================
  children.push(h3("4.3.17 Module 17: Cross-Platform Flutter Mobile Application & Native Android APK Architecture"));
  children.push(p([
    boldRun("Operational Objective: "),
    normalRun("Provide students and faculty with a dedicated, high-performance native mobile client compiled to an Android Package Kit (APK) using Google's Flutter framework. The mobile application delivers on-the-go routine checking, real-time class countdowns, clearance verification, and local alarm notifications.")
  ]));

  children.push(p([
    boldRun("Mobile Client Architecture: "),
    normalRun("The mobile codebase (located in the mobile/ directory) is engineered with the Provider state management pattern. It communicates with the Node.js/Express backend via a dedicated HTTP ApiService (mobile/lib/services/api_service.dart) with secure persistent token storage. Custom theme providers (app_theme.dart) adapt dynamically to system dark and light modes.")
  ]));

  children.push(p([
    boldRun("Key Mobile Screens & Capabilities: "),
    normalRun("The APK bundles over 20 dedicated native screens: (1) HomeScreen with the UpNextClassWidget, (2) WeeklyRoutineScreen displaying daily lectures and lab sessions, (3) AttendanceRecordScreen showing percentage graphs, (4) StudentHallScreen and ClearanceStatusScreen, (5) FeePaymentScreen, and (6) LocalNotificationService delivering alarms 15 minutes prior to scheduled classes.")
  ]));

  children.push(h4("Flutter Mobile State Management & API Client Pipeline:"));
  children.push(...createCodeBlock([
    "// mobile/lib/services/api_service.dart - Secure Mobile REST Interceptor",
    "class ApiService {",
    "  static const String baseUrl = 'https://onehub.ruet.ac.bd/api';",
    "  ",
    "  static Future<Map<String, dynamic>> fetchNextClass(String token) async {",
    "    final response = await http.get(",
    "      Uri.parse('$baseUrl/routine/my-today'),",
    "      headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'},",
    "    );",
    "    if (response.statusCode == 200) {",
    "      return jsonDecode(response.body);",
    "    }",
    "    throw Exception('Failed to load class routine');",
    "  }",
    "}"
  ]));

  // 4.4 Algorithms / Logic Explanation
  children.push(h2("4.4 Algorithms and Core Computational Logic"));
  children.push(p("OneHUB incorporates four specialized mathematical algorithms that govern routine conflict resolution, continuous assessment mark optimization, OBE attainment vectors, and predictive CGPA trajectories:"));

  children.push(h3("4.4.1 Routine Conflict & Clash Detection Algorithm"));
  children.push(p("The routine engine prevents room and instructor double-booking. Let S_new be a proposed slot with day d, time interval [t_start, t_end], room r, and instructor i. A clash exists if any existing slot S_k in the database satisfies:"));
  children.push(p("Conflict = (S_k.day == S_new.day) AND (MAX(S_k.start, S_new.start) < MIN(S_k.end, S_new.end)) AND ((S_k.room == S_new.room) OR (S_k.teacher == S_new.teacher))", { alignment: AlignmentType.CENTER, italics: true }));
  children.push(p("If Conflict is TRUE, the backend rejects the transaction with HTTP 409 Conflict and reports the conflicting entity."));

  children.push(h3("4.4.2 Best-of-N Class Test Mark Optimization Algorithm"));
  children.push(p("Under RUET academic ordinances, course instructors administer K Class Tests (typically K = 4), and the student's continuous assessment grade is derived from the highest N scores (where N = K - 1 = 3). The algorithm sorts scores in descending order and computes the mean:"));
  children.push(p("Final_CT_Score = (1 / N) * SUM(Scores[0 ... N-1])", { alignment: AlignmentType.CENTER, italics: true }));

  const ctHeaders = ["Student Roll", "CT1 (20)", "CT2 (20)", "CT3 (20)", "CT4 (20)", "Dropped Score", "Best 3 Sum", "Average (20)"];
  const ctRows = [
    ["2410043 (Auyon)", "18.0", "14.5", "19.5", "17.0", "14.5 (CT2)", "54.5", "18.17"],
    ["2410044", "12.0", "15.0", "16.5", "14.0", "12.0 (CT1)", "45.5", "15.17"],
    ["2410045", "19.0", "18.5", "17.0", "19.5", "17.0 (CT3)", "57.0", "19.00"]
  ];
  children.push(createTable(ctHeaders, ctRows, [1600, 1000, 1000, 1000, 1000, 1400, 1000, 1000]));
  children.push(p("Table 4.1: Best-of-N Class Test Mark Selection Simulation Matrix", { italics: true, size: 20 }));

  children.push(h3("4.4.3 Weighted OBE CO-PO Attainment Calculation"));
  children.push(p("To evaluate Course Outcome attainment, let M_ij be the mark obtained by student i on assessment item j mapped to Course Outcome CO_k, with maximum mark M_max,j. Let T be the benchmark threshold (default: 60%). The attainment percentage A(CO_k) is calculated as:"));
  children.push(p("A(CO_k) = (Count(Students where Score_j >= 0.60 * M_max,j) / Total_Students) * 100%", { alignment: AlignmentType.CENTER, italics: true }));
  children.push(p("Program Outcome PO_m is subsequently computed by multiplying the CO attainment vector with the curriculum mapping weight matrix W_km:"));
  children.push(p("PO_m = SUM(A(CO_k) * W_km) / SUM(W_km)", { alignment: AlignmentType.CENTER, italics: true }));

  children.push(h3("4.4.4 Dynamic Target CGPA Prediction Model"));
  children.push(p("Given completed credit hours C_done, current cumulative CGPA G_curr, target graduation CGPA G_target, and total degree credits C_total, the required average grade point G_req across remaining credits C_rem = C_total - C_done is formulated as:"));
  children.push(p("G_req = ((G_target * C_total) - (G_curr * C_done)) / C_rem", { alignment: AlignmentType.CENTER, italics: true }));
  children.push(p("If G_req > 4.00, the target is mathematically unreachable; the system alerts the student to adjust the target downwards."));

  // 4.5 Security Features
  children.push(h2("4.5 Security Features Implemented"));
  children.push(p("Security was prioritized throughout development following OWASP Top 10 guidelines:"));
  children.push(p([
    boldRun("1. Adaptive Cryptographic Password Hashing: "),
    normalRun("All passwords stored in MongoDB are encrypted using Bcrypt with a salt work factor of 10, preventing rainbow table and dictionary cracking.")
  ]));

  children.push(p([
    boldRun("2. Stateless HMAC-SHA256 JWT Authentication: "),
    normalRun("Authenticated sessions use cryptographically signed JSON Web Tokens containing the user's ObjectId and Role claim, expiring after 24 hours.")
  ]));

  children.push(p([
    boldRun("3. HTTP Security Headers (Helmet): "),
    normalRun("Helmet middleware automatically configures Content Security Policy (CSP), X-Frame-Options: DENY, Strict-Transport-Security (HSTS), and disables X-Powered-By headers.")
  ]));

  children.push(p([
    boldRun("4. Defense Against NoSQL Injection: "),
    normalRun("All incoming request payloads are sanitized using Express Mongoose query filters, stripping dangerous operators ($gt, $ne, $where) to protect MongoDB database integrity.")
  ]));

  children.push(p([
    boldRun("5. Dynamic Rate Limiting & Brute-Force Shield: "),
    normalRun("Express rate-limiting restricts login and OTP request endpoints to 5 requests per 15-minute window per IP address, preventing brute-force password guessing.")
  ]));

  return children;
}

module.exports = {
  getChapter4
};
