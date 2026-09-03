const mongoose = require('mongoose');
const SystemSettings = require('./models/SystemSettings');

async function test() {
  await mongoose.connect('mongodb://auyondip_db_user:WgAU5JbLOoWFwPtr@ac-mk2ydqa-shard-00-00.dwazsit.mongodb.net:27017,ac-mk2ydqa-shard-00-01.dwazsit.mongodb.net:27017,ac-mk2ydqa-shard-00-02.dwazsit.mongodb.net:27017/onehub?ssl=true&replicaSet=atlas-8s7x78-shard-0&authSource=admin&appName=Cluster0');
  
  let settings = await SystemSettings.findOne();
  console.log("DB Settings:", JSON.stringify(settings, null, 2));

  // Try to update feature 'routine' to false
  const defaultFeatures = {
    routine: true, courses: true, registration: true, attendance: true, marks: true, cgpa: true,
    fees: true, hall: true, clearance: true, medical: true, notices: true, faculty: true, calendar: true
  };

  const featureKey = 'routine';
  const enabled = false;

  if (Object.keys(defaultFeatures).includes(featureKey)) {
    if (!settings.features) {
      settings.features = { ...defaultFeatures };
    }
    
    settings.features[featureKey] = enabled;
    settings.markModified('features'); 
    await settings.save();
    
    let updated = await SystemSettings.findOne();
    console.log("Updated Settings:", JSON.stringify(updated, null, 2));
  } else {
    console.log("Invalid feature key");
  }

  process.exit(0);
}

test();
