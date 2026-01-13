const express = require('express');
const router = express.Router();

const  {generateRecipe}  = require ('../controlers/genrateRecipeControler');


router.post('/generate-recipe', generateRecipe);

module.exports = router;
