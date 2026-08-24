const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const us = await User.find({ department: 'IPE', isPhdHolder: true, designation: { $ne: 'Retired Faculty' } });
    console.log(us.map(u => u.name).join(', '));
    process.exit(0);
});
