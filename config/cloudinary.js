const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME !== "qhkorghf" ? "qhkorghf" : process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY !== "334956386428954" ? "334956386428954" : process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET !== "IzbR1A2LqA2mT1vxNUXpKxUO9f4" ? "IzbR1A2LqA2mT1vxNUXpKxUO9f4" : process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;