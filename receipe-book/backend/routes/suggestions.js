import express from 'express';
import axios from 'axios';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter for Spoonacular API calls
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: 'Too many API requests, please try again later'
});

// Cache for suggestions (simple in-memory cache)
const suggestionCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// @route   GET /api/suggestions
// @desc    Get recipe suggestions based on ingredients (Spoonacular API)
// @access  Public (rate-limited)
router.get('/', apiLimiter, async (req, res) => {
    try {
        const { ingredients } = req.query;

        if (!ingredients) {
            return res.status(400).json({
                success: false,
                message: 'Please provide ingredients'
            });
        }

        // Check cache first
        const cacheKey = ingredients.toLowerCase();
        const cachedData = suggestionCache.get(cacheKey);

        if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
            return res.json({
                success: true,
                data: cachedData.data,
                cached: true
            });
        }

        // Check if API key is configured
        if (!process.env.SPOONACULAR_API_KEY || process.env.SPOONACULAR_API_KEY === 'your_spoonacular_api_key_here') {
            return res.status(503).json({
                success: false,
                message: 'Spoonacular API is not configured. Please add your API key to use this feature.'
            });
        }

        // Call Spoonacular API
        const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
            params: {
                apiKey: process.env.SPOONACULAR_API_KEY,
                ingredients: ingredients,
                number: 6,
                ranking: 2,
                ignorePantry: true
            },
            timeout: 5000
        });

        const suggestions = response.data.map(recipe => ({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            usedIngredients: recipe.usedIngredients,
            missedIngredients: recipe.missedIngredients,
            source: 'spoonacular'
        }));

        // Cache the results
        suggestionCache.set(cacheKey, {
            data: suggestions,
            timestamp: Date.now()
        });

        res.json({
            success: true,
            data: suggestions,
            cached: false
        });
    } catch (error) {
        console.error('Spoonacular API Error:', error.message);

        // Provide fallback response
        res.status(503).json({
            success: false,
            message: 'Unable to fetch suggestions at the moment. Please try again later or browse our recipe collection.',
            error: error.response?.data?.message || error.message
        });
    }
});

// @route   GET /api/suggestions/:id
// @desc    Get detailed recipe from Spoonacular
// @access  Public (rate-limited)
router.get('/:id', apiLimiter, async (req, res) => {
    try {
        if (!process.env.SPOONACULAR_API_KEY || process.env.SPOONACULAR_API_KEY === 'your_spoonacular_api_key_here') {
            return res.status(503).json({
                success: false,
                message: 'Spoonacular API is not configured'
            });
        }

        const response = await axios.get(`https://api.spoonacular.com/recipes/${req.params.id}/information`, {
            params: {
                apiKey: process.env.SPOONACULAR_API_KEY
            },
            timeout: 5000
        });

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('Spoonacular API Error:', error.message);

        res.status(503).json({
            success: false,
            message: 'Unable to fetch recipe details',
            error: error.response?.data?.message || error.message
        });
    }
});

export default router;
