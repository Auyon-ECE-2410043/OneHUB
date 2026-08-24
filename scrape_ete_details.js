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
            // fallback generated email
            const fallbackEmail = name.toLowerCase().replace(/[^a-z]/g, '') + '@ete.ruet.ac.bd';
            map[fallbackEmail] = href;
        }
    });
    
    return map;
}

async function scrapeProfileDetails(url) {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const education = [];
    const eduHeader = $('h4').filter((i, el) => $(el).text().trim() === 'Education');
    if (eduHeader.length > 0) {
        eduHeader.next('ul.timeline').find('li').each((i, el) => {
            const degree = $(el).find('.designation').text().trim();
            const year = $(el).find('.date').text().trim();
            const institution = $(el).find('p').text().trim();
            if (degree) {
                education.push({ degree, year, institution });
            }
        });
    }

    const fieldOfResearch = [];
    const resHeader = $('h5').filter((i, el) => $(el).text().trim().toLowerCase().includes('research'));
    if (resHeader.length > 0) {
        resHeader.next('ul').find('li').each((i, el) => {
            const topic = $(el).text().trim();
            if (topic) {
                fieldOfResearch.push(topic);
            }
        });
    }

    return { education, fieldOfResearch };
}

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    
    const emailToUrl = await fetchTeacherListLinks();
    const teachers = await User.find({ department: 'ETE', role: 'faculty' });
    console.log(`Found ${teachers.length} ETE teachers in DB.`);

    let updated = 0;
    for (const teacher of teachers) {
        let url = emailToUrl[teacher.email];
        // Special mapping if email doesn't match perfectly
        if (!url) {
            const generatedEmail = teacher.name.toLowerCase().replace(/[^a-z]/g, '') + '@ete.ruet.ac.bd';
            url = emailToUrl[generatedEmail];
        }

        if (url) {
            console.log(`Scraping details for ${teacher.name}...`);
            try {
                const details = await scrapeProfileDetails(url);
                teacher.education = details.education;
                teacher.fieldOfResearch = details.fieldOfResearch;
                await teacher.save();
                updated++;
                console.log(`  -> Saved ${details.education.length} degrees, ${details.fieldOfResearch.length} research topics.`);
            } catch (err) {
                console.error(`Failed to scrape ${url}`, err);
            }
        } else {
            console.log(`No URL found for ${teacher.name} (${teacher.email})`);
        }
    }

    console.log(`Done. Updated ${updated} profiles.`);
    process.exit(0);
}

run();
