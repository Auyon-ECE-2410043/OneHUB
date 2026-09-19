const axios = require("axios");
const cheerio = require("cheerio");
async function run() {
  const res = await axios.get("https://en.wikipedia.org/wiki/Rajshahi_University_of_Engineering_%26_Technology", {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
  });
  const $ = cheerio.load(res.data);
  $("img").each((i, el) => {
    const src = $(el).attr("src");
    if (src && src.toLowerCase().includes("ruet") || src && src.toLowerCase().includes("logo")) {
      console.log("Found wiki logo:", src);
    }
  });
}
run();
