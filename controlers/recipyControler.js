let axios = require('axios');
const express = require('express');
const Recipe = require('../models/Recipe');
require('dotenv').config();

const getRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find()

        res.status(200).json(recipes);

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
        console.error('Error fetching recipes:', err.message);

    }
};

module.exports = { getRecipes };
