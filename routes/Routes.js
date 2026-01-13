const express = require('express');
const router = express.Router();
const { register, login } = require('../controlers/authController');
const { getRecipes } = require('../controlers/recipyControler');
const  {generateRecipe}  = require ('../controlers/genrateRecipeControler');
const { saveRecipe, getSavedRecipes } = require('../controlers/SaveRecipes');
const { uploadRecipes, getUploadedRecipes } = require('../controlers/uplodeRecipe');

// 🔐 Middleware (JWT verify function) yahaan assume kiya gaya hai
const authenticateUser = require('../Middleware/auth');
const parser = require('../Middleware/multer');



// // POST /api/auth/register
// router.post('/register', register);

// // POST /api/auth/login
// router.post('/login', login);

// get /api/recipes/getRecipes
router.get('/getRecipes', getRecipes);

// POST /api/recipes/generate-recipe
router.post('/generate-recipe', generateRecipe);


// POST /api/recipes/save-recipe
router.post('/save-recipe', authenticateUser, saveRecipe);
// POST /api/recipes/get-save-recipe
router.get('/get-save-recipe', authenticateUser, getSavedRecipes);


// // POST /api/recipes/upload-Recipe
// router.post('/upload-Recipe', authenticateUser, parser.single('image'), uploadRecipes)
// // POST /api/recipes/get-Upload-Recipe
// router.get('/get-Upload-Recipe', authenticateUser, getUploadedRecipes)




module.exports = router;
