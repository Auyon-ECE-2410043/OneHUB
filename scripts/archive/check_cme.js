const cheerio = require('cheerio');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
async function run() {
    const res = await fetch('https://www.cme.ruet.ac.bd/teacher_list');
    const html = await res.text();
    const $ = cheerio.load(html);
    $('table tbody tr').each((i, el) => {
        if(i === 0) {
            const tds = $(el).find('td').map((j, td) => $(td).text().trim()).get();
            console.log(tds);
        }
    });
}
run();
