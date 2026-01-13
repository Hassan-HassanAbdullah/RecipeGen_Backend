require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Recipe = require('../models/Recipe');

// // ✅ Unsplash se food image fetch karne wala helper
// async function fetchRecipeImage(query) {
//   try {
//     const response = await axios.get("https://api.unsplash.com/search/photos", {
//       params: { query: `${query} food`, client_id: process.env.UNSPLASH_API_KEY }
//     });

//     return response.data.results[0]?.urls?.regular || "";
//   } catch (err) {
//     console.error("❌ Error fetching image:", err.message);
//     return "";
//   }
// }

// // ✅ Pexels Image Helper
// async function fetchRecipeImage(query) {
//   try {
//     const response = await axios.get("https://api.pexels.com/v1/search", {
//       headers: { Authorization: process.env.PEXELS_API_KEY },
//       params: { query: `${query} food`, per_page: 1 }
//     });

//     return response.data.photos[0]?.src?.medium || "";
//   } catch (err) {
//     console.error("❌ Error fetching Pexels image:", err.message);
//     return "";
//   }
// }


// ✅ Pixabay se food image fetch karne wala helper
async function fetchRecipeImage(query) {
  try {
    const response = await axios.get("https://pixabay.com/api/", {
      params: {
        key: process.env.PIXABAY_API_KEY,
        q: `${query} food`,   // query ke sath "food"
        image_type: "photo",  // sirf photo
        // orientation: "horizontal", // horizontal images only
        // per_page: 3           // zyada results, fallback ke liye
      }
    });

    return response.data.hits[0]?.largeImageURL || "";
  } catch (err) {
    console.error("❌ Error fetching Pixabay image:", err.message);
    return "";
  }
}


// ✅ Migration Script
async function updateOldRecipes() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connected");

    const recipes = await Recipe.find({
      $or: [{ imageUrl: { $exists: false } }, { imageUrl: "" }]
    });

    console.log(`📌 Found ${recipes.length} recipes without images`);

    for (let recipe of recipes) {
      const imageUrl = await fetchRecipeImage(recipe.name || "Pakistani Food");

      recipe.imageUrl = imageUrl ; 
      await recipe.save();

      console.log(`🍲 Updated: ${recipe.name}`);
    }

    console.log("🎉 Migration complete!");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    mongoose.disconnect();
  }
}

updateOldRecipes();
