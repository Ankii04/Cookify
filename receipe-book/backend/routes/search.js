import express from 'express';
import axios from 'axios';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter for search API calls
const searchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per windowMs
    message: 'Too many search requests, please try again later'
});

// Cache for search results
const searchCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// @route   GET /api/search
// @desc    Search recipes using Spoonacular API
// @access  Public (rate-limited)
router.get('/', searchLimiter, async (req, res) => {
    try {
        const { query, cuisine, diet, type, number = 10 } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a search query'
            });
        }

        // Check cache first
        const cacheKey = `${query}-${cuisine}-${diet}-${type}-${number}`.toLowerCase();
        const cachedData = searchCache.get(cacheKey);

        if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
            return res.json({
                success: true,
                data: cachedData.data,
                cached: true,
                source: 'spoonacular'
            });
        }

        // Check if API key is configured
        if (!process.env.SPOONACULAR_API_KEY || process.env.SPOONACULAR_API_KEY === 'your_spoonacular_api_key_here') {
            return res.status(503).json({
                success: false,
                message: 'Spoonacular API is not configured. Please add your API key to use search feature.'
            });
        }

        // Build search parameters
        const params = {
            apiKey: process.env.SPOONACULAR_API_KEY,
            query: query,
            number: parseInt(number),
            addRecipeInformation: true,
            fillIngredients: true,
            instructionsRequired: true
        };

        // Add optional filters
        if (cuisine) params.cuisine = cuisine;
        if (diet) params.diet = diet;
        if (type) params.type = type;

        // Call Spoonacular API
        const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
            params,
            timeout: 10000
        });

        if (!response.data.results || response.data.results.length === 0) {
            return res.json({
                success: true,
                data: [],
                message: 'No recipes found for your search',
                source: 'spoonacular'
            });
        }

        // Transform results to match our format
        const recipes = response.data.results.map(recipe => ({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            cookingTime: recipe.readyInMinutes,
            servings: recipe.servings,
            isVeg: recipe.vegetarian || false,
            cuisine: recipe.cuisines?.[0] || 'International',
            category: recipe.dishTypes?.[0] || 'Main Course',
            summary: recipe.summary,
            sourceUrl: recipe.sourceUrl,
            source: 'spoonacular',
            // Additional info
            healthScore: recipe.healthScore,
            pricePerServing: recipe.pricePerServing,
            veryHealthy: recipe.veryHealthy,
            cheap: recipe.cheap,
            veryPopular: recipe.veryPopular,
            sustainable: recipe.sustainable,
            glutenFree: recipe.glutenFree,
            dairyFree: recipe.dairyFree
        }));

        // Cache the results
        searchCache.set(cacheKey, {
            data: recipes,
            timestamp: Date.now()
        });

        res.json({
            success: true,
            data: recipes,
            totalResults: response.data.totalResults,
            cached: false,
            source: 'spoonacular'
        });

    } catch (error) {
        console.error('Spoonacular Search Error:', error.message);

        if (error.response?.status === 402) {
            return res.status(402).json({
                success: false,
                message: 'Daily API quota exceeded. Please try again tomorrow.',
                error: 'quota_exceeded'
            });
        }

        res.status(503).json({
            success: false,
            message: 'Unable to search recipes at the moment. Please try again later.',
            error: error.response?.data?.message || error.message
        });
    }
});

// @route   GET /api/search/:id
// @desc    Get detailed recipe from Spoonacular by ID
// @access  Public (rate-limited)
router.get('/:id', searchLimiter, async (req, res) => {
    try {
        if (!process.env.SPOONACULAR_API_KEY || process.env.SPOONACULAR_API_KEY === 'your_spoonacular_api_key_here') {
            return res.status(503).json({
                success: false,
                message: 'Spoonacular API is not configured'
            });
        }

        const response = await axios.get(`https://api.spoonacular.com/recipes/${req.params.id}/information`, {
            params: {
                apiKey: process.env.SPOONACULAR_API_KEY,
                includeNutrition: false
            },
            timeout: 10000
        });

        const recipe = response.data;

        // Transform to our format
        const transformedRecipe = {
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            cookingTime: recipe.readyInMinutes,
            servings: recipe.servings,
            isVeg: recipe.vegetarian || false,
            cuisine: recipe.cuisines?.[0] || 'International',
            category: recipe.dishTypes?.[0] || 'Main Course',

            // Ingredients
            ingredients: recipe.extendedIngredients?.map(ing => ({
                name: ing.name || ing.original,
                measure: ing.measures?.metric?.amount
                    ? `${ing.measures.metric.amount} ${ing.measures.metric.unitShort}`
                    : ing.amount ? `${ing.amount} ${ing.unit}` : ''
            })) || [],

            // Instructions
            steps: recipe.analyzedInstructions?.[0]?.steps?.map(step => step.step) ||
                (recipe.instructions ? [recipe.instructions] : []),

            // Additional info
            summary: recipe.summary,
            sourceUrl: recipe.sourceUrl,
            source: 'spoonacular',
            healthScore: recipe.healthScore,
            pricePerServing: recipe.pricePerServing,

            // Dietary info
            vegetarian: recipe.vegetarian,
            vegan: recipe.vegan,
            glutenFree: recipe.glutenFree,
            dairyFree: recipe.dairyFree,
            veryHealthy: recipe.veryHealthy,
            cheap: recipe.cheap,
            veryPopular: recipe.veryPopular,
            sustainable: recipe.sustainable
        };

        res.json({
            success: true,
            data: transformedRecipe,
            source: 'spoonacular'
        });

    } catch (error) {
        console.error('Spoonacular Recipe Detail Error:', error.message);

        res.status(503).json({
            success: false,
            message: 'Unable to fetch recipe details',
            error: error.response?.data?.message || error.message
        });
    }
});

export default router;
