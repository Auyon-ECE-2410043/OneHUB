const cheerio = require('cheerio');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
async function run() {
    const res = await fetch('https://www.ipe.ruet.ac.bd/teacher_list');
    const html = await res.text();
    const $ = cheerio.load(html);
    $('table tbody tr').each((i, el) => {
        const name = $(el).find('td').eq(1).text().trim();
        const desig = $(el).find('td').eq(3).text().trim();
        if(name.toLowerCase().includes('dr.') || name.toLowerCase().includes('ph.d') || desig.toLowerCase().includes('dr.') || desig.toLowerCase().includes('ph.d')) {
            console.log(name, '|', desig);
        }
    });
}
run();
