require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const models = ["User", "Clearance", "HallApplication", "CourseRegistration", "MedicalAppointment", "Attendance"];
  for (const m of models) {
    try {
      const Mod = require("./models/" + m);
      // Delete if rollNo matches
      if (Mod.schema.paths.rollNo) {
        const res = await Mod.deleteMany({ rollNo: "2410044" });
        if (res.deletedCount > 0) console.log(m, "deleted by rollNo:", res.deletedCount);
      }
      // Delete if email matches
      if (Mod.schema.paths.email) {
        const res2 = await Mod.deleteMany({ email: { $regex: "2410044", $options: "i" } });
        if (res2.deletedCount > 0) console.log(m, "deleted by email:", res2.deletedCount);
      }
    } catch(e) {}
  }
  console.log("Cleanup complete!");
  process.exit(0);
});
