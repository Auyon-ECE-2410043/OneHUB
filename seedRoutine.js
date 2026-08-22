const mongoose = require("mongoose");
const dotenv = require("dotenv");
const ClassSchedule = require("./models/ClassSchedule");

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/onehub";

const scheduleData = [
  // ==========================================
  // 1st Year Odd Semester 2025 Series (1-1)
  // ==========================================
  // Saturday
  { dayOfWeek: "Saturday", startTime: "08:50", endTime: "09:40", courseCode: "HUM 1117", type: "theory", roomOrLab: "R-404", teacherInitials: ["MHS"], department: "ECE", semester: "1-1", series: "2025 Series" },
  { dayOfWeek: "Saturday", startTime: "09:40", endTime: "10:30", courseCode: "PHY 1117", type: "theory", roomOrLab: "R-404", teacherInitials: ["MAH"], department: "ECE", semester: "1-1", series: "2025 Series" },
  { dayOfWeek: "Saturday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 1103", type: "theory", roomOrLab: "R-404", teacherInitials: ["HBK"], department: "ECE", semester: "1-1", series: "2025 Series" },
  { dayOfWeek: "Saturday", startTime: "11:40", endTime: "12:30", courseCode: "MATH 1117", type: "theory", roomOrLab: "R-404", teacherInitials: ["MRK"], department: "ECE", semester: "1-1", series: "2025 Series" },
  { dayOfWeek: "Saturday", startTime: "12:30", endTime: "01:20", courseCode: "ECE 1101", type: "theory", roomOrLab: "R-404", teacherInitials: ["MAH"], department: "ECE", semester: "1-1", series: "2025 Series" },
  // Sunday
  { dayOfWeek: "Sunday", startTime: "08:50", endTime: "10:30", courseCode: "HUM 1118", type: "sessional", roomOrLab: "Lab-7", teacherInitials: ["SA"], department: "ECE", semester: "1-1", series: "2025 Series" },
  { dayOfWeek: "Sunday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 1103", type: "theory", roomOrLab: "R-404", teacherInitials: ["HBK"], department: "ECE", semester: "1-1", series: "2025 Series" },
  { dayOfWeek: "Sunday", startTime: "11:40", endTime: "12:30", courseCode: "PHY 1117", type: "theory", roomOrLab: "R-404", teacherInitials: ["MFH"], department: "ECE", semester: "1-1", series: "2025 Series" },
  { dayOfWeek: "Sunday", startTime: "12:30", endTime: "01:20", courseCode: "MATH 1117", type: "theory", roomOrLab: "R-404", teacherInitials: ["MZA"], department: "ECE", semester: "1-1", series: "2025 Series" },
  // Monday
  { dayOfWeek: "Monday", startTime: "08:00", endTime: "08:50", courseCode: "ECE 1103", type: "theory", roomOrLab: "R-404", teacherInitials: ["HBK"], department: "ECE", semester: "1-1", series: "2025 Series" },
  { dayOfWeek: "Monday", startTime: "08:50", endTime: "09:40", courseCode: "PHY 1117", type: "theory", roomOrLab: "R-404", teacherInitials: ["MFH"], department: "ECE", semester: "1-1", series: "2025 Series" },
  { dayOfWeek: "Monday", startTime: "09:40", endTime: "10:30", courseCode: "HUM 1117", type: "theory", roomOrLab: "R-404", teacherInitials: ["OF"], department: "ECE", semester: "1-1", series: "2025 Series" },
  { dayOfWeek: "Monday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 1101", type: "theory", roomOrLab: "R-404", teacherInitials: ["SMAR"], department: "ECE", semester: "1-1", series: "2025 Series" },
  
  // ==========================================
  // 2nd Year Odd Semester 2024 Series (2-1)
  // ==========================================
  // Saturday
  { dayOfWeek: "Saturday", startTime: "08:00", endTime: "10:30", courseCode: "ECE 2104", type: "sessional", roomOrLab: "LAB-1", teacherInitials: ["MFA", "NIS"], department: "ECE", semester: "2-1", series: "2024 Series" },
  { dayOfWeek: "Saturday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 2105", type: "theory", roomOrLab: "R-403", teacherInitials: ["MKG", "MI"], department: "ECE", semester: "2-1", series: "2024 Series" },
  { dayOfWeek: "Saturday", startTime: "11:40", endTime: "12:30", courseCode: "MATH 2117", type: "theory", roomOrLab: "R-403", teacherInitials: ["MZH"], department: "ECE", semester: "2-1", series: "2024 Series" },
  { dayOfWeek: "Saturday", startTime: "12:30", endTime: "01:20", courseCode: "ECE 2111", type: "theory", roomOrLab: "R-403", teacherInitials: ["NRP", "MNT"], department: "ECE", semester: "2-1", series: "2024 Series" },
  // Sunday
  { dayOfWeek: "Sunday", startTime: "08:00", endTime: "10:30", courseCode: "ECE 2106 / 2112", type: "sessional", roomOrLab: "LAB-14 / LAB-2", teacherInitials: ["MKG", "MI", "NRP", "MNT"], department: "ECE", semester: "2-1", series: "2024 Series" },
  { dayOfWeek: "Sunday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 2103", type: "theory", roomOrLab: "R-403", teacherInitials: ["MFA", "NIS"], department: "ECE", semester: "2-1", series: "2024 Series" },
  { dayOfWeek: "Sunday", startTime: "11:40", endTime: "12:30", courseCode: "CHEM 2117", type: "theory", roomOrLab: "R-403", teacherInitials: ["SR"], department: "ECE", semester: "2-1", series: "2024 Series" },
  { dayOfWeek: "Sunday", startTime: "12:30", endTime: "01:20", courseCode: "MATH 2117", type: "theory", roomOrLab: "R-403", teacherInitials: ["MZH"], department: "ECE", semester: "2-1", series: "2024 Series" },

  // ==========================================
  // 3rd Year Even Semester 2022 Series (3-2)
  // ==========================================
  // Saturday
  { dayOfWeek: "Saturday", startTime: "08:00", endTime: "08:50", courseCode: "ECE 3207", type: "theory", roomOrLab: "R-401", teacherInitials: ["MAH", "MNT"], department: "ECE", semester: "3-2", series: "2022 Series" },
  { dayOfWeek: "Saturday", startTime: "08:50", endTime: "09:40", courseCode: "ECE 3205", type: "theory", roomOrLab: "R-401", teacherInitials: ["MFA", "MKG"], department: "ECE", semester: "3-2", series: "2022 Series" },
  { dayOfWeek: "Saturday", startTime: "09:40", endTime: "10:30", courseCode: "ME 3219", type: "theory", roomOrLab: "R-401", teacherInitials: ["MMR", "MRP"], department: "ECE", semester: "3-2", series: "2022 Series" },
  { dayOfWeek: "Saturday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 3221", type: "theory", roomOrLab: "R-401", teacherInitials: ["HBK", "NIS"], department: "ECE", semester: "3-2", series: "2022 Series" }
];

async function seedRoutine() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for Routine Seeding.");

    // Clear existing schedule just for these semesters to avoid duplicates
    await ClassSchedule.deleteMany({});
    console.log("Cleared existing class schedules.");

    await ClassSchedule.insertMany(scheduleData);
    console.log(`Successfully seeded ${scheduleData.length} routine items!`);

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding routine:", error);
    process.exit(1);
  }
}

seedRoutine();
