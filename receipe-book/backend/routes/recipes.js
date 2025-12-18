import express from 'express';
import Recipe from '../models/Recipe.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// @route   GET /api/recipes
// @desc    Get all recipes with filtering, search, and pagination
// @access  Public
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        // Build query
        let query = {};

        // Search by title
        if (req.query.search) {
            query.$text = { $search: req.query.search };
        }

        // Filter by category
        if (req.query.category) {
            query.category = req.query.category;
        }

        // Filter by cuisine
        if (req.query.cuisine) {
            query.cuisine = req.query.cuisine;
        }

        // Filter by difficulty
        if (req.query.difficulty) {
            query.difficulty = req.query.difficulty;
        }

        // Filter by isVeg (Veg/Non-Veg)
        if (req.query.isVeg) {
            query.isVeg = req.query.isVeg === 'true';
        }

        // Filter by creator (for profiles)
        if (req.query.createdBy) {
            query.createdBy = req.query.createdBy;
        }

        // Sort options
        let sort = {};
        if (req.query.sort === 'rating') {
            sort.averageRating = -1;
        } else if (req.query.sort === 'newest') {
            sort.createdAt = -1;
        } else if (req.query.sort === 'oldest') {
            sort.createdAt = 1;
        } else {
            sort.createdAt = -1; // Default sort
        }

        const recipes = await Recipe.find(query)
            .populate('createdBy', 'name')
            .sort(sort)
            .limit(limit)
            .skip(skip);

        const total = await Recipe.countDocuments(query);

        res.json({
            success: true,
            data: recipes,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/recipes/featured
// @desc    Get featured recipes (highest rated)
// @access  Public
router.get('/featured', async (req, res) => {
    try {
        const recipes = await Recipe.find()
            .populate('createdBy', 'name')
            .sort({ averageRating: -1 })
            .limit(6);

        res.json({
            success: true,
            data: recipes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/recipes/categories
// @desc    Get all unique categories
// @access  Public
router.get('/categories', async (req, res) => {
    try {
        const categories = await Recipe.distinct('category');

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/recipes/:id
// @desc    Get single recipe by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        res.json({
            success: true,
            data: recipe
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/recipes
// @desc    Create a new recipe
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        const { title, ingredients, steps, category, cuisine, cookingTime, difficulty, servings, tags, isVeg } = req.body;

        // Parse JSON strings if needed
        const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
        const parsedSteps = typeof steps === 'string' ? JSON.parse(steps) : steps;
        const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;

        const recipeData = {
            title,
            ingredients: parsedIngredients,
            steps: parsedSteps,
            category,
            cuisine,
            cookingTime: parseInt(cookingTime),
            difficulty,
            servings: parseInt(servings),
            tags: parsedTags,
            isVeg: isVeg === 'true' || isVeg === true,
            createdBy: req.user._id,
            source: 'user'
        };

        // Add image path if uploaded
        if (req.file) {
            recipeData.image = req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`;
        }

        const recipe = await Recipe.create(recipeData);
        await recipe.populate('createdBy', 'name');

        res.status(201).json({
            success: true,
            data: recipe
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/recipes/:id
// @desc    Update a recipe
// @access  Private (Owner or Admin)
router.put('/:id', protect, upload.single('image'), async (req, res) => {
    try {
        let recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Check ownership
        if (recipe.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this recipe'
            });
        }

        const { title, ingredients, steps, category, cuisine, cookingTime, difficulty, servings, tags, isVeg } = req.body;

        // Parse JSON strings if needed
        const updateData = {
            title,
            ingredients: typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients,
            steps: typeof steps === 'string' ? JSON.parse(steps) : steps,
            category,
            cuisine,
            cookingTime: parseInt(cookingTime),
            difficulty,
            servings: parseInt(servings),
            tags: typeof tags === 'string' ? JSON.parse(tags) : tags,
            isVeg: isVeg === 'true' || isVeg === true
        };

        // Update image if new one uploaded
        if (req.file) {
            updateData.image = req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`;
        }

        recipe = await Recipe.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name');

        res.json({
            success: true,
            data: recipe
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/recipes/:id
// @desc    Delete a recipe
// @access  Private (Owner or Admin)
router.delete('/:id', protect, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Check ownership
        if (recipe.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this recipe'
            });
        }

        await Recipe.findByIdAndDelete(req.params.id);

        // Also delete associated reviews
        await Review.deleteMany({ recipe: req.params.id });

        res.json({
            success: true,
            message: 'Recipe deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/recipes/:id/favorite
// @desc    Toggle favorite status
// @access  Private
router.post('/:id/favorite', protect, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        const user = await User.findById(req.user._id);
        const index = user.favorites.indexOf(req.params.id);

        if (index > -1) {
            // Remove from favorites
            user.favorites.splice(index, 1);
        } else {
            // Add to favorites
            user.favorites.push(req.params.id);
        }

        await user.save();

        res.json({
            success: true,
            data: {
                isFavorite: index === -1,
                favorites: user.favorites
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
