const mongoose = require('mongoose');
const cheerio = require('cheerio');
require('dotenv').config();
const User = require('./models/User');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const DEPARTMENTS = ['math', 'ce', 'me', 'cse', 'eee', 'ete', 'phy'];

async function updateLocations() {
    await mongoose.connect(process.env.MONGO_URI);
    
    let updatedCount = 0;

    for (const dept of DEPARTMENTS) {
        console.log(`Fetching locations for ${dept.toUpperCase()}...`);
        try {
            const res = await fetch(`https://www.${dept}.ruet.ac.bd/teacher_list`);
            const html = await res.text();
            const $ = cheerio.load(html);
            
            const updates = [];
            $('table tbody tr').each((i, el) => {
                const tds = $(el).find('td').map((j, td) => $(td).text().replace(/\s+/g, ' ').trim()).get();
                if (tds.length >= 8) {
                    const name = tds[1];
                    const officeLocation = tds[7];
                    if (name && officeLocation) {
                        updates.push({ name, officeLocation });
                    }
                }
            });
            
            for (const u of updates) {
                const res = await User.updateOne(
                    { name: u.name },
                    { $set: { officeLocation: u.officeLocation } }
                );
                if (res.modifiedCount > 0) {
                    updatedCount++;
                }
            }
        } catch (e) {
            console.log(`Failed for ${dept}:`, e.message);
        }
    }
    
    console.log(`Successfully updated office locations for ${updatedCount} teachers!`);
    process.exit(0);
}

updateLocations();
