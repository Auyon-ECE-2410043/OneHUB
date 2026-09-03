const cheerio = require('cheerio');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
async function run() {
    const res = await fetch('https://www.math.ruet.ac.bd/teacher_list');
    const html = await res.text();
    const $ = cheerio.load(html);
    let target = null;
    $('table tbody tr').each((i, el) => {
        const name = $(el).find('td').eq(1).text().trim();
        if (name.includes('Dr. Md. Bellal Hossain') || name.includes('Majedur Rahman')) {
            const url = $(el).find('a').attr('href');
            console.log(name, url);
            target = url;
        }
    });
}
run();
