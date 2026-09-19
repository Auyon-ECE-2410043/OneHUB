require("dotenv").config();
const mongoose = require("mongoose");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const collection = db.collection("livefeeds");
  
  const feeds = await collection.find({ type: "ruet_news" }).toArray();
  for (const feed of feeds) {
    if (!feed.content) continue;
    const match = feed.content.match(/Posted on (.*?)\. Click/);
    if (match && match[1]) {
      let dateStr = match[1].replace(/(\d+)(st|nd|rd|th)/, "$1");
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        await collection.updateOne({ _id: feed._id }, { $set: { createdAt: parsedDate, updatedAt: parsedDate } });
        console.log("Fixed via driver:", feed.title, parsedDate);
      }
    }
  }
  console.log("Done");
  process.exit(0);
}
run();
