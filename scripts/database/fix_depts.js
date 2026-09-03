const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const mathRes = await User.updateMany({ department: 'MATH' }, { $set: { department: 'Math' } });
    const phyRes = await User.updateMany({ department: 'PHY' }, { $set: { department: 'Physics' } });
    console.log('Updated Math:', mathRes.modifiedCount);
    console.log('Updated Physics:', phyRes.modifiedCount);
    process.exit(0);
});
