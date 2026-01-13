const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require("../config/cloudinary")

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'recipes',                // Cloudinary folder
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 800, crop: 'limit' }],
  },
});

const parser = multer({ storage });

module.exports = parser;
