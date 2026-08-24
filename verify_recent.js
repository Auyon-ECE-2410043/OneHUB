const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const ipe = await User.findOne({ department: 'IPE', designation: { $ne: 'Retired Faculty' }, officeLocation: { $ne: '' } });
    const cme = await User.findOne({ department: 'CME', designation: { $ne: 'Retired Faculty' }, officeLocation: { $ne: '' } });
    const mse = await User.findOne({ department: 'MSE', designation: { $ne: 'Retired Faculty' } });
    const che = await User.findOne({ department: 'ChE', designation: { $ne: 'Retired Faculty' } });
    
    console.log('IPE:', ipe?.name, '| Loc:', ipe?.officeLocation, '| Edu:', ipe?.education?.length);
    console.log('CME:', cme?.name, '| Loc:', cme?.officeLocation, '| Edu:', cme?.education?.length);
    console.log('MSE:', mse?.name, '| Loc:', mse?.officeLocation, '| Edu:', mse?.education?.length);
    console.log('ChE:', che?.name, '| Loc:', che?.officeLocation, '| Edu:', che?.education?.length);
    process.exit(0);
});
