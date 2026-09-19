const axios = require('axios');
require('dotenv').config();

async function test() {
  try {
    const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: "Gauss's Law physics tutorial step by step problems",
          type: 'video',
          maxResults: 1,
          key: process.env.YOUTUBE_API_KEY
        }
      });
    console.log("Success");
  } catch (e) {
    console.error("Error:", e.response.data);
  }
}
test();
