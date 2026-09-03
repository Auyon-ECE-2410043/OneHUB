const https = require('https');
const cheerio = require('cheerio');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function run() {
    const res = await fetch('https://www.math.ruet.ac.bd/teacher_list');
    const html = await res.text();
    const $ = cheerio.load(html);
    
    let url = '';
    $('table tbody tr').each((i, el) => {
        const name = $(el).find('td').eq(1).text().trim();
        if (name.includes('Dr. Md. Shamsul Alam')) {
            url = $(el).find('a').attr('href');
        }
    });
    
    console.log('Profile URL:', url);
    if (url) {
        const pRes = await fetch(url);
        const pHtml = await pRes.text();
        const $p = cheerio.load(pHtml);
        console.log('H4s:', $p('h4').map((i,el)=>$p(el).text().trim()).get());
        console.log('H5s:', $p('h5').map((i,el)=>$p(el).text().trim()).get());
        console.log('Education Block:', $p('h4:contains("Education")').next().html());
    }
}
run();
