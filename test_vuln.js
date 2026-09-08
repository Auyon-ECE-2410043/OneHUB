const mongoose = require('mongoose');
const Otp = require('./models/Otp');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const email = "test_vuln@example.com";
  await Otp.deleteMany({ email });
  
  // Create an OTP
  await Otp.create({ email, otp: "123456" });
  
  // Query with undefined OTP
  let reqBodyOtp = undefined;
  const result = await Otp.findOne({ email, otp: reqBodyOtp });
  
  console.log("Result with undefined otp:", result ? "FOUND VULNERABILITY!" : "Safe.");
  
  await mongoose.disconnect();
}
test();
