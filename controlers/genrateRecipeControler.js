const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const axios = require('axios');


const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Pixabay helper function
async function fetchFoodImage(query) {
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

        return response.data.hits[0]?.largeImageURL || "https://placehold.co/600x400?text=food+image&font=roboto";
    } catch (err) {
        console.error("❌ Image fetch error:", err.message);
        return "https://placehold.co/600x400?text=food+image&font=roboto";
    }
}



const generateRecipe = async (req, res) => {
    try {
        const { ingredients } = req.body;

        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ message: 'Ingredients are required' });
        }

        const ingredientString = ingredients.join(', ');

        const prompt = `
            You are a JSON generator AI.

            Task:
            Generate a Pakistani recipe based on the following ingredients:
            ${ingredientString}

            Important Rules:
            1. Only generate a recipe if the given ingredients are valid food items. 
            - If the ingredients contain non-food items (like pen, phone, book, etc.), return ONLY this JSON:
            {
                "error": "Invalid ingredients. Please provide real food items."
            }

            2. The recipe must be authentic, traditional, and realistic. 
            - Do not invent or make up imaginary recipes.
            - Use real Pakistani dishes and ensure they are well-known.

            3. Strictly return only a JSON object — no markdown, no comments, no explanation.

            4. The output must start with '{' and end with '}'.

            5. Keys must be in double quotes.


            Rules:
            1. Strictly return only a JSON object — no markdown, no comments, no explanation.
            2. Do not include triple backticks  or any formatting.
                    3. The output must start with '{' and end with '}'.
            4. Avoid extra whitespace or newline at the beginning or end.
            5. Keys must be in double quotes.

            JSON Structure:
                    {
                        "name"= "string",
                            "description": "string",
                                "ingredients": ["string", ...],
                                    "steps": ["string", ...],
                                        "servings": "string",
                                            "estimatedCookingTime": "string",
                                                "cuisine": "Pakistani",
                                                    "dishTypes":"string"
                                                        "timeToPrepare": "string",
                                                            "timeToCook": "string",
                                                                "totalTime": "string"
                    }
                    `;




        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();

        // ✅ Remove markdown formatting like ```json ... ```
        responseText = text.replace(/```json|```/g, '').trim();
        console.log("🔎 Gemini raw response:\n", responseText);


        let recipe;
        try {
            recipe = JSON.parse(text);

            // 🔹 Pixabay image fetch
            const imageUrl = await fetchFoodImage(recipe.name || "Pakistani Food");
            recipe.imageUrl = imageUrl;

        } catch (parseError) {
            return res.status(500).json({ message: 'Invalid JSON from Gemini', raw: text });
        }

        res.status(200).json({ recipe });

    } catch (error) {
        console.error('Error generating recipe:', error);
        res.status(500).json({ message: 'Error generating recipe' });
    }
};

module.exports = { generateRecipe };
