const mongoose = require("mongoose");
const ClassSchedule = require("../models/ClassSchedule");
const { scheduleData } = require("../scripts/database/seedRoutine");

async function seedRoutine() {
  const seriesToUpdate = ["2025 Series", "2024 Series", "2023 Series", "2022 Series", "2021 Series"];
  await ClassSchedule.deleteMany({ series: { $in: seriesToUpdate } });
  await ClassSchedule.insertMany(scheduleData);
  console.log(`RUET ECE Routine Seeded Successfully (${scheduleData.length} classes across 1-2, 2-2, 3-1, 3-2, 4-2)!`);
}

module.exports = { seedRoutine, ECE_ROUTINE_DATA: scheduleData };
