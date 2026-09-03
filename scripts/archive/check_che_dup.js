const cheerio = require('cheerio');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
async function run() {
    const res = await fetch('https://www.che.ruet.ac.bd/teacher_list');
    const html = await res.text();
    const $ = cheerio.load(html);
    $('table tbody tr').each((i, el) => {
        const name = $(el).find('td').eq(1).text().trim();
        console.log(name);
    });
}
run();
