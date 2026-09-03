
const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');

  const ranas = await User.find({ name: 'Dr. Md. Masud Rana', department: 'EEE' });
  console.log('Found:', ranas.length);
  if (ranas.length > 1) {
    const keepId = ranas[0]._id;
    await User.deleteMany({ name: 'Dr. Md. Masud Rana', department: 'EEE', _id: { \\\: keepId } });
    console.log('Deleted duplicate Head.');
  }

  process.exit(0);
}
run();

