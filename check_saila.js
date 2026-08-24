const cheerio = require('cheerio');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
async function run() {
    const res = await fetch('https://www.hum.ruet.ac.bd/teacher_list');
    const html = await res.text();
    const $ = cheerio.load(html);
    $('table tbody tr').each((i, el) => {
        const name = $(el).find('td').eq(1).text().trim();
        if(name.includes('Dr. Saila Ahmed')) {
            const loc = $(el).find('td').eq(7).text().trim();
            console.log('Location on RUET site:', loc === '' ? '[BLANK]' : loc);
            const url = $(el).find('a').attr('href');
            console.log('Profile URL:', url);
        }
    });
}
run();
