const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const mse = await User.findOne({ department: 'MSE', 'education.0': { $exists: true } });
    const che = await User.findOne({ department: 'ChE', 'education.0': { $exists: true } });
    console.log('MSE:', mse?.name, '| Edu:', mse?.education?.length);
    console.log('ChE:', che?.name, '| Edu:', che?.education?.length);
    process.exit(0);
});
