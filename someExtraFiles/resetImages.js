// resetImages.js
require('dotenv').config();
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');

async function resetImages() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("✅ MongoDB Connected");

    const result = await Recipe.updateMany({}, { $set: { imageUrl: "" } });
    console.log(`🗑️ Reset ${result.modifiedCount} recipes imageUrl`);

  } catch (err) {
    console.error("❌ Error resetting images:", err.message);
  } finally {
    mongoose.disconnect();
  }
}

resetImages();
