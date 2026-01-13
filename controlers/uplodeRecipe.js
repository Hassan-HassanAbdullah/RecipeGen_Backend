// controllers/upload-recipes.js

const Recipe = require('../models/Recipe');
const User = require('../models/User');
const crypto = require('crypto');

// Helper function to generate a unique hash for a recipe
function genrateReipeHash(recipe) {
    const str = recipe.name + recipe.ingredients.join(",") + recipe.steps.join(",");
    return crypto.createHash("sha256").update(str).digest("hex");
}

// ✅ POST /api/recipes/upload-recipe
// This function allows a user to upload their own recipe.
const uploadRecipes = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming JWT middleware provides the user ID
        const username = req.user.name; // Assuming JWT middleware provides the username


        

        // ✅ Destructure directly from req.body
        const {
            name,
            description,
            ingredients,
            steps,
            estimatedCookingTime,
            servings,
            difficulty,
            cuisine,
            totalTime,
            dishTypes,
            timeToPrepare,
            timeToCook,
            source
        } = req.body;


        // ✅ Ensure ingredients & steps are arrays (parse if stringified)
        const parsedIngredients = typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients;
        const parsedSteps = typeof steps === "string" ? JSON.parse(steps) : steps;

        // ✅ Ensure ingredients & steps are arrays
        const recipe = {
            name,
            description,
            ingredients: Array.isArray(parsedIngredients) ? parsedIngredients : [parsedIngredients],
            steps: Array.isArray(parsedSteps) ? parsedSteps : [parsedSteps],

            estimatedCookingTime,
            servings,
            difficulty,
            cuisine,
            totalTime,
            dishTypes,
            timeToPrepare,
            timeToCook,
            source: source || 'User',
        };

        // Ensure that the recipe object and its properties are not empty
        if (!recipe || !recipe.name || !recipe.ingredients || !recipe.steps) {
            return res.status(400).json({ message: 'Recipe data is incomplete.' });
        }

        // ✅ Image URL from Cloudinary
        let imageUrl = '';
        if (req.file && req.file.path) {
            imageUrl = req.file.path; // Cloudinary URL
        }

        const recipeHash = genrateReipeHash(recipe);

        // Check if a recipe with this hash already exists to avoid duplicates
        const existingRecipe = await Recipe.findOne({ recipeHash });
        if (existingRecipe) {
            return res.status(409).json({ message: 'This recipe has already been uploaded.' });
        }

        const uploadRecipe = new Recipe({
            ...recipe, // Spreads the recipe object directly
            createdBy: username,
            recipeHash,
            source: 'User',
            imageUrl: imageUrl,   // ✅ Save Cloudinary URL
        });

        await uploadRecipe.save();

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.uploadRecipes.push(uploadRecipe._id);
        await user.save();

        return res.status(200).json({
            message: 'Recipe uploaded successfully!',
            id: uploadRecipe._id,
        });
    } catch (error) {
        console.error('❌ Error uploading recipe:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ✅ GET /api/recipes/uploaded/:id
// This function retrieves all recipes uploaded by a specific user.
const getUploadedRecipes = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming JWT middleware provides the user ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Step 1: Get all saved recipe IDs
        const uploadRecipeIds = user.uploadRecipes;

        // Step 2: Get all recipe documents from the Recipe collection
        const allRecipes = await Recipe.find({ _id: { $in: uploadRecipeIds } });




        res.status(200).json(allRecipes);

    } catch (err) {
        console.error('❌ Error getting uploaded recipes:', err.message);
        res.status(500).json({ error: 'Failed to fetch uploaded recipes' });
    }
};

module.exports = { uploadRecipes, getUploadedRecipes };