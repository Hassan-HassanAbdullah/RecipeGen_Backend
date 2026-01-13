const express = require('express');
const router = express.Router();

// Dono controller functions ko import karein
const { uploadRecipes, getUploadRecipes } = require('../controlers/uplodeRecipe');

// 🔐 Middleware (JWT verify function) yahaan assume kiya gaya hai
const authenticateUser = require('../Middleware/auth');

// ✅ Sahi HTTP method aur middleware ka istemal kiya gaya hai
router.post('/upload', authenticateUser, uploadRecipes);

// ✅ GET method aur sahi controller function ka istemal kiya gaya hai
router.get('/get-uploaded', authenticateUser, getUploadRecipes);

module.exports = router;
