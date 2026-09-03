const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Holiday = require("./models/Holiday");

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/onehub";

const holidays = [
  { title: "Shab-e-Meraj *", startDate: new Date("2026-02-04"), endDate: new Date("2026-02-04"), type: "holiday", classesSuspended: true },
  { title: "Sri Sri Saraswati Puja", startDate: new Date("2026-02-20"), endDate: new Date("2026-02-20"), type: "holiday", classesSuspended: true },
  { title: "Shaheed Dibosh & Int. Mother Language Day", startDate: new Date("2026-02-21"), endDate: new Date("2026-02-21"), type: "holiday", classesSuspended: true },
  { title: "Shab-e-Barat *", startDate: new Date("2026-03-19"), endDate: new Date("2026-03-20"), type: "holiday", classesSuspended: true },
  { title: "Independence & National Day", startDate: new Date("2026-03-26"), endDate: new Date("2026-03-26"), type: "holiday", classesSuspended: true },
  { title: "Bangla Noboborsho", startDate: new Date("2026-04-14"), endDate: new Date("2026-04-14"), type: "holiday", classesSuspended: true },
  { title: "Eid-ul-Fitr & Summer Vacation", startDate: new Date("2026-04-23"), endDate: new Date("2026-04-30"), type: "vacation", classesSuspended: true },
  { title: "May Day", startDate: new Date("2026-05-01"), endDate: new Date("2026-05-01"), type: "holiday", classesSuspended: true },
  { title: "Buddha Purnima *", startDate: new Date("2026-05-22"), endDate: new Date("2026-05-22"), type: "holiday", classesSuspended: true },
  { title: "Eid-ul-Adha *", startDate: new Date("2026-06-28"), endDate: new Date("2026-06-30"), type: "holiday", classesSuspended: true },
  { title: "Ashura *", startDate: new Date("2026-07-25"), endDate: new Date("2026-07-25"), type: "holiday", classesSuspended: true },
  { title: "National Mourning Day", startDate: new Date("2026-08-15"), endDate: new Date("2026-08-15"), type: "holiday", classesSuspended: true },
  { title: "Janmashtami", startDate: new Date("2026-08-26"), endDate: new Date("2026-08-26"), type: "holiday", classesSuspended: true },
  { title: "University Day **", startDate: new Date("2026-09-01"), endDate: new Date("2026-09-01"), type: "event", classesSuspended: false }, // classes run as usual
  { title: "Eid-e-Miladunnabi *", startDate: new Date("2026-09-16"), endDate: new Date("2026-09-16"), type: "holiday", classesSuspended: true },
  { title: "Durga Puja", startDate: new Date("2026-10-17"), endDate: new Date("2026-10-21"), type: "holiday", classesSuspended: true },
  { title: "Martyred Intellectuals Day", startDate: new Date("2026-12-14"), endDate: new Date("2026-12-14"), type: "holiday", classesSuspended: true },
  { title: "Victory Day", startDate: new Date("2026-12-16"), endDate: new Date("2026-12-16"), type: "holiday", classesSuspended: true },
  { title: "Winter Vacation", startDate: new Date("2026-12-24"), endDate: new Date("2026-12-31"), type: "vacation", classesSuspended: true },
];

async function seedHolidays() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for Holiday Seeding.");

    await Holiday.deleteMany({});
    console.log("Cleared existing holidays.");

    await Holiday.insertMany(holidays);
    console.log(`Successfully seeded ${holidays.length} holidays for 2026!`);

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding holidays:", error);
    process.exit(1);
  }
}

seedHolidays();
