const mongoose = require('mongoose');
require('dotenv').config();

async function resetRegistrations() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const registrationsColl = mongoose.connection.collection('registrations');

    // Count before
    const count22 = await registrationsColl.countDocuments({ semester: '2-2' });
    const count12 = await registrationsColl.countDocuments({ semester: '1-2' });
    console.log(`Current auto-approved 2-2 registrations: ${count22}`);
    console.log(`Current auto-approved 1-2 registrations: ${count12}`);

    // Delete the artificial 2-2 and 1-2 registrations so students must apply fresh
    const res22 = await registrationsColl.deleteMany({ semester: '2-2' });
    console.log(`Deleted ${res22.deletedCount} registrations for semester 2-2.`);

    const res12 = await registrationsColl.deleteMany({ semester: '1-2' });
    console.log(`Deleted ${res12.deletedCount} registrations for semester 1-2.`);

    // Verify remaining
    const remaining = await registrationsColl.find({}).toArray();
    const summary = {};
    for (const r of remaining) {
      const key = `${r.semester} (${r.status})`;
      summary[key] = (summary[key] || 0) + 1;
    }
    console.log('Remaining registrations in database:', summary);

    console.log('Reset complete: Students of Batch 24 and Batch 25 must now apply through /registration.');
    process.exit(0);
  } catch (err) {
    console.error('Error resetting registrations:', err);
    process.exit(1);
  }
}

resetRegistrations();
