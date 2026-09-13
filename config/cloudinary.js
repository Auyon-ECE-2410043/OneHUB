// Forcefully delete CLOUDINARY_URL to prevent SDK from automatically parsing incorrect Render env vars
delete process.env.CLOUDINARY_URL;

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "qhkorghf",
  api_key: "334956386428954",
  api_secret: "IzbR1A2LqA2mT1vxNUXpKxUO9f4",
  secure: true
});

module.exports = cloudinary;