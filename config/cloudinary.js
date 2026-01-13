const cloudinary = require('cloudinary').v2;
require('dotenv').config(); // .env load karne ke liye

cloudinary.config({
  secure: true, // ye optional hai, secure URLs generate karega
  url: process.env.CLOUDINARY_URL,
});

module.exports = cloudinary;
