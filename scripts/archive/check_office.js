const cheerio = require('cheerio');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
async function run() {
    const res = await fetch('https://www.me.ruet.ac.bd/teacher_list');
    const html = await res.text();
    const $ = cheerio.load(html);
    $('table tbody tr').slice(0, 10).each((i, el) => {
        const tds = $(el).find('td').map((j, td) => $(td).text().replace(/\s+/g, ' ').trim()).get();
        console.log('Name:', tds[1], '| Office:', tds[7]);
    });
}
run();
