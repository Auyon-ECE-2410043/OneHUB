const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/../.env" });
const Course = require("../models/Course");

const MONGODB_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/onehub";

const coursesData = [
  // --- 1st Year Odd Semester (1-1) ---
  { code: "ECE 1101", title: "Circuits and Systems-I", cr: 3, type: "theory", sem: "1-1" },
  { code: "ECE 1102", title: "Circuits and Systems-I Sessional", cr: 1.5, type: "sessional", sem: "1-1" },
  { code: "ECE 1103", title: "Computer Programming", cr: 3, type: "theory", sem: "1-1" },
  { code: "ECE 1104", title: "Computer Programming Sessional", cr: 1.5, type: "sessional", sem: "1-1" },
  { code: "Math 1117", title: "Calculus and Ordinary Differential Equation", cr: 3, type: "theory", sem: "1-1" },
  { code: "Phy 1117", title: "Optics and Modern Physics", cr: 3, type: "theory", sem: "1-1" },
  { code: "Phy 1118", title: "Optics and Modern Physics Sessional", cr: 0.75, type: "sessional", sem: "1-1" },
  { code: "Hum 1117", title: "Technical English", cr: 3, type: "theory", sem: "1-1" },
  { code: "Hum 1118", title: "Technical English Sessional", cr: 0.75, type: "sessional", sem: "1-1" },
  { code: "ECE 1100", title: "Introduction to Computer System", cr: 0.75, type: "sessional", sem: "1-1" },

  // --- 1st Year Even Semester (1-2) ---
  { code: "ECE 1201", title: "Circuits and Systems-II", cr: 3, type: "theory", sem: "1-2" },
  { code: "ECE 1202", title: "Circuits and Systems-II Sessional", cr: 0.75, type: "sessional", sem: "1-2" },
  { code: "ECE 1203", title: "Object Oriented Programming", cr: 3, type: "theory", sem: "1-2" },
  { code: "ECE 1204", title: "Object Oriented Programming Sessional", cr: 1.5, type: "sessional", sem: "1-2" },
  { code: "ECE 1205", title: "Analog Electronic Circuits-I", cr: 3, type: "theory", sem: "1-2" },
  { code: "ECE 1206", title: "Analog Electronic Circuits-I Sessional", cr: 0.75, type: "sessional", sem: "1-2" },
  { code: "Math 1217", title: "Transform Methods, Statistics & Complex Variable", cr: 3, type: "theory", sem: "1-2" },
  { code: "Hum 1217", title: "Government, Sociology, Environment Protection & History of Independence", cr: 3, type: "theory", sem: "1-2" },
  { code: "ECE 1200", title: "Engineering Ethics", cr: 0.75, type: "sessional", sem: "1-2" },

  // --- 2nd Year Odd Semester (2-1) ---
  { code: "ECE 2103", title: "Data Structure & Algorithms", cr: 3, type: "theory", sem: "2-1" },
  { code: "ECE 2104", title: "Data Structure & Algorithms Sessional", cr: 1.5, type: "sessional", sem: "2-1" },
  { code: "ECE 2105", title: "Analog Electronic Circuits-II", cr: 3, type: "theory", sem: "2-1" },
  { code: "ECE 2106", title: "Analog Electronic Circuits-II Sessional", cr: 0.75, type: "sessional", sem: "2-1" },
  { code: "ECE 2111", title: "Digital Techniques", cr: 3, type: "theory", sem: "2-1" },
  { code: "ECE 2112", title: "Digital Techniques Sessional", cr: 0.75, type: "sessional", sem: "2-1" },
  { code: "Math 2117", title: "Vector Analysis & Linear Algebra", cr: 3, type: "theory", sem: "2-1" },
  { code: "Chem 2117", title: "Inorganic and Physical Chemistry", cr: 3, type: "theory", sem: "2-1" },
  { code: "Chem 2118", title: "Inorganic and Physical Chemistry Sessional", cr: 0.75, type: "sessional", sem: "2-1" },
  { code: "ECE 2100", title: "Software Development Project-I", cr: 0.75, type: "sessional", sem: "2-1" },

  // --- 2nd Year Even Semester (2-2) ---
  { code: "ECE 2207", title: "Electrical Machine-I", cr: 3, type: "theory", sem: "2-2" },
  { code: "ECE 2208", title: "Electrical Machine-I Sessional", cr: 0.75, type: "sessional", sem: "2-2" },
  { code: "ECE 2213", title: "Numerical Methods & Discrete Mathematics", cr: 3, type: "theory", sem: "2-2" },
  { code: "ECE 2214", title: "Numerical Methods & Discrete Mathematics Sessional", cr: 1.5, type: "sessional", sem: "2-2" },
  { code: "ECE 2215", title: "Data Base Systems", cr: 3, type: "theory", sem: "2-2" },
  { code: "ECE 2216", title: "Data Base Systems Sessional", cr: 1.5, type: "sessional", sem: "2-2" },
  { code: "Math 2217", title: "Co-ordinate Geometry & Partial Differential Equations", cr: 3, type: "theory", sem: "2-2" },
  { code: "Hum 2217", title: "Legal Issues, Industrial & Operational Management", cr: 3, type: "theory", sem: "2-2" },
  { code: "ECE 2200", title: "Electronic Shop Practice", cr: 1.5, type: "sessional", sem: "2-2" },

  // --- 3rd Year Odd Semester (3-1) ---
  { code: "ECE 3107", title: "Electrical Machine-II", cr: 3, type: "theory", sem: "3-1" },
  { code: "ECE 3108", title: "Electrical Machine-II Sessional", cr: 0.75, type: "sessional", sem: "3-1" },
  { code: "ECE 3111", title: "Microprocessor, Assembly Language & Interfacing", cr: 3, type: "theory", sem: "3-1" },
  { code: "ECE 3112", title: "Microprocessor, Assembly Language & Interfacing Sessional", cr: 1.5, type: "sessional", sem: "3-1" },
  { code: "ECE 3117", title: "Software Engineering & Information System Design", cr: 3, type: "theory", sem: "3-1" },
  { code: "ECE 3118", title: "Software Engineering & Information System Design Sessional", cr: 0.75, type: "sessional", sem: "3-1" },
  { code: "ECE 3119", title: "Computer Architecture and Design", cr: 3, type: "theory", sem: "3-1" },
  { code: "ECE 3121", title: "Electromagnetic Fields & Waves", cr: 3, type: "theory", sem: "3-1" },
  { code: "CE 3100", title: "Civil Engineering Drawing", cr: 0.75, type: "sessional", sem: "3-1" },
  { code: "ECE 3100", title: "Software Development Project-II", cr: 0.75, type: "sessional", sem: "3-1" },

  // --- 3rd Year Even Semester (3-2) ---
  { code: "ECE 3205", title: "Industrial Electronics", cr: 3, type: "theory", sem: "3-2" },
  { code: "ECE 3206", title: "Industrial Electronics Sessional", cr: 0.75, type: "sessional", sem: "3-2" },
  { code: "ECE 3207", title: "Communication Engineering", cr: 3, type: "theory", sem: "3-2" },
  { code: "ECE 3208", title: "Communication Engineering Sessional", cr: 0.75, type: "sessional", sem: "3-2" },
  { code: "ECE 3221", title: "Operating System", cr: 3, type: "theory", sem: "3-2" },
  { code: "ECE 3222", title: "Operating System Sessional", cr: 0.75, type: "sessional", sem: "3-2" },
  { code: "ME 3219", title: "Basic Mechanical Engineering", cr: 3, type: "theory", sem: "3-2" },
  { code: "ME 3220", title: "Basic Mechanical Engineering Sessional", cr: 0.75, type: "sessional", sem: "3-2" },
  { code: "Hum 3217", title: "Economics & Accountancy", cr: 3, type: "theory", sem: "3-2" },
  { code: "ECE 3200", title: "Electrical Services Design", cr: 1.5, type: "sessional", sem: "3-2" },

  // --- 4th Year Odd Semester (4-1) ---
  { code: "ECE 4109", title: "Power System", cr: 3, type: "theory", sem: "4-1" },
  { code: "MTE 4117", title: "Control Systems & Robotics", cr: 3, type: "theory", sem: "4-1" },
  { code: "MTE 4118", title: "Control Systems & Robotics Sessional", cr: 0.75, type: "sessional", sem: "4-1" },
  { code: "ECE 4123", title: "Digital Signal Processing", cr: 3, type: "theory", sem: "4-1" },
  { code: "ECE 4124", title: "Digital Signal Processing Sessional", cr: 0.75, type: "sessional", sem: "4-1" },
  { code: "ECE 4000_1", title: "Thesis/ Project-I", cr: 1.0, type: "sessional", sem: "4-1" }, // Renamed from ECE 4000 to avoid duplicate key
  { code: "ECE 4100", title: "Industrial Training", cr: 0.75, type: "sessional", sem: "4-1" },
  { code: "ECE 4122", title: "Seminar", cr: 0.75, type: "sessional", sem: "4-1" },
  // Optional I
  { code: "ECE 4111", title: "Digital Communication (Opt. I)", cr: 3, type: "theory", sem: "4-1" },
  { code: "ECE 4115", title: "Antennas & Propagations (Opt. I)", cr: 3, type: "theory", sem: "4-1" },
  { code: "ECE 4117", title: "Radar & Satellite Communication (Opt. I)", cr: 3, type: "theory", sem: "4-1" },
  { code: "ECE 4125", title: "Radio & TV Engineering (Opt. I)", cr: 3, type: "theory", sem: "4-1" },
  { code: "ECE 4141", title: "Fiber optic Communication (Opt. I)", cr: 3, type: "theory", sem: "4-1" },
  { code: "ECE 4143", title: "Bio-medical Engineering (Opt. I)", cr: 3, type: "theory", sem: "4-1" },
  // Optional II
  { code: "ECE 4127", title: "VLSI Design (Opt. II)", cr: 3, type: "theory", sem: "4-1" },
  { code: "ECE 4129", title: "Network Planning (Opt. II)", cr: 3, type: "theory", sem: "4-1" },
  { code: "ECE 4131", title: "Wireless Networks (Opt. II)", cr: 3, type: "theory", sem: "4-1" },
  { code: "ECE 4133", title: "Artificial Intelligence (Opt. II)", cr: 3, type: "theory", sem: "4-1" },
  { code: "ECE 4135", title: "Human Computer Interaction (Opt. II)", cr: 3, type: "theory", sem: "4-1" },

  // --- 4th Year Even Semester (4-2) ---
  { code: "ECE 4209", title: "Power Station, Switchgear & Protection", cr: 3, type: "theory", sem: "4-2" },
  { code: "ECE 4211", title: "Computer Networks", cr: 3, type: "theory", sem: "4-2" },
  { code: "ECE 4212", title: "Computer Networks Sessional", cr: 0.75, type: "sessional", sem: "4-2" },
  { code: "ECE 4223", title: "Digital Image Processing", cr: 3, type: "theory", sem: "4-2" },
  { code: "ECE 4224", title: "Digital Image Processing Sessional", cr: 1.5, type: "sessional", sem: "4-2" },
  { code: "ECE 4000_2", title: "Thesis/ Project-II", cr: 3.0, type: "sessional", sem: "4-2" },
  // Optional III
  { code: "ECE 4221", title: "Unix Programming (Opt. III)", cr: 3, type: "theory", sem: "4-2" },
  { code: "ECE 4227", title: "Network Security (Opt. III)", cr: 3, type: "theory", sem: "4-2" },
  { code: "ECE 4237", title: "Parallel & Distributed Processing (Opt. III)", cr: 3, type: "theory", sem: "4-2" },
  { code: "ECE 4239", title: "Computer Graphics & Animations (Opt. III)", cr: 3, type: "theory", sem: "4-2" },
  { code: "ECE 4241", title: "Computer Vision (Opt. III)", cr: 3, type: "theory", sem: "4-2" },
  { code: "ECE 4243", title: "Data Mining (Opt. III)", cr: 3, type: "theory", sem: "4-2" },
  { code: "ECE 4245", title: "Machine Learning (Opt. III)", cr: 3, type: "theory", sem: "4-2" },
  // Optional IV
  { code: "ECE 4247", title: "Computer Aided Instrumentation (Opt. IV)", cr: 3, type: "theory", sem: "4-2" },
  { code: "ECE 4249", title: "Computer Aided Power System Design (Opt. IV)", cr: 3, type: "theory", sem: "4-2" },
  { code: "ECE 4251", title: "Renewable Energy (Opt. IV)", cr: 3, type: "theory", sem: "4-2" },
  { code: "ECE 4253", title: "Microwave Engineering (Opt. IV)", cr: 3, type: "theory", sem: "4-2" },
  { code: "ECE 4255", title: "Power System Operation & Control (Opt. IV)", cr: 3, type: "theory", sem: "4-2" },
  { code: "ECE 4257", title: "High Voltage Engineering (Opt. IV)", cr: 3, type: "theory", sem: "4-2" },
  { code: "ECE 4259", title: "System Simulation & Modeling (Opt. IV)", cr: 3, type: "theory", sem: "4-2" },
];

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB for Course Seeding...");

    // Remove all existing courses to prevent unique key errors
    await Course.deleteMany({});
    console.log("Cleared existing courses.");

    const formattedCourses = coursesData.map(c => ({
      courseCode: c.code,
      courseName: c.title,
      credit: c.cr,
      department: "ECE", // Hardcoding ECE as this is the ECE syllabus
      semester: c.sem,
      courseType: c.type
    }));

    await Course.insertMany(formattedCourses);
    console.log(`Successfully seeded ${formattedCourses.length} courses!`);
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });
