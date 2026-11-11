const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const ClassSchedule = require("../../models/ClassSchedule");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGODB_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/onehub";

const scheduleData = [
  // =========================================================================
  // 1st Year Even Semester 2025 Series (1-2)
  // =========================================================================
  // Saturday
  { dayOfWeek: "Saturday", startTime: "08:00", endTime: "10:30", courseCode: "ECE 1203", type: "sessional", roomOrLab: "Lab 1", teacherInitials: ["HBK", "NIS"], department: "ECE", semester: "1-2", series: "2025 Series" },
  { dayOfWeek: "Saturday", startTime: "10:50", endTime: "11:40", courseCode: "HUM 1217", type: "theory", roomOrLab: "R-404", teacherInitials: ["TTT"], department: "ECE", semester: "1-2", series: "2025 Series" },
  { dayOfWeek: "Saturday", startTime: "11:40", endTime: "12:30", courseCode: "ECE 1205", type: "theory", roomOrLab: "R-404", teacherInitials: ["MI", "MKG"], department: "ECE", semester: "1-2", series: "2025 Series" },
  { dayOfWeek: "Saturday", startTime: "12:30", endTime: "13:20", courseCode: "ECE 1203", type: "theory", roomOrLab: "R-404", teacherInitials: ["HBK", "NIS"], department: "ECE", semester: "1-2", series: "2025 Series" },
  // Sunday
  { dayOfWeek: "Sunday", startTime: "08:00", endTime: "10:30", courseCode: "ECE 1206", type: "sessional", roomOrLab: "LAB-4", teacherInitials: ["MI", "MKG"], department: "ECE", semester: "1-2", series: "2025 Series" },
  { dayOfWeek: "Sunday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 1201", type: "theory", roomOrLab: "R-404", teacherInitials: ["FT", "NRP"], department: "ECE", semester: "1-2", series: "2025 Series" },
  { dayOfWeek: "Sunday", startTime: "11:40", endTime: "12:30", courseCode: "Math 1217", type: "theory", roomOrLab: "R-404", teacherInitials: ["MSA"], department: "ECE", semester: "1-2", series: "2025 Series" },
  { dayOfWeek: "Sunday", startTime: "12:30", endTime: "13:20", courseCode: "ECE 1203", type: "theory", roomOrLab: "R-404", teacherInitials: ["HBK", "NIS"], department: "ECE", semester: "1-2", series: "2025 Series" },
  // Monday
  { dayOfWeek: "Monday", startTime: "08:00", endTime: "08:50", courseCode: "ECE 1205", type: "theory", roomOrLab: "R-404", teacherInitials: ["MI", "MKG"], department: "ECE", semester: "1-2", series: "2025 Series" },
  { dayOfWeek: "Monday", startTime: "08:50", endTime: "09:40", courseCode: "Math 1217", type: "theory", roomOrLab: "R-404", teacherInitials: ["MI"], department: "ECE", semester: "1-2", series: "2025 Series" },
  { dayOfWeek: "Monday", startTime: "09:40", endTime: "10:30", courseCode: "HUM 1217", type: "theory", roomOrLab: "R-404", teacherInitials: ["SMK"], department: "ECE", semester: "1-2", series: "2025 Series" },
  { dayOfWeek: "Monday", startTime: "10:50", endTime: "13:20", courseCode: "ECE 1202", type: "sessional", roomOrLab: "Lab-3", teacherInitials: ["MAH", "NIS"], department: "ECE", semester: "1-2", series: "2025 Series" },
  // Tuesday
  { dayOfWeek: "Tuesday", startTime: "08:00", endTime: "08:50", courseCode: "ECE 1201", type: "theory", roomOrLab: "R-404", teacherInitials: ["FT", "NRP"], department: "ECE", semester: "1-2", series: "2025 Series" },
  { dayOfWeek: "Tuesday", startTime: "08:50", endTime: "09:40", courseCode: "HUM 1217", type: "theory", roomOrLab: "R-404", teacherInitials: ["TTT"], department: "ECE", semester: "1-2", series: "2025 Series" },
  { dayOfWeek: "Tuesday", startTime: "09:40", endTime: "10:30", courseCode: "ECE 1203", type: "theory", roomOrLab: "R-404", teacherInitials: ["HBK", "NIS"], department: "ECE", semester: "1-2", series: "2025 Series" },
  { dayOfWeek: "Tuesday", startTime: "10:50", endTime: "13:20", courseCode: "ECE 1200", type: "sessional", roomOrLab: "Lab-2", teacherInitials: ["FT"], department: "ECE", semester: "1-2", series: "2025 Series" },
  // Wednesday
  { dayOfWeek: "Wednesday", startTime: "08:00", endTime: "10:30", courseCode: "ECE 1204", type: "sessional", roomOrLab: "Lab 2", teacherInitials: ["HBK", "NIS"], department: "ECE", semester: "1-2", series: "2025 Series" },
  { dayOfWeek: "Wednesday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 1201", type: "theory", roomOrLab: "R-404", teacherInitials: ["FT", "NRP"], department: "ECE", semester: "1-2", series: "2025 Series" },
  { dayOfWeek: "Wednesday", startTime: "11:40", endTime: "12:30", courseCode: "Math 1217", type: "theory", roomOrLab: "R-404", teacherInitials: ["MSA"], department: "ECE", semester: "1-2", series: "2025 Series" },
  { dayOfWeek: "Wednesday", startTime: "12:30", endTime: "13:20", courseCode: "ECE 1205", type: "theory", roomOrLab: "R-404", teacherInitials: ["MI", "MKG"], department: "ECE", semester: "1-2", series: "2025 Series" },

  // =========================================================================
  // 2nd Year Even Semester 2024 Series (2-2)
  // =========================================================================
  // Saturday
  { dayOfWeek: "Saturday", startTime: "08:00", endTime: "10:30", courseCode: "ECE 2216", type: "sessional", roomOrLab: "Lab-2", teacherInitials: ["MNT", "NIS"], department: "ECE", semester: "2-2", series: "2024 Series" },
  { dayOfWeek: "Saturday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 2215", type: "theory", roomOrLab: "R-401", teacherInitials: ["NIS", "MNT"], department: "ECE", semester: "2-2", series: "2024 Series" },
  { dayOfWeek: "Saturday", startTime: "11:40", endTime: "12:30", courseCode: "HUM 2217", type: "theory", roomOrLab: "R-401", teacherInitials: ["SI"], department: "ECE", semester: "2-2", series: "2024 Series" },
  { dayOfWeek: "Saturday", startTime: "12:30", endTime: "13:20", courseCode: "ECE 2207", type: "theory", roomOrLab: "R-401", teacherInitials: ["FT", "NRP"], department: "ECE", semester: "2-2", series: "2024 Series" },
  { dayOfWeek: "Saturday", startTime: "14:30", endTime: "17:00", courseCode: "ECE 2214", type: "sessional", roomOrLab: "Lab-1", teacherInitials: ["MSA", "MI"], department: "ECE", semester: "2-2", series: "2024 Series" },
  // Sunday
  { dayOfWeek: "Sunday", startTime: "08:00", endTime: "08:50", courseCode: "ECE 2213", type: "theory", roomOrLab: "R-404", teacherInitials: ["MI"], department: "ECE", semester: "2-2", series: "2024 Series" },
  { dayOfWeek: "Sunday", startTime: "08:50", endTime: "09:40", courseCode: "Math 2217", type: "theory", roomOrLab: "R-404", teacherInitials: ["MRK"], department: "ECE", semester: "2-2", series: "2024 Series" },
  { dayOfWeek: "Sunday", startTime: "09:40", endTime: "10:30", courseCode: "ECE 2215", type: "theory", roomOrLab: "R-404", teacherInitials: ["NIS", "MNT"], department: "ECE", semester: "2-2", series: "2024 Series" },
  { dayOfWeek: "Sunday", startTime: "10:50", endTime: "13:20", courseCode: "ECE 2208", type: "sessional", roomOrLab: "LAB-8", teacherInitials: ["MAH"], department: "ECE", semester: "2-2", series: "2024 Series" },
  // Monday
  { dayOfWeek: "Monday", startTime: "08:00", endTime: "10:30", courseCode: "ECE 2200", type: "sessional", roomOrLab: "LAB-4", teacherInitials: ["MAH", "NRP"], department: "ECE", semester: "2-2", series: "2024 Series" },
  { dayOfWeek: "Monday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 2207", type: "theory", roomOrLab: "R-404", teacherInitials: ["FT", "NRP"], department: "ECE", semester: "2-2", series: "2024 Series" },
  { dayOfWeek: "Monday", startTime: "11:40", endTime: "12:30", courseCode: "HUM 2217", type: "theory", roomOrLab: "R-404", teacherInitials: ["MRI"], department: "ECE", semester: "2-2", series: "2024 Series" },
  { dayOfWeek: "Monday", startTime: "12:30", endTime: "13:20", courseCode: "ECE 2213", type: "theory", roomOrLab: "R-404", teacherInitials: ["MI"], department: "ECE", semester: "2-2", series: "2024 Series" },
  // Tuesday
  { dayOfWeek: "Tuesday", startTime: "08:00", endTime: "10:30", courseCode: "ECE 2200", type: "sessional", roomOrLab: "LAB-4", teacherInitials: ["MAH", "NRP"], department: "ECE", semester: "2-2", series: "2024 Series" },
  { dayOfWeek: "Tuesday", startTime: "10:50", endTime: "11:40", courseCode: "Math 2217", type: "theory", roomOrLab: "R-404", teacherInitials: ["MZH", "MRK"], department: "ECE", semester: "2-2", series: "2024 Series" },
  { dayOfWeek: "Tuesday", startTime: "11:40", endTime: "12:30", courseCode: "HUM 2217", type: "theory", roomOrLab: "R-404", teacherInitials: ["MRI"], department: "ECE", semester: "2-2", series: "2024 Series" },
  { dayOfWeek: "Tuesday", startTime: "12:30", endTime: "13:20", courseCode: "ECE 2215", type: "theory", roomOrLab: "R-404", teacherInitials: ["NIS", "MNT"], department: "ECE", semester: "2-2", series: "2024 Series" },
  { dayOfWeek: "Tuesday", startTime: "14:30", endTime: "17:00", courseCode: "ECE 2214", type: "sessional", roomOrLab: "Lab-2", teacherInitials: ["MSA", "MI"], department: "ECE", semester: "2-2", series: "2024 Series" },
  // Wednesday
  { dayOfWeek: "Wednesday", startTime: "08:00", endTime: "08:50", courseCode: "Math 2217", type: "theory", roomOrLab: "R-404", teacherInitials: ["MRK", "MZH"], department: "ECE", semester: "2-2", series: "2024 Series" },
  { dayOfWeek: "Wednesday", startTime: "08:50", endTime: "09:40", courseCode: "ECE 2213", type: "theory", roomOrLab: "R-404", teacherInitials: ["MZA"], department: "ECE", semester: "2-2", series: "2024 Series" },
  { dayOfWeek: "Wednesday", startTime: "09:40", endTime: "10:30", courseCode: "ECE 2207", type: "theory", roomOrLab: "R-404", teacherInitials: ["FT", "NRP"], department: "ECE", semester: "2-2", series: "2024 Series" },
  { dayOfWeek: "Wednesday", startTime: "10:50", endTime: "13:20", courseCode: "ECE 2216", type: "sessional", roomOrLab: "Lab-2", teacherInitials: ["MNT", "NIS"], department: "ECE", semester: "2-2", series: "2024 Series" },

  // =========================================================================
  // 3rd Year Odd Semester 2023 Series (3-1)
  // =========================================================================
  // Saturday
  { dayOfWeek: "Saturday", startTime: "09:40", endTime: "10:30", courseCode: "ECE 3107", type: "theory", roomOrLab: "R-403", teacherInitials: ["MKG", "MNT"], department: "ECE", semester: "3-1", series: "2023 Series" },
  { dayOfWeek: "Saturday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 3121", type: "theory", roomOrLab: "R-403", teacherInitials: ["MMR", "RI"], department: "ECE", semester: "3-1", series: "2023 Series" },
  { dayOfWeek: "Saturday", startTime: "11:40", endTime: "12:30", courseCode: "ECE 3119", type: "theory", roomOrLab: "R-403", teacherInitials: ["NRP"], department: "ECE", semester: "3-1", series: "2023 Series" },
  { dayOfWeek: "Saturday", startTime: "12:30", endTime: "13:20", courseCode: "ECE 3107", type: "theory", roomOrLab: "R-403", teacherInitials: ["MKG", "MNT"], department: "ECE", semester: "3-1", series: "2023 Series" },
  // Sunday
  { dayOfWeek: "Sunday", startTime: "08:00", endTime: "10:30", courseCode: "CE 3100 / ECE 3118", type: "sessional", roomOrLab: "ECE Seminar Room/ LAB-2", teacherInitials: ["ST", "HBK", "MNT"], department: "ECE", semester: "3-1", series: "2023 Series" },
  { dayOfWeek: "Sunday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 3121", type: "theory", roomOrLab: "R-403", teacherInitials: ["MMR", "RI"], department: "ECE", semester: "3-1", series: "2023 Series" },
  { dayOfWeek: "Sunday", startTime: "11:40", endTime: "12:30", courseCode: "ECE 3117", type: "theory", roomOrLab: "R-403", teacherInitials: ["HBK", "MNT"], department: "ECE", semester: "3-1", series: "2023 Series" },
  { dayOfWeek: "Sunday", startTime: "12:30", endTime: "13:20", courseCode: "ECE 3111", type: "theory", roomOrLab: "R-403", teacherInitials: ["MFA", "RA"], department: "ECE", semester: "3-1", series: "2023 Series" },
  { dayOfWeek: "Sunday", startTime: "14:30", endTime: "17:00", courseCode: "ECE 3100", type: "sessional", roomOrLab: "Lab-All", teacherInitials: ["All Faculty"], department: "ECE", semester: "3-1", series: "2023 Series" },
  // Monday
  { dayOfWeek: "Monday", startTime: "08:00", endTime: "10:30", courseCode: "ECE 3108", type: "sessional", roomOrLab: "LAB-8", teacherInitials: ["MKG", "GKH"], department: "ECE", semester: "3-1", series: "2023 Series" },
  { dayOfWeek: "Monday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 3107", type: "theory", roomOrLab: "R-403", teacherInitials: ["MKG", "MNT"], department: "ECE", semester: "3-1", series: "2023 Series" },
  { dayOfWeek: "Monday", startTime: "11:40", endTime: "12:30", courseCode: "ECE 3111", type: "theory", roomOrLab: "R-403", teacherInitials: ["MFA", "RA"], department: "ECE", semester: "3-1", series: "2023 Series" },
  { dayOfWeek: "Monday", startTime: "12:30", endTime: "13:20", courseCode: "ECE 3119", type: "theory", roomOrLab: "R-403", teacherInitials: ["NRP"], department: "ECE", semester: "3-1", series: "2023 Series" },
  // Tuesday
  { dayOfWeek: "Tuesday", startTime: "08:00", endTime: "10:30", courseCode: "ECE 3112", type: "sessional", roomOrLab: "LAB-2", teacherInitials: ["MFA", "RA"], department: "ECE", semester: "3-1", series: "2023 Series" },
  { dayOfWeek: "Tuesday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 3111", type: "theory", roomOrLab: "R-403", teacherInitials: ["MFA", "RA"], department: "ECE", semester: "3-1", series: "2023 Series" },
  { dayOfWeek: "Tuesday", startTime: "11:40", endTime: "12:30", courseCode: "ECE 3117", type: "theory", roomOrLab: "R-403", teacherInitials: ["HBK", "MNT"], department: "ECE", semester: "3-1", series: "2023 Series" },
  { dayOfWeek: "Tuesday", startTime: "12:30", endTime: "13:20", courseCode: "ECE 3121", type: "theory", roomOrLab: "R-403", teacherInitials: ["MMR", "RI"], department: "ECE", semester: "3-1", series: "2023 Series" },
  // Wednesday
  { dayOfWeek: "Wednesday", startTime: "08:00", endTime: "10:30", courseCode: "ECE 3112", type: "sessional", roomOrLab: "LAB-1", teacherInitials: ["MFA", "RA"], department: "ECE", semester: "3-1", series: "2023 Series" },
  { dayOfWeek: "Wednesday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 3107", type: "theory", roomOrLab: "R-403", teacherInitials: ["MKG", "MNT"], department: "ECE", semester: "3-1", series: "2023 Series" },
  { dayOfWeek: "Wednesday", startTime: "11:40", endTime: "12:30", courseCode: "ECE 3119", type: "theory", roomOrLab: "R-403", teacherInitials: ["NRP"], department: "ECE", semester: "3-1", series: "2023 Series" },
  { dayOfWeek: "Wednesday", startTime: "12:30", endTime: "13:20", courseCode: "ECE 3117", type: "theory", roomOrLab: "R-403", teacherInitials: ["HBK", "MNT"], department: "ECE", semester: "3-1", series: "2023 Series" },

  // =========================================================================
  // 3rd Year Even Semester 2022 Series (3-2)
  // =========================================================================
  // Saturday
  { dayOfWeek: "Saturday", startTime: "09:40", endTime: "10:30", courseCode: "ME 3219", type: "theory", roomOrLab: "R-402", teacherInitials: ["MMR", "MRP"], department: "ECE", semester: "3-2", series: "2022 Series" },
  { dayOfWeek: "Saturday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 3221", type: "theory", roomOrLab: "R-402", teacherInitials: ["HBK", "NIS"], department: "ECE", semester: "3-2", series: "2022 Series" },
  { dayOfWeek: "Saturday", startTime: "11:40", endTime: "12:30", courseCode: "ECE 3205", type: "theory", roomOrLab: "R-402", teacherInitials: ["MFA", "MKG"], department: "ECE", semester: "3-2", series: "2022 Series" },
  { dayOfWeek: "Saturday", startTime: "12:30", endTime: "13:20", courseCode: "ECE 3207", type: "theory", roomOrLab: "R-402", teacherInitials: ["MAH", "MNT"], department: "ECE", semester: "3-2", series: "2022 Series" },
  // Sunday
  { dayOfWeek: "Sunday", startTime: "08:00", endTime: "08:50", courseCode: "ME 3219", type: "theory", roomOrLab: "R-402", teacherInitials: ["MMR", "MRP"], department: "ECE", semester: "3-2", series: "2022 Series" },
  { dayOfWeek: "Sunday", startTime: "08:50", endTime: "09:40", courseCode: "HUM 3217", type: "theory", roomOrLab: "R-402", teacherInitials: ["TK"], department: "ECE", semester: "3-2", series: "2022 Series" },
  { dayOfWeek: "Sunday", startTime: "09:40", endTime: "10:30", courseCode: "ECE 3205", type: "theory", roomOrLab: "R-402", teacherInitials: ["MFA", "MKG"], department: "ECE", semester: "3-2", series: "2022 Series" },
  { dayOfWeek: "Sunday", startTime: "10:50", endTime: "13:20", courseCode: "ECE 3200", type: "sessional", roomOrLab: "R-402", teacherInitials: ["GKH", "NRP"], department: "ECE", semester: "3-2", series: "2022 Series" },
  // Monday
  { dayOfWeek: "Monday", startTime: "09:40", endTime: "10:30", courseCode: "ME 3219", type: "theory", roomOrLab: "R-402", teacherInitials: ["MMR", "MRP"], department: "ECE", semester: "3-2", series: "2022 Series" },
  { dayOfWeek: "Monday", startTime: "10:50", endTime: "13:20", courseCode: "ECE 3222", type: "sessional", roomOrLab: "Lab 2", teacherInitials: ["HBK", "NIS"], department: "ECE", semester: "3-2", series: "2022 Series" },
  // Tuesday
  { dayOfWeek: "Tuesday", startTime: "09:40", endTime: "10:30", courseCode: "ECE 3207", type: "theory", roomOrLab: "R-402", teacherInitials: ["MAH", "MNT"], department: "ECE", semester: "3-2", series: "2022 Series" },
  { dayOfWeek: "Tuesday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 3205", type: "theory", roomOrLab: "R-402", teacherInitials: ["MFA", "MKG"], department: "ECE", semester: "3-2", series: "2022 Series" },
  { dayOfWeek: "Tuesday", startTime: "11:40", endTime: "12:30", courseCode: "HUM 3217", type: "theory", roomOrLab: "R-402", teacherInitials: ["KF"], department: "ECE", semester: "3-2", series: "2022 Series" },
  { dayOfWeek: "Tuesday", startTime: "12:30", endTime: "13:20", courseCode: "ECE 3221", type: "theory", roomOrLab: "R-402", teacherInitials: ["HBK", "NIS"], department: "ECE", semester: "3-2", series: "2022 Series" },
  { dayOfWeek: "Tuesday", startTime: "14:30", endTime: "17:00", courseCode: "ECE 3200", type: "sessional", roomOrLab: "R-401", teacherInitials: ["GKH", "NRP"], department: "ECE", semester: "3-2", series: "2022 Series" },
  // Wednesday
  { dayOfWeek: "Wednesday", startTime: "08:00", endTime: "10:30", courseCode: "ECE 3208 / 3206", type: "sessional", roomOrLab: "Lab 10 / Lab-3", teacherInitials: ["MAH", "MNT", "MFA", "MKG"], department: "ECE", semester: "3-2", series: "2022 Series" },
  { dayOfWeek: "Wednesday", startTime: "10:50", endTime: "11:40", courseCode: "HUM 3217", type: "theory", roomOrLab: "R-402", teacherInitials: ["KF"], department: "ECE", semester: "3-2", series: "2022 Series" },
  { dayOfWeek: "Wednesday", startTime: "11:40", endTime: "12:30", courseCode: "ECE 3207", type: "theory", roomOrLab: "R-402", teacherInitials: ["MAH", "MNT"], department: "ECE", semester: "3-2", series: "2022 Series" },
  { dayOfWeek: "Wednesday", startTime: "12:30", endTime: "13:20", courseCode: "ECE 3221", type: "theory", roomOrLab: "R-402", teacherInitials: ["HBK", "NIS"], department: "ECE", semester: "3-2", series: "2022 Series" },
  { dayOfWeek: "Wednesday", startTime: "14:30", endTime: "17:00", courseCode: "ME 3220", type: "sessional", roomOrLab: "Lab-11", teacherInitials: ["MRP"], department: "ECE", semester: "3-2", series: "2022 Series" },

  // =========================================================================
  // 4th Year Even Semester 2021 Series (4-2)
  // =========================================================================
  // Saturday
  { dayOfWeek: "Saturday", startTime: "08:00", endTime: "08:50", courseCode: "ECE 4227", type: "theory", roomOrLab: "R-401", teacherInitials: ["RIY"], department: "ECE", semester: "4-2", series: "2021 Series" },
  { dayOfWeek: "Saturday", startTime: "08:50", endTime: "09:40", courseCode: "ECE 4251", type: "theory", roomOrLab: "R-401", teacherInitials: ["RIS"], department: "ECE", semester: "4-2", series: "2021 Series" },
  { dayOfWeek: "Saturday", startTime: "09:40", endTime: "10:30", courseCode: "ECE 4209", type: "theory", roomOrLab: "R-401", teacherInitials: ["FT"], department: "ECE", semester: "4-2", series: "2021 Series" },
  { dayOfWeek: "Saturday", startTime: "10:50", endTime: "13:20", courseCode: "ECE 4212", type: "sessional", roomOrLab: "LAB-1", teacherInitials: ["MFA"], department: "ECE", semester: "4-2", series: "2021 Series" },
  { dayOfWeek: "Saturday", startTime: "14:30", endTime: "17:00", courseCode: "ECE 4000", type: "sessional", roomOrLab: "Lab-ALL", teacherInitials: ["ALL Faculty"], department: "ECE", semester: "4-2", series: "2021 Series" },
  // Sunday
  { dayOfWeek: "Sunday", startTime: "08:00", endTime: "10:30", courseCode: "ECE 4224", type: "sessional", roomOrLab: "LAB-1", teacherInitials: ["RIY", "MKG"], department: "ECE", semester: "4-2", series: "2021 Series" },
  { dayOfWeek: "Sunday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 4211", type: "theory", roomOrLab: "R-401", teacherInitials: ["MFA"], department: "ECE", semester: "4-2", series: "2021 Series" },
  { dayOfWeek: "Sunday", startTime: "11:40", endTime: "12:30", courseCode: "ECE 4227", type: "theory", roomOrLab: "R-401", teacherInitials: ["RIY"], department: "ECE", semester: "4-2", series: "2021 Series" },
  // Monday
  { dayOfWeek: "Monday", startTime: "08:00", endTime: "08:50", courseCode: "ECE 4245", type: "theory", roomOrLab: "R-401", teacherInitials: ["MSZ"], department: "ECE", semester: "4-2", series: "2021 Series" },
  { dayOfWeek: "Monday", startTime: "08:50", endTime: "10:30", courseCode: "ECE 4224", type: "sessional", roomOrLab: "LAB-2", teacherInitials: ["RIY", "MKG"], department: "ECE", semester: "4-2", series: "2021 Series" },
  { dayOfWeek: "Monday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 4223", type: "theory", roomOrLab: "R-401", teacherInitials: ["MKG", "RIY"], department: "ECE", semester: "4-2", series: "2021 Series" },
  { dayOfWeek: "Monday", startTime: "11:40", endTime: "12:30", courseCode: "ECE 4209", type: "theory", roomOrLab: "R-401", teacherInitials: ["FT"], department: "ECE", semester: "4-2", series: "2021 Series" },
  { dayOfWeek: "Monday", startTime: "17:00", endTime: "17:50", courseCode: "ECE 4245", type: "theory", roomOrLab: "R-401", teacherInitials: ["MSZ"], department: "ECE", semester: "4-2", series: "2021 Series" },
  // Tuesday
  { dayOfWeek: "Tuesday", startTime: "08:00", endTime: "10:30", courseCode: "ECE 4252", type: "sessional", roomOrLab: "LAB-1/15", teacherInitials: ["SH"], department: "ECE", semester: "4-2", series: "2021 Series" },
  { dayOfWeek: "Tuesday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 4211", type: "theory", roomOrLab: "R-401", teacherInitials: ["MFA"], department: "ECE", semester: "4-2", series: "2021 Series" },
  { dayOfWeek: "Tuesday", startTime: "11:40", endTime: "12:30", courseCode: "ECE 4223", type: "theory", roomOrLab: "R-401", teacherInitials: ["MKG", "RIY"], department: "ECE", semester: "4-2", series: "2021 Series" },
  { dayOfWeek: "Tuesday", startTime: "12:30", endTime: "13:20", courseCode: "ECE 4227", type: "theory", roomOrLab: "R-401", teacherInitials: ["RIY"], department: "ECE", semester: "4-2", series: "2021 Series" },
  { dayOfWeek: "Tuesday", startTime: "15:20", endTime: "16:10", courseCode: "ECE 4245", type: "theory", roomOrLab: "R-401", teacherInitials: ["MSZ"], department: "ECE", semester: "4-2", series: "2021 Series" },
  { dayOfWeek: "Tuesday", startTime: "17:00", endTime: "17:50", courseCode: "ECE 4251", type: "theory", roomOrLab: "R-401", teacherInitials: ["SB"], department: "ECE", semester: "4-2", series: "2021 Series" },
  // Wednesday
  { dayOfWeek: "Wednesday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 4211", type: "theory", roomOrLab: "R-401", teacherInitials: ["MFA"], department: "ECE", semester: "4-2", series: "2021 Series" },
  { dayOfWeek: "Wednesday", startTime: "11:40", endTime: "12:30", courseCode: "ECE 4223", type: "theory", roomOrLab: "R-401", teacherInitials: ["MKG", "RIY"], department: "ECE", semester: "4-2", series: "2021 Series" },
  { dayOfWeek: "Wednesday", startTime: "12:30", endTime: "13:20", courseCode: "ECE 4209", type: "theory", roomOrLab: "R-401", teacherInitials: ["FT"], department: "ECE", semester: "4-2", series: "2021 Series" },
  { dayOfWeek: "Wednesday", startTime: "14:30", endTime: "17:00", courseCode: "ECE 4228 / 4246", type: "sessional", roomOrLab: "LAB-1 / LAB-2", teacherInitials: ["RIY", "MSZ"], department: "ECE", semester: "4-2", series: "2021 Series" }
];

async function seedRoutine() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for Routine Seeding.");

    // Remove all old routine items for these series to avoid conflicts
    const seriesToUpdate = ["2025 Series", "2024 Series", "2023 Series", "2022 Series", "2021 Series"];
    await ClassSchedule.deleteMany({ series: { $in: seriesToUpdate } });
    console.log(`Cleared existing schedules for: ${seriesToUpdate.join(", ")}`);

    const result = await ClassSchedule.insertMany(scheduleData);
    console.log(`Successfully seeded ${result.length} routine items across all 5 semesters!`);

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding routine:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedRoutine();
}

module.exports = { scheduleData, seedRoutine };
