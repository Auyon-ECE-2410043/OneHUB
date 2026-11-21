const {
  FONT_FAMILY,
  COLOR_PRIMARY,
  COLOR_SECONDARY,
  p,
  boldRun,
  normalRun,
  h1,
  h2,
  h3,
  figure,
  createTable
} = require('./report_helpers');

function getChapter3() {
  const children = [];

  children.push(h1("Chapter 3: System Design", true));

  children.push(h2("3.1 Table Design & Database Schema"));
  children.push(p("The persistent data architecture of OneHUB is engineered using MongoDB Atlas, utilizing the Mongoose Object Document Mapper (ODM). Although MongoDB is a NoSQL document database, the data model for an academic institution requires strong entity integrity, referential consistency, and indexed query performance. Hence, a hybrid schema model is adopted: high-cardinality entities are related using referenced ObjectIds with foreign key indexes, while bounded, context-specific structures (such as individual student scores within a Class Test, or course line items inside a semester registration) are embedded to maximize read and write throughput."));

  children.push(p("The definitive data schema consists of ten primary collections, detailed in Tables 3.1 through 3.10:"));

  // Table 3.1: Users
  children.push(h3("3.1.1 Users Collection Schema"));
  const uHeaders = ["Field Name", "BSON / JS Type", "Constraints", "Description / Academic Purpose"];
  const uRows = [
    ["_id", "ObjectId", "Primary Key, Auto", "Unique system identifier for the user"],
    ["name", "String", "Required, Trim", "Full legal name (e.g., Auyon Dip Sardar)"],
    ["email", "String", "Required, Unique, Indexed", "Official university or personal email address"],
    ["password", "String", "Required, Hashed", "Bcrypt-hashed password (cost factor 10)"],
    ["role", "String", "Enum, Indexed", "'student', 'teacher', 'adviser', 'provost', 'doctor', 'admin'"],
    ["rollNumber", "String", "Sparse, Unique, Indexed", "Student academic roll number (e.g., 2410043)"],
    ["series", "String", "Optional", "Academic batch year (e.g., '24')"],
    ["department", "String", "Required", "Academic department (e.g., 'ECE', 'CSE', 'EEE')"],
    ["hallName", "String", "Optional", "Assigned residential hall (e.g., 'Shahid Abdul Hamid Hall')"],
    ["bloodGroup", "String", "Enum", "'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'"],
    ["phone", "String", "Optional", "Contact phone number for emergency directory"],
    ["resetPasswordOTP", "String", "Optional", "Cryptographic 6-digit OTP for password recovery"],
    ["resetPasswordExpires", "Date", "Optional", "Expiration timestamp (10-minute validity)"],
    ["isApproved", "Boolean", "Default: true", "Administrative authorization status flag"],
    ["createdAt / updatedAt", "Date", "Auto Timestamps", "Audit timestamps for record creation and modification"]
  ];
  children.push(createTable(uHeaders, uRows, [1600, 1600, 2000, 4000]));
  children.push(p("Table 3.1: Users Collection Schema Definition", { alignment: p.alignment, italics: true, size: 20 }));

  // Table 3.2: Courses
  children.push(h3("3.1.2 Courses Collection Schema"));
  const cHeaders = ["Field Name", "BSON / JS Type", "Constraints", "Description / Academic Purpose"];
  const cRows = [
    ["_id", "ObjectId", "Primary Key, Auto", "Unique course entity identifier"],
    ["courseCode", "String", "Required, Unique, Indexed", "Official course code (e.g., 'ECE 2101', 'ECE 2100')"],
    ["courseTitle", "String", "Required, Trim", "Descriptive course title (e.g., 'Electronic Devices and Circuits')"],
    ["credit", "Number", "Required, Min: 0.75, Max: 4.0", "Academic credit weighting (e.g., 3.00, 1.50)"],
    ["contactHours", "Number", "Required", "Weekly scheduled contact hours (e.g., 3.0, 4.5)"],
    ["type", "String", "Enum", "'Theory' or 'Sessional/Laboratory'"],
    ["semester", "String", "Required, Indexed", "Target academic term (e.g., '2nd Year 1st Semester')"],
    ["department", "String", "Required, Indexed", "Offering department (e.g., 'ECE')"],
    ["prerequisites", "Array of Strings", "Default: []", "Array of prerequisite course codes required before enrollment"]
  ];
  children.push(createTable(cHeaders, cRows, [1600, 1600, 2000, 4000]));
  children.push(p("Table 3.2: Courses Collection Schema Definition", { italics: true, size: 20 }));

  // Table 3.3: Registrations
  children.push(h3("3.1.3 Registrations Collection Schema"));
  const rHeaders = ["Field Name", "BSON / JS Type", "Constraints", "Description / Academic Purpose"];
  const rRows = [
    ["_id", "ObjectId", "Primary Key, Auto", "Registration transaction identifier"],
    ["studentId", "ObjectId (Ref: User)", "Required, Indexed", "Foreign key reference to enrolled student"],
    ["academicSession", "String", "Required", "Academic session (e.g., '2024-2025')"],
    ["semester", "String", "Required", "Registration semester (e.g., '2nd Year 1st Semester')"],
    ["enrolledCourses", "Array of Objects", "Required", "List of course ObjectIds and credit counts"],
    ["totalCredits", "Number", "Max: 25.0", "Sum of registered credits; strictly capped at 25.0"],
    ["adviserStatus", "String", "Enum, Default: 'Pending'", "'Pending', 'Approved', 'Rejected'"],
    ["adviserId", "ObjectId (Ref: User)", "Optional", "Assigned academic adviser (e.g., Moloy Kumar Ghosh)"],
    ["provostStatus", "String", "Enum, Default: 'Pending'", "'Pending', 'Approved', 'Rejected'"],
    ["adviserRemarks", "String", "Optional", "Feedback or instructions from the academic adviser"]
  ];
  children.push(createTable(rHeaders, rRows, [1600, 1600, 2000, 4000]));
  children.push(p("Table 3.3: Registrations Collection Schema Definition", { italics: true, size: 20 }));

  // Table 3.4: RoutineSlots
  children.push(h3("3.1.4 RoutineSlots Collection Schema"));
  const rsHeaders = ["Field Name", "BSON / JS Type", "Constraints", "Description / Academic Purpose"];
  const rsRows = [
    ["_id", "ObjectId", "Primary Key, Auto", "Unique routine period slot identifier"],
    ["day", "String", "Enum, Indexed", "'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'"],
    ["startTime", "String", "Required", "Slot start timestamp string (e.g., '08:00', '10:50')"],
    ["endTime", "String", "Required", "Slot end timestamp string (e.g., '08:50', '13:20')"],
    ["courseCode", "String", "Required, Indexed", "Course taught in this period (e.g., 'ECE 2101')"],
    ["teacherInitials", "String", "Required, Indexed", "Faculty instructor code (e.g., 'MKG', 'RH')"],
    ["roomNumber", "String", "Required, Indexed", "Assigned physical lecture room / lab (e.g., 'Room 304')"],
    ["semester", "String", "Required", "Student cohort semester (e.g., '2nd Year 1st Semester')"],
    ["labBatch", "String", "Enum, Default: 'ALL'", "'ALL' (Full batch), '1st 30' (Roll 1-30), '2nd 30' (Roll 31-60)"]
  ];
  children.push(createTable(rsHeaders, rsRows, [1600, 1600, 2000, 4000]));
  children.push(p("Table 3.4: RoutineSlots Collection Schema Definition", { italics: true, size: 20 }));

  // Table 3.5: Attendances
  children.push(h3("3.1.5 Attendances Collection Schema"));
  const aHeaders = ["Field Name", "BSON / JS Type", "Constraints", "Description / Academic Purpose"];
  const aRows = [
    ["_id", "ObjectId", "Primary Key, Auto", "Attendance record session identifier"],
    ["courseCode", "String", "Required, Indexed", "Course for which attendance is recorded"],
    ["date", "Date", "Required, Indexed", "Calendar date of the conducted lecture"],
    ["records", "Array of Objects", "Required", "Array of { studentId: Ref User, roll: String, status: 'Present'|'Absent' }"],
    ["teacherId", "ObjectId (Ref: User)", "Required", "Instructor who logged and signed the session"],
    ["topicCovered", "String", "Optional", "Brief instructional syllabus milestone covered"]
  ];
  children.push(createTable(aHeaders, aRows, [1600, 1600, 2000, 4000]));
  children.push(p("Table 3.5: Attendances Collection Schema Definition", { italics: true, size: 20 }));

  // Table 3.6: Marks
  children.push(h3("3.1.6 Marks Collection Schema"));
  const mHeaders = ["Field Name", "BSON / JS Type", "Constraints", "Description / Academic Purpose"];
  const mRows = [
    ["_id", "ObjectId", "Primary Key, Auto", "Continuous assessment ledger identifier"],
    ["courseCode", "String", "Required, Indexed", "Course code (e.g., 'ECE 2101')"],
    ["examType", "String", "Enum", "'CT1', 'CT2', 'CT3', 'CT4', 'Quiz', 'LabReport', 'SemesterFinal'"],
    ["maxMarks", "Number", "Required", "Total achievable marks (e.g., 20 for CT, 100 for Final)"],
    ["studentScores", "Array of Objects", "Required", "Array of { studentId: Ref User, roll: String, obtainedMarks: Number }"],
    ["evaluatedBy", "ObjectId (Ref: User)", "Required", "Faculty examiner who graded the assessment"]
  ];
  children.push(createTable(mHeaders, mRows, [1600, 1600, 2000, 4000]));
  children.push(p("Table 3.6: Marks Collection Schema Definition", { italics: true, size: 20 }));

  // Table 3.7: OBE Assessments
  children.push(h3("3.1.7 OBE Assessments Collection Schema"));
  const oHeaders = ["Field Name", "BSON / JS Type", "Constraints", "Description / Academic Purpose"];
  const oRows = [
    ["_id", "ObjectId", "Primary Key, Auto", "OBE assessment matrix identifier"],
    ["courseCode", "String", "Required, Indexed", "Course mapped to OBE framework"],
    ["academicSession", "String", "Required", "Target academic cohort session"],
    ["coList", "Array of Objects", "Required", "Array of { coId: 'CO1', description: String, bloomLevel: 'C3', poMap: ['PO1', 'PO3'] }"],
    ["benchmarkThreshold", "Number", "Default: 60", "Passing threshold percentage required for attainment (e.g., 60%)"],
    ["attainmentResults", "Object", "Dynamic", "Computed percentage attainment vectors for each CO and projected PO"]
  ];
  children.push(createTable(oHeaders, oRows, [1600, 1600, 2000, 4000]));
  children.push(p("Table 3.7: OBE Assessments Collection Schema Definition", { italics: true, size: 20 }));

  // Table 3.8: Dining Tokens
  children.push(h3("3.1.8 Dining Tokens Collection Schema"));
  const dHeaders = ["Field Name", "BSON / JS Type", "Constraints", "Description / Academic Purpose"];
  const dRows = [
    ["_id", "ObjectId", "Primary Key, Auto", "Meal transaction token identifier"],
    ["studentId", "ObjectId (Ref: User)", "Required, Indexed", "Student who purchased the meal token"],
    ["mealType", "String", "Enum", "'Lunch' (40 BDT) or 'Dinner' (40 BDT)"],
    ["date", "Date", "Required, Indexed", "Calendar date the token is valid for"],
    ["tokenHash", "String", "Required, Unique", "HMAC-SHA256 encrypted dynamic verification hash"],
    ["status", "String", "Enum, Default: 'ACTIVE'", "'ACTIVE' (Purchased), 'CONSUMED' (Scanned), 'EXPIRED'"],
    ["hallName", "String", "Required", "Residential hall dining room (e.g., 'Shahid Abdul Hamid Hall')"]
  ];
  children.push(createTable(dHeaders, dRows, [1600, 1600, 2000, 4000]));
  children.push(p("Table 3.8: Dining Tokens Collection Schema Definition", { italics: true, size: 20 }));

  // Table 3.9: Medical Appointments
  children.push(h3("3.1.9 Medical Appointments Collection Schema"));
  const medHeaders = ["Field Name", "BSON / JS Type", "Constraints", "Description / Academic Purpose"];
  const medRows = [
    ["_id", "ObjectId", "Primary Key, Auto", "Clinical consultation record identifier"],
    ["studentId", "ObjectId (Ref: User)", "Required, Indexed", "Student requesting healthcare consultation"],
    ["doctorName", "String", "Required", "Assigned medical officer (e.g., Dr. Tanjir Ahmmed Tushar)"],
    ["category", "String", "Enum", "'General Physician', 'Dental Surgeon', 'Mental Health Counseling'"],
    ["date", "Date", "Required, Indexed", "Scheduled clinical appointment date"],
    ["timeSlot", "String", "Required", "Selected time window (e.g., '10:00 AM - 10:30 AM')"],
    ["symptoms", "String", "Required", "Chief medical complaints reported by student"],
    ["status", "String", "Enum, Default: 'Pending'", "'Pending', 'Confirmed', 'Completed', 'Cancelled'"]
  ];
  children.push(createTable(medHeaders, medRows, [1600, 1600, 2000, 4000]));
  children.push(p("Table 3.9: Medical Appointments Collection Schema Definition", { italics: true, size: 20 }));

  // Table 3.10: Blood Donors
  children.push(h3("3.1.10 Blood Donors Collection Schema"));
  const bHeaders = ["Field Name", "BSON / JS Type", "Constraints", "Description / Academic Purpose"];
  const bRows = [
    ["_id", "ObjectId", "Primary Key, Auto", "Donor registry identifier"],
    ["userId", "ObjectId (Ref: User)", "Required, Unique, Indexed", "Student/Teacher offering blood donations"],
    ["bloodGroup", "String", "Enum, Indexed", "'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'"],
    ["department", "String", "Required, Indexed", "Academic department of the donor"],
    ["hallName", "String", "Optional", "Campus residential hall where donor is domiciled"],
    ["phone", "String", "Required", "Emergency contact phone number"],
    ["lastDonationDate", "Date", "Optional", "Date of most recent donation (must be >= 90 days for eligibility)"],
    ["isAvailable", "Boolean", "Default: true, Indexed", "Flag indicating whether donor is currently fit and ready to donate"]
  ];
  children.push(createTable(bHeaders, bRows, [1600, 1600, 2000, 4000]));
  children.push(p("Table 3.10: Blood Donors Collection Schema Definition", { italics: true, size: 20 }));

  // 3.2 ERD
  children.push(h2("3.2 Entity Relationship Diagram (ERD)"));
  children.push(p("The architectural cohesion of OneHUB is anchored on an interconnected relational entity model mapped onto MongoDB collections. The root entity of the system is the User collection, which branches into specialized domain relations: Courses, Registrations, RoutineSlots, Attendances, Marks, OBE Assessments, Dining Tokens, and Medical Appointments."));

  children.push(...figure(
    'docs/report_figures/fig_3_1_erd.png',
    'Figure 3.1: Complete MongoDB Relational & Document Schema Entity Relationship Diagram (ERD)',
    520,
    325
  ));

  children.push(p("As illustrated in Figure 3.1, the User entity maintains a 1-to-Many relationship with Registrations, where a student submits semester registration packets containing references to multiple Course entities. The Adviser role (a specialized User instance) holds an approval foreign key linking to the Registration. The Course entity participates in 1-to-Many associations with Attendances, Marks, RoutineSlots, and OBE Assessments, ensuring that all academic performance vectors are strictly scoped by curriculum definitions."));

  // 3.3 DFD
  children.push(h2("3.3 Data Flow Diagram (DFD)"));
  children.push(p("Data Flow Diagrams provide visual insight into how information enters, flows through, is processed by, and is stored within the OneHUB ecosystem. The system is modeled at two distinct levels of abstraction: Level 0 (Context Diagram) and Level 1 (Decomposed Registration Process)."));

  children.push(h3("3.3.1 DFD Level 0: Context Diagram"));
  children.push(p("The Context-Level DFD treats OneHUB as a unified processing engine interacting with seven external environmental entities: Students, Faculty Instructors, Academic Advisers, Hall Provosts, Medical Center Officers, Blood Donors, and Super-Administrators."));

  children.push(...figure(
    'docs/report_figures/fig_3_2_dfd_lvl0.png',
    'Figure 3.2: Data Flow Diagram (DFD) Level 0: Context-Level Process Flow of OneHUB',
    500,
    250
  ));

  children.push(p("External actors dispatch authenticated transactional payloads into the OneHUB engine, which validates credentials against JSON Web Tokens, applies business logic rules, modifies the central MongoDB Atlas data store, and dispatches real-time reactive feedback, timetable notifications, and official academic documents."));

  children.push(h3("3.3.2 DFD Level 1: Course Registration & Approval Subsystem"));
  children.push(p("To understand the internal mechanics of critical academic workflows, Figure 3.3 illustrates the decomposed Level 1 DFD for the Course Registration and Approval subsystem."));

  children.push(...figure(
    'docs/report_figures/fig_3_3_dfd_lvl1.png',
    'Figure 3.3: Data Flow Diagram (DFD) Level 1: Course Registration & Adviser Approval Subsystem',
    510,
    243
  ));

  children.push(p("The workflow progresses through three distinct transactional processes: Process 1.1 validates prerequisite compliance and enforces the maximum 25.0 credit ceiling; Process 1.2 queries residential hall databases to confirm student clearance; and Process 1.3 establishes a digital gate requiring the designated Academic Adviser to review and digitally sign the registration packet into the registrations collection (Data Store D1)."));

  // 3.4 Class Diagram
  children.push(h2("3.4 Object-Oriented Class Diagram"));
  children.push(p("Although Node.js utilizes prototype-based JavaScript, the backend services and domain models of OneHUB are architected around strict Object-Oriented Domain Driven Design (DDD) principles. Figure 3.4 illustrates the structural relationships, attributes, and core operational methods governing the primary domain entities."));

  children.push(...figure(
    'docs/report_figures/fig_3_4_class_diagram.png',
    'Figure 3.4: Object-Oriented Domain Class Diagram for OneHUB Core Entities & Methods',
    520,
    304
  ));

  children.push(p("The class architecture encapsulates critical responsibilities: the User entity provides cryptographic authentication and OTP generation; the Course entity manages prerequisite validation and syllabus weighting; the Registration aggregate oversees credit validation and PDF export; the RoutineSlot entity encapsulates conflict detection algorithms; the OBEEngine service projects Course Outcome vectors onto Program Outcome matrices; and the DiningWallet aggregate secures SHA-256 dynamic QR tokens."));

  // 3.5 UI/UX Design
  children.push(h2("3.5 User Interface (UI/UX) Design Architecture"));
  children.push(p("The user interface of OneHUB is engineered using Tailwind CSS utility frameworks, adopting a modern 'glassmorphic' design system that combines aesthetic elegance with rigorous academic legibility. Key principles governing the interface design include:"));

  children.push(p([
    boldRun("1. Dual Theme Harmony (Dark & Light Mode): "),
    normalRun("The interface defaults to a high-contrast dark theme utilizing deep slate backgrounds (`#0F172A`) paired with semi-transparent frosted cards (`backdrop-blur-md bg-slate-800/60`), vibrant accent borders (`border-slate-700/50`), and neon indicator badges. An instant toggle provides a crisp, daylight-readable light theme tailored for bright outdoor or classroom viewing.")
  ]));

  children.push(p([
    boldRun("2. Mobile-First Responsive Breakpoints: "),
    normalRun("All layouts are structured using responsive CSS grid and flexbox primitives. On mobile displays (width < 768px), complex multi-column matrices—such as the weekly class routine—dynamically transform into touch-friendly horizontal swipe carousels and collapsible day accordions.")
  ]));

  children.push(p([
    boldRun("3. Ergonomic Information Architecture: "),
    normalRun("Role-based navigation sidebars dynamically surface only the modules relevant to the logged-in user tier, reducing cognitive overload. Key actions (such as emergency ambulance calling, routine export, and meal QR redemption) are placed within the natural thumb zone on mobile viewports.")
  ]));

  return children;
}

module.exports = {
  getChapter3
};
