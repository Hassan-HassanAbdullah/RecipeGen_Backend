// routes/recipes.js

const Recipe = require('../models/Recipe');
const User = require('../models/User');
const crypto = require('crypto');
// We don't need axios as the spoonacular logic has been removed.

// Helper function to generate a unique hash for a recipe
function genrateReipeHash(recipe) {
  const str = recipe.name + recipe.ingredients.join(",") + recipe.steps.join(",");
  return crypto.createHash("sha256").update(str).digest("hex");
}

// ✅ POST /api/recipes/save
// This function saves or unsaves a recipe for a user.
const saveRecipe = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming JWT middleware provides the user ID
    const { source, recipe } = req.body;

    let savedRecipe;
    let recipeHash = genrateReipeHash(recipe);

    // 👇 Handle Gemini-generated recipes
    if (source === 'gemini') {
      let exists = await Recipe.findOne({ recipeHash });
      if (exists) {
        // If a recipe with this hash already exists, use it
        savedRecipe = exists;
      } else {
        // Otherwise, create a new recipe document
        savedRecipe = new Recipe({
          ...recipe, // Spreads the recipe object directly
          recipeHash,
          source: 'gemini',
        });
        await savedRecipe.save();
      }
    }
    // 👇 Handle user-uploaded recipes
    else if (source === 'User') {
      // Find the existing recipe as the user suggested it will already be in the collection.
      savedRecipe = await Recipe.findOne({ recipeHash });
      if (!savedRecipe) {
        return res.status(404).json({ error: 'User recipe not found in database. Please upload it first.' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid recipe source.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const alreadySaved = user.savedRecipes.includes(savedRecipe._id);

    if (alreadySaved) {
      // Unsave the recipe by removing its ID from the user's savedRecipes array
      user.savedRecipes.pull(savedRecipe._id);

    } else {
      // Save the recipe by adding its ID to the user's savedRecipes array
      user.savedRecipes.push(savedRecipe._id);

    }


    await user.save();
    return res.status(200).json({
      message: alreadySaved ? 'Recipe UnSaved successfully!' : 'Recipe Saved successfully!', 
      savedRecipes: user.savedRecipes, // Return the updated list of IDs
      saved: !alreadySaved,
    });

    
  } catch (err) {
    console.error('❌ Error saving recipe:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// ✅ GET /api/recipes/saved/:id
// This function retrieves all recipes saved by a specific user.
const getSavedRecipes = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming JWT middleware provides the user ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Step 1: Get all saved recipe IDs
    const savedRecipeIds = user.savedRecipes;

    // Step 2: Get all recipe documents from the Recipe collection
    const allRecipes = await Recipe.find({ _id: { $in: savedRecipeIds } });

    // Step 3: Separate and combine recipes by source (Gemini and User)
    const combinedRecipes = allRecipes.filter(r => r.source === 'gemini' || r.source === 'User');

    res.status(200).json(combinedRecipes);
  } catch (err) {
    console.error('❌ Error getting saved recipes:', err.message);
    res.status(500).json({ error: 'Failed to fetch saved recipes' });
  }
};

module.exports = { saveRecipe, getSavedRecipes };
