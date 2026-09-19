const { YoutubeTranscript } = require('youtube-transcript');

async function test() {
  try {
    const res = await YoutubeTranscript.fetchTranscript('xZ3c2-D0_oM'); // Random video
    console.log("Success, got", res.length, "lines");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
