const axios = require("axios");
const cheerio = require("cheerio");
async function run() {
  const res = await axios.get("https://www.ruet.ac.bd/notice");
  const $ = cheerio.load(res.data);
  console.log("Total notices on page 1:", $(".notice_list").length);
  const paginationLinks = [];
  $(".pagination a").each((i, el) => paginationLinks.push($(el).attr("href")));
  console.log("Pagination links:", paginationLinks);
}
run();
