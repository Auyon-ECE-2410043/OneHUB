require("dotenv").config();
const mongoose = require("mongoose");
const LiveFeed = require("./models/LiveFeed");

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");
    
    const feeds = await LiveFeed.find({ type: "ruet_news" });
    for (const feed of feeds) {
      // Content looks like: "Posted on 16th September 2026. Click to view details."
      const match = feed.content.match(/Posted on (.*?)\. Click/);
      if (match && match[1]) {
        let dateStr = match[1];
        // Remove ordinal suffixes (st, nd, rd, th) from the day
        dateStr = dateStr.replace(/(\d+)(st|nd|rd|th)/, "$1");
        
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          feed.createdAt = parsedDate;
          // Mongoose might ignore createdAt if we just save(), so we use updateOne
          await LiveFeed.updateOne({ _id: feed._id }, { $set: { createdAt: parsedDate } });
          console.log(`Updated ${feed.title} -> ${parsedDate.toISOString()}`);
        }
      }
    }
    
    console.log("Done fixing historical dates!");
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
}
run();
