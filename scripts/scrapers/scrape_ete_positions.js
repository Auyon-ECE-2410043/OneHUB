const mongoose = require('mongoose');
const cheerio = require('cheerio');
require('dotenv').config();
const User = require('./models/User');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function fetchTeacherListLinks() {
    console.log("Fetching ETE teacher list to map URLs...");
    const res = await fetch('https://www.ete.ruet.ac.bd/teacher_list');
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const map = {};
    $('table tbody tr').each((i, el) => {
        const email = $(el).find('td').eq(5).text().trim().toLowerCase();
        const name = $(el).find('td').eq(1).text().trim();
        const href = $(el).find('a').attr('href');
        
        if (email && href) {
            map[email] = href;
        } else if (name && href) {
            const fallbackEmail = name.toLowerCase().replace(/[^a-z]/g, '') + '@ete.ruet.ac.bd';
            map[fallbackEmail] = href;
        }
    });
    
    return map;
}

async function scrapeProfilePositions(url) {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const positionHistory = [];
    const posHeader = $('h4').filter((i, el) => $(el).text().trim() === 'Position');
    if (posHeader.length > 0) {
        posHeader.next('ul.timeline').find('li').each((i, el) => {
            const role = $(el).find('.designation').text().trim();
            const duration = $(el).find('.date').text().replace(/\s+/g, ' ').trim();
            const institution = $(el).find('p').map((j, p) => $(p).text().trim()).get().join(', ');
            
            if (role) {
                positionHistory.push({ role, duration, institution });
            }
        });
    }

    return positionHistory;
}

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    
    const emailToUrl = await fetchTeacherListLinks();
    const teachers = await User.find({ department: 'ETE', role: 'faculty' });
    console.log(`Found ${teachers.length} ETE teachers in DB.`);

    let updated = 0;
    for (const teacher of teachers) {
        let url = emailToUrl[teacher.email];
        if (!url) {
            const generatedEmail = teacher.name.toLowerCase().replace(/[^a-z]/g, '') + '@ete.ruet.ac.bd';
            url = emailToUrl[generatedEmail];
        }

        if (url) {
            console.log(`Scraping positions for ${teacher.name}...`);
            try {
                const positionHistory = await scrapeProfilePositions(url);
                teacher.positionHistory = positionHistory;
                await teacher.save();
                updated++;
                console.log(`  -> Saved ${positionHistory.length} positions.`);
            } catch (err) {
                console.error(`Failed to scrape ${url}`, err);
            }
        }
    }

    console.log(`Done. Updated ${updated} profiles.`);
    process.exit(0);
}

run();
