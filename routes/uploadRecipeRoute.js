const express = require('express');
const router = express.Router();

const { uploadRecipes, getUploadedRecipes } = require('../controlers/uplodeRecipe');

// 🔐 Middleware (JWT verify function) yahaan assume kiya gaya hai
const authenticateUser = require('../Middleware/auth');
const parser = require('../Middleware/multer')


// POST /api/recipes/upload-Recipe
router.post('/upload-Recipe', authenticateUser, parser.single('image'), uploadRecipes)
// POST /api/recipes/get-Upload-Recipe
router.get('/get-Upload-Recipe', authenticateUser, getUploadedRecipes)




module.exports = router;
