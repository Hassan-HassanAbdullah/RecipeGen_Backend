// models/Recipe.js

const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: String,
  description: String,
  ingredients: [String],
  steps: [String],
  servings: String,
  estimatedCookingTime: String,
  cuisine: String,
  timeToPrepare: String,
  timeToCook: String,
  totalTime: String,
  dishTypes: String,
  imageUrl: {
    type: String,
    default: ""
  },  // ✅ new field for image
  source: {
    type: String, // "gemini" or "User"
    required: true
  },
  recipeHash: {
    type: String,
    unique: true
  },
  createdBy: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('Recipe', recipeSchema);
