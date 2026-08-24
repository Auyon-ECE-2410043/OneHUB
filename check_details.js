const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const urp = await User.findOne({ department: 'URP', designation: { $ne: 'Retired Faculty' }, 'education.0': { $exists: true } });
    const arch = await User.findOne({ department: 'Arch', designation: { $ne: 'Retired Faculty' }, 'education.0': { $exists: true } });
    const becm = await User.findOne({ department: 'BECM', designation: { $ne: 'Retired Faculty' }, 'education.0': { $exists: true } });
    console.log('URP:', urp?.name, '| Loc:', urp?.officeLocation, '| Edu:', urp?.education?.length);
    console.log('Arch:', arch?.name, '| Loc:', arch?.officeLocation, '| Edu:', arch?.education?.length);
    console.log('BECM:', becm?.name, '| Loc:', becm?.officeLocation, '| Edu:', becm?.education?.length);
    process.exit(0);
});
