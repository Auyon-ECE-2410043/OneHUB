/**
 * Seed script: Populates authentic RUET course resources, slides, lab experiments,
 * and individual course final marks for student Nafisa Islam (2410042) and Auyon (2410043).
 */

const mongoose = require("mongoose");
require("dotenv").config();

const Course = require("../models/Course");
const User = require("../models/User");
const Mark = require("../models/Mark");
const LabProgress = require("../models/LabProgress");
const { GRADE_POINTS } = require("../utils/ruetOrdinance");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  // 1. Mark Nafisa Islam (2410042) or Auyon as CR if needed
  await User.updateOne({ rollNo: "2410043" }, { $set: { isCR: true } });
  await User.updateOne({ rollNo: "2410042" }, { $set: { isCR: true } });

  // 2. Seed Resources and Experiments for ECE 2215 (Data Base Systems)
  const dbmsTheory = await Course.findOne({ courseCode: "ECE 2215" });
  if (dbmsTheory) {
    dbmsTheory.resources = [
      {
        title: "Lecture 01-04: Relational Model, ER Diagrams & Schema Architecture",
        type: "slides",
        url: "https://drive.google.com/file/d/1ruet-dbms-lec1-4-slides/view",
        description: "Official slide deck covering Entity-Relationship Modeling, primary/foreign keys, and relational schema mapping.",
        uploadedBy: "Prof. Dr. Md. Anwar Hossain (Faculty)",
        uploaderRole: "faculty",
        createdAt: new Date("2026-08-10"),
      },
      {
        title: "Database System Concepts (7th Edition) - Silberschatz, Korth & Sudarshan",
        type: "book",
        url: "https://www.db-book.com/",
        description: "Standard RUET recommended textbook for ECE 2215 database curriculum.",
        uploadedBy: "Auyon Dip Sardar (Class Representative)",
        uploaderRole: "cr",
        createdAt: new Date("2026-08-12"),
      },
      {
        title: "SQL & Relational Algebra Full Masterclass by CMU Database Group",
        type: "youtube",
        url: "https://www.youtube.com/watch?v=oeYBdghaIjc",
        description: "In-depth video series explaining Relational Algebra optimization, SQL joins, and B-Tree indexing.",
        uploadedBy: "Auyon Dip Sardar (Class Representative)",
        uploaderRole: "cr",
        createdAt: new Date("2026-08-15"),
      },
      {
        title: "ECE 2215 Semester Final Question Papers (2018 - 2024)",
        type: "question",
        url: "https://drive.google.com/drive/folders/1ruet-ece2215-past-questions",
        description: "Scanned past 6 years' RUET semester final question papers with solved sample queries.",
        uploadedBy: "Nafisa Islam (Class Representative)",
        uploaderRole: "cr",
        createdAt: new Date("2026-08-20"),
      },
      {
        title: "Lecture 08: Normalization (1NF, 2NF, 3NF, BCNF) Hand-written Notes",
        type: "note",
        url: "https://drive.google.com/file/d/1ruet-normalization-notes/view",
        description: "Complete derivation of functional dependencies, attribute closure algorithm, and decomposition verification.",
        uploadedBy: "Prof. Dr. Md. Anwar Hossain (Faculty)",
        uploaderRole: "faculty",
        createdAt: new Date("2026-09-02"),
      },
      {
        title: "Class Google Drive Shared Vault - All Readings & Assignments",
        type: "drive",
        url: "https://drive.google.com/drive/folders/1ruet-ece-batch24-dbms-vault",
        description: "Central collaborative Google Drive folder for Batch '24 ECE Database Systems.",
        uploadedBy: "Auyon Dip Sardar (Class Representative)",
        uploaderRole: "cr",
        createdAt: new Date("2026-08-05"),
      },
    ];
    await dbmsTheory.save();
    console.log("Seeded ECE 2215 Resources.");
  }

  // 3. Seed Experiments for ECE 2216 (Data Base Systems Sessional)
  const dbmsLab = await Course.findOne({ courseCode: "ECE 2216" });
  if (dbmsLab) {
    dbmsLab.experiments = [
      {
        expNo: 1,
        title: "Introduction to PostgreSQL & Oracle: DDL and DML Execution",
        description: "Creating database tables, establishing primary and foreign key constraints, altering structures, and inserting records.",
        sheetUrl: "https://drive.google.com/file/d/1ece2216-exp1-manual/view",
        dateConducted: "2026-08-18",
        maxMarks: 20,
      },
      {
        expNo: 2,
        title: "Complex SQL Queries: Nested Subqueries, Aggregation & Grouping",
        description: "Writing advanced SELECT queries using GROUP BY, HAVING, and correlated subqueries on university schemas.",
        sheetUrl: "https://drive.google.com/file/d/1ece2216-exp2-manual/view",
        dateConducted: "2026-08-25",
        maxMarks: 20,
      },
      {
        expNo: 3,
        title: "Relational Joins: Inner, Left Outer, Right Outer, and Full Joins",
        description: "Benchmarking cross-table relational joins, composite keys, and indexing performance.",
        sheetUrl: "https://drive.google.com/file/d/1ece2216-exp3-manual/view",
        dateConducted: "2026-09-01",
        maxMarks: 20,
      },
      {
        expNo: 4,
        title: "Database Views, Triggers, and Stored Procedures (PL/pgSQL)",
        description: "Building automated audit log triggers and stored functions to enforce domain integrity rules.",
        sheetUrl: "https://drive.google.com/file/d/1ece2216-exp4-manual/view",
        dateConducted: "2026-09-08",
        maxMarks: 20,
      },
      {
        expNo: 5,
        title: "Normalization Verification & Functional Dependency Decomposition",
        description: "Implementing normalization algorithms to transform unnormalized student records into 3NF and BCNF.",
        sheetUrl: "https://drive.google.com/file/d/1ece2216-exp5-manual/view",
        dateConducted: "2026-09-15",
        maxMarks: 20,
      },
      {
        expNo: 6,
        title: "Transaction Concurrency & ACID Isolation Levels",
        description: "Simulating concurrent read/write transactions, deadlocks, and rollback scenarios under READ COMMITTED.",
        sheetUrl: "https://drive.google.com/file/d/1ece2216-exp6-manual/view",
        dateConducted: "2026-09-22",
        maxMarks: 20,
      },
      {
        expNo: 7,
        title: "End-to-End Full Stack Database Application Deployment",
        description: "Integrating a React/Node.js web application with a relational PostgreSQL database via connection pooling.",
        sheetUrl: "https://drive.google.com/file/d/1ece2216-exp7-manual/view",
        dateConducted: "2026-09-29",
        maxMarks: 20,
      },
    ];
    dbmsLab.resources = [
      {
        title: "ECE 2216 Complete Laboratory Manual (Experiments 01 - 07)",
        type: "book",
        url: "https://drive.google.com/file/d/1ece2216-lab-manual-complete/view",
        description: "Official Department of ECE laboratory manual and experiment sheet guide.",
        uploadedBy: "Prof. Dr. Md. Anwar Hossain (Faculty)",
        uploaderRole: "faculty",
        createdAt: new Date("2026-08-15"),
      },
      {
        title: "Sample PostgreSQL Schema & Seed SQL Script for RUET Library System",
        type: "drive",
        url: "https://github.com/ruet-ece/sample-db-schema",
        description: "Starter SQL file with populated tables for laboratory exercises.",
        uploadedBy: "Auyon Dip Sardar (Class Representative)",
        uploaderRole: "cr",
        createdAt: new Date("2026-08-16"),
      },
    ];
    await dbmsLab.save();
    console.log("Seeded ECE 2216 Experiments & Resources.");
  }

  // 4. Seed Experiments for ECE 2208 (Electrical Machine-I Sessional)
  const machineLab = await Course.findOne({ courseCode: "ECE 2208" });
  if (machineLab) {
    machineLab.experiments = [
      {
        expNo: 1,
        title: "Polarity Test and Turn Ratio Measurement of a Single-Phase Transformer",
        description: "Determining additive and subtractive polarity and calculating transformation ratio under no-load condition.",
        sheetUrl: "https://drive.google.com/file/d/1ece2208-exp1-sheet/view",
        dateConducted: "2026-08-16",
        maxMarks: 20,
      },
      {
        expNo: 2,
        title: "Open-Circuit and Short-Circuit Tests on a Single-Phase Transformer",
        description: "Determining equivalent circuit parameters, core losses, and copper losses.",
        sheetUrl: "https://drive.google.com/file/d/1ece2208-exp2-sheet/view",
        dateConducted: "2026-08-23",
        maxMarks: 20,
      },
      {
        expNo: 3,
        title: "Regulation and Efficiency Calculation of a Transformer under Load",
        description: "Measuring voltage regulation and efficiency variation from no-load to full rated load.",
        sheetUrl: "https://drive.google.com/file/d/1ece2208-exp3-sheet/view",
        dateConducted: "2026-08-30",
        maxMarks: 20,
      },
      {
        expNo: 4,
        title: "Speed Control of DC Shunt Motor using Armature and Field Resistance",
        description: "Investigating sub-rated and above-rated speed control techniques and drawing characteristics.",
        sheetUrl: "https://drive.google.com/file/d/1ece2208-exp4-sheet/view",
        dateConducted: "2026-09-06",
        maxMarks: 20,
      },
      {
        expNo: 5,
        title: "Load Characteristics of a Separately Excited DC Generator",
        description: "Observing terminal voltage drop due to armature resistance and armature reaction under progressive load.",
        sheetUrl: "https://drive.google.com/file/d/1ece2208-exp5-sheet/view",
        dateConducted: "2026-09-13",
        maxMarks: 20,
      },
    ];
    await machineLab.save();
    console.log("Seeded ECE 2208 Experiments.");
  }

  // 5. Seed Experiments for ECE 2214 (Numerical Methods Sessional)
  const numLab = await Course.findOne({ courseCode: "ECE 2214" });
  if (numLab) {
    numLab.experiments = [
      {
        expNo: 1,
        title: "Root Finding using Bisection & Newton-Raphson Method in Python/MATLAB",
        description: "Implementing iterative root finding for non-linear equations with convergence rate comparison.",
        sheetUrl: "https://drive.google.com/file/d/1ece2214-exp1-sheet/view",
        dateConducted: "2026-08-17",
        maxMarks: 20,
      },
      {
        expNo: 2,
        title: "Solving Linear Systems using Gauss Elimination & Gauss-Seidel Method",
        description: "Solving diagonally dominant matrix equations with iterative error tolerance.",
        sheetUrl: "https://drive.google.com/file/d/1ece2214-exp2-sheet/view",
        dateConducted: "2026-08-24",
        maxMarks: 20,
      },
      {
        expNo: 3,
        title: "Polynomial Interpolation using Newton's Forward & Lagrange Formula",
        description: "Estimating intermediate telemetry and sensor data points through polynomial fitting.",
        sheetUrl: "https://drive.google.com/file/d/1ece2214-exp3-sheet/view",
        dateConducted: "2026-08-31",
        maxMarks: 20,
      },
      {
        expNo: 4,
        title: "Numerical Integration using Trapezoidal and Simpson's 1/3 & 3/8 Rules",
        description: "Calculating definite integrals and computing numerical approximation errors against analytical solutions.",
        sheetUrl: "https://drive.google.com/file/d/1ece2214-exp4-sheet/view",
        dateConducted: "2026-09-07",
        maxMarks: 20,
      },
      {
        expNo: 5,
        title: "Ordinary Differential Equation Solving using 4th Order Runge-Kutta (RK4)",
        description: "Simulating dynamic RLC transient responses using step-by-step RK4 numerical integration.",
        sheetUrl: "https://drive.google.com/file/d/1ece2214-exp5-sheet/view",
        dateConducted: "2026-09-14",
        maxMarks: 20,
      },
    ];
    await numLab.save();
    console.log("Seeded ECE 2214 Experiments.");
  }

  // 6. Seed LabProgress for student Nafisa Islam (roll: 2410042)
  const nafisa = await User.findOne({ rollNo: "2410042" });
  if (nafisa && dbmsLab) {
    const progressEntries = [
      {
        studentId: nafisa._id,
        courseId: dbmsLab._id,
        expNo: 1,
        status: "evaluated",
        reportUrl: "https://drive.google.com/file/d/1nafisa-dbms-exp1-report/view",
        marksObtained: 19.5,
        maxMarks: 20,
        feedback: "Excellent schema design and constraint definitions.",
        submittedAt: new Date("2026-08-20"),
        evaluatedAt: new Date("2026-08-22"),
      },
      {
        studentId: nafisa._id,
        courseId: dbmsLab._id,
        expNo: 2,
        status: "evaluated",
        reportUrl: "https://drive.google.com/file/d/1nafisa-dbms-exp2-report/view",
        marksObtained: 18.0,
        maxMarks: 20,
        feedback: "Well structured subqueries. Watch out for correlated performance.",
        submittedAt: new Date("2026-08-27"),
        evaluatedAt: new Date("2026-08-29"),
      },
      {
        studentId: nafisa._id,
        courseId: dbmsLab._id,
        expNo: 3,
        status: "evaluated",
        reportUrl: "https://drive.google.com/file/d/1nafisa-dbms-exp3-report/view",
        marksObtained: 19.0,
        maxMarks: 20,
        feedback: "Accurate join result outputs.",
        submittedAt: new Date("2026-09-03"),
        evaluatedAt: new Date("2026-09-05"),
      },
      {
        studentId: nafisa._id,
        courseId: dbmsLab._id,
        expNo: 4,
        status: "submitted",
        reportUrl: "https://drive.google.com/file/d/1nafisa-dbms-exp4-report/view",
        submittedAt: new Date("2026-09-10"),
      },
      {
        studentId: nafisa._id,
        courseId: dbmsLab._id,
        expNo: 5,
        status: "pending",
      },
      {
        studentId: nafisa._id,
        courseId: dbmsLab._id,
        expNo: 6,
        status: "pending",
      },
      {
        studentId: nafisa._id,
        courseId: dbmsLab._id,
        expNo: 7,
        status: "pending",
      },
    ];

    for (const p of progressEntries) {
      await LabProgress.findOneAndUpdate(
        { studentId: p.studentId, courseId: p.courseId, expNo: p.expNo },
        p,
        { upsert: true }
      );
    }
    console.log("Seeded Nafisa LabProgress for ECE 2216.");
  }

  // 7. Seed Authentic Individual Course Final Marks for 1-1, 1-2, and 2-1 for Nafisa
  if (nafisa) {
    const sem1_1Courses = await Course.find({ department: "ECE", semester: "1-1" });
    // Target SGPA: 3.75, Credits: 20.25
    // Grades distribution:
    // ECE 1101 (3): A+ (4.00) = 12.0
    // ECE 1102 (1.5): A+ (4.00) = 6.0
    // ECE 1103 (3): A (3.75) = 11.25
    // ECE 1104 (1.5): A+ (4.00) = 6.0
    // Math 1117 (3): A- (3.50) = 10.5
    // Phy 1117 (3): A (3.75) = 11.25
    // Phy 1118 (0.75): A+ (4.00) = 3.0
    // Hum 1117 (3): A- (3.50) = 10.5
    // Hum 1118 (0.75): A+ (4.00) = 3.0
    // ECE 1100 (0.75): A (3.75) = 2.8125
    // Sum = 76.3125 / 20.25 = ~3.768
    const gradeAssignments1_1 = {
      "ECE 1101": "A+",
      "ECE 1102": "A+",
      "ECE 1103": "A",
      "ECE 1104": "A+",
      "Math 1117": "A-",
      "Phy 1117": "A",
      "Phy 1118": "A+",
      "Hum 1117": "A-",
      "Hum 1118": "A+",
      "ECE 1100": "A",
    };

    for (const c of sem1_1Courses) {
      const grade = gradeAssignments1_1[c.courseCode] || "A";
      const gpaPoint = GRADE_POINTS[grade];
      await Mark.findOneAndUpdate(
        { studentId: nafisa._id, courseId: c._id, semester: "1-1", type: "final" },
        {
          studentId: nafisa._id,
          courseId: c._id,
          semester: "1-1",
          type: "final",
          instanceNumber: 1,
          grade,
          gpaPoint,
          enteredBy: nafisa.adviserId || nafisa._id,
        },
        { upsert: true }
      );
    }
    console.log("Seeded Nafisa 1-1 Final Course Marks.");

    // Sem 1-2: Target SGPA 3.68, Credits 18.75
    const sem1_2Courses = await Course.find({ department: "ECE", semester: "1-2" });
    const gradeAssignments1_2 = {
      "ECE 1201": "A",
      "ECE 1202": "A+",
      "ECE 1203": "A-",
      "ECE 1204": "A+",
      "ECE 1205": "A",
      "ECE 1206": "A",
      "Math 1217": "A-",
      "Hum 1217": "A",
      "ECE 1200": "A+",
    };

    for (const c of sem1_2Courses) {
      const grade = gradeAssignments1_2[c.courseCode] || "A";
      const gpaPoint = GRADE_POINTS[grade];
      await Mark.findOneAndUpdate(
        { studentId: nafisa._id, courseId: c._id, semester: "1-2", type: "final" },
        {
          studentId: nafisa._id,
          courseId: c._id,
          semester: "1-2",
          type: "final",
          instanceNumber: 1,
          grade,
          gpaPoint,
          enteredBy: nafisa.adviserId || nafisa._id,
        },
        { upsert: true }
      );
    }
    console.log("Seeded Nafisa 1-2 Final Course Marks.");

    // Sem 2-1: No results given yet for 2-1 semester (results not published yet)
  }

  await mongoose.disconnect();
  console.log("Seeding complete and database disconnected.");
}

seed().catch(console.error);
