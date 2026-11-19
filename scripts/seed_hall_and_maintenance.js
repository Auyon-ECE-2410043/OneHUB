/**
 * Seed script: Populates authentic hall room allocation and maintenance tickets
 * for Nafisa Islam (2410042) and roommates.
 */

const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");
const HallApplication = require("../models/HallApplication");
const HallMaintenance = require("../models/HallMaintenance");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const nafisa = await User.findOne({ rollNo: "2410042" });
  if (nafisa) {
    // 1. Create or update approved Hall Application for Nafisa
    await HallApplication.findOneAndUpdate(
      { studentId: nafisa._id },
      {
        studentId: nafisa._id,
        semester: "2-2",
        fullName: nafisa.name,
        rollNo: nafisa.rollNo,
        contactNumber: nafisa.phone || "01989646177",
        gender: "Female",
        department: "ECE",
        isCurrentResident: true,
        category: "merit",
        fatherContactNo: nafisa.fatherContactNo || "01715637571",
        motherContactNo: nafisa.motherContactNo || "0173411519",
        nidNumber: "1998541298451245",
        hometownInsideRajshahi: false,
        cgpa: 3.75,
        preferredHall: "Deshratna Sheikh Hasina Hall",
        allocatedHall: "Deshratna Sheikh Hasina Hall",
        allocatedRoomNumber: "312",
        allocatedBedNumber: "Bed-02",
        status: "approved",
        reviewedAt: new Date("2026-08-15"),
      },
      { upsert: true, new: true }
    );
    console.log("Nafisa hall allocation seeded.");

    // 2. Seed 3 roommates in Room 312 of Deshratna Sheikh Hasina Hall
    const roommate1 = await User.findOne({ rollNo: "2510032" }); // Anika Tahsin
    if (roommate1) {
      await HallApplication.findOneAndUpdate(
        { studentId: roommate1._id },
        {
          studentId: roommate1._id,
          semester: "2-2",
          fullName: roommate1.name,
          rollNo: roommate1.rollNo,
          contactNumber: "01712345678",
          gender: "Female",
          department: "ECE",
          isCurrentResident: true,
          category: "merit",
          fatherContactNo: "01711111111",
          motherContactNo: "01722222222",
          nidNumber: "1998541298451241",
          hometownInsideRajshahi: false,
          cgpa: 3.80,
          preferredHall: "Deshratna Sheikh Hasina Hall",
          allocatedHall: "Deshratna Sheikh Hasina Hall",
          allocatedRoomNumber: "312",
          allocatedBedNumber: "Bed-01",
          status: "approved",
          reviewedAt: new Date("2026-08-15"),
        },
        { upsert: true }
      );
    }

    const roommate2 = await User.findOne({ rollNo: "2510030" }); // Tasfia Zinat
    if (roommate2) {
      await HallApplication.findOneAndUpdate(
        { studentId: roommate2._id },
        {
          studentId: roommate2._id,
          semester: "2-2",
          fullName: roommate2.name,
          rollNo: roommate2.rollNo,
          contactNumber: "01898765432",
          gender: "Female",
          department: "ECE",
          isCurrentResident: true,
          category: "merit",
          fatherContactNo: "01811111111",
          motherContactNo: "01822222222",
          nidNumber: "1998541298451242",
          hometownInsideRajshahi: false,
          cgpa: 3.70,
          preferredHall: "Deshratna Sheikh Hasina Hall",
          allocatedHall: "Deshratna Sheikh Hasina Hall",
          allocatedRoomNumber: "312",
          allocatedBedNumber: "Bed-03",
          status: "approved",
          reviewedAt: new Date("2026-08-15"),
        },
        { upsert: true }
      );
    }

    const roommate3 = await User.findOne({ rollNo: "2510038" }); // Tanisha Khan
    if (roommate3) {
      await HallApplication.findOneAndUpdate(
        { studentId: roommate3._id },
        {
          studentId: roommate3._id,
          semester: "2-2",
          fullName: roommate3.name,
          rollNo: roommate3.rollNo,
          contactNumber: "01911223344",
          gender: "Female",
          department: "ECE",
          isCurrentResident: true,
          category: "merit",
          fatherContactNo: "01911111111",
          motherContactNo: "01922222222",
          nidNumber: "1998541298451243",
          hometownInsideRajshahi: false,
          cgpa: 3.65,
          preferredHall: "Deshratna Sheikh Hasina Hall",
          allocatedHall: "Deshratna Sheikh Hasina Hall",
          allocatedRoomNumber: "312",
          allocatedBedNumber: "Bed-04",
          status: "approved",
          reviewedAt: new Date("2026-08-15"),
        },
        { upsert: true }
      );
    }
    console.log("Roommates seeded in Room 312.");

    // 3. Seed Maintenance tickets
    await HallMaintenance.deleteMany({ studentId: nafisa._id });
    await HallMaintenance.insertMany([
      {
        studentId: nafisa._id,
        hallName: "Deshratna Sheikh Hasina Hall",
        roomNumber: "312",
        category: "Electricity",
        title: "Ceiling Fan Regulator Not Responding",
        description: "The fan speed regulator knob is stuck at speed 1. Needs replacement or capacitor inspection.",
        priority: "normal",
        status: "In Progress",
        technicianAssigned: "Md. Rafiqul Islam (Hall Electrician)",
        staffNotes: "Replacement regulator requisition submitted. Repair scheduled for 3:00 PM.",
        reportedAt: new Date("2026-11-18T10:30:00Z"),
      },
      {
        studentId: nafisa._id,
        hallName: "Deshratna Sheikh Hasina Hall",
        roomNumber: "312",
        category: "Plumbing",
        title: "Attached Washroom Basin Tap Leakage",
        description: "Water constantly drips from the cold water tap fitting causing dampness on floor.",
        priority: "urgent",
        status: "Resolved",
        technicianAssigned: "Karim Mia (Senior Plumber)",
        staffNotes: "Washer replaced and pipe joint sealed with Teflon tape.",
        reportedAt: new Date("2026-11-14T09:15:00Z"),
        resolvedAt: new Date("2026-11-15T14:20:00Z"),
      },
      {
        studentId: nafisa._id,
        hallName: "Deshratna Sheikh Hasina Hall",
        roomNumber: "312",
        category: "Wi-Fi/LAN",
        title: "LAN Port Wall Socket Loose Connection",
        description: "Port 2 on the northern wall has packet loss when Ethernet cable is moved.",
        priority: "normal",
        status: "Pending",
        staffNotes: "Awaiting IT network team weekly inspection.",
        reportedAt: new Date("2026-11-19T11:45:00Z"),
      },
    ]);
    console.log("Seeded maintenance tickets for Nafisa.");
  }

  await mongoose.disconnect();
}

seed().catch(console.error);
