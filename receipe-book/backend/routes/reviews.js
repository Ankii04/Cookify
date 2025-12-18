import express from 'express';
import Recipe from '../models/Recipe.js';
import Review from '../models/Review.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/reviews/recipe/:recipeId
// @desc    Get all reviews for a recipe
// @access  Public
router.get('/recipe/:recipeId', async (req, res) => {
    try {
        const reviews = await Review.find({ recipe: req.params.recipeId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { recipe, rating, comment } = req.body;

        // Check if recipe exists
        const recipeExists = await Recipe.findById(recipe);
        if (!recipeExists) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Check if user already reviewed this recipe
        const existingReview = await Review.findOne({
            user: req.user._id,
            recipe
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this recipe'
            });
        }

        // Create review
        const review = await Review.create({
            user: req.user._id,
            recipe,
            rating,
            comment
        });

        // Update recipe ratings
        recipeExists.ratings.push({
            user: req.user._id,
            rating
        });
        recipeExists.calculateAverageRating();
        await recipeExists.save();

        await review.populate('user', 'name');

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check ownership
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this review'
            });
        }

        const { rating, comment } = req.body;
        const oldRating = review.rating;

        review = await Review.findByIdAndUpdate(
            req.params.id,
            { rating, comment },
            { new: true, runValidators: true }
        ).populate('user', 'name');

        // Update recipe ratings
        const recipe = await Recipe.findById(review.recipe);
        const ratingIndex = recipe.ratings.findIndex(
            r => r.user.toString() === req.user._id.toString()
        );

        if (ratingIndex > -1) {
            recipe.ratings[ratingIndex].rating = rating;
            recipe.calculateAverageRating();
            await recipe.save();
        }

        res.json({
            success: true,
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check ownership or admin
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this review'
            });
        }

        await Review.findByIdAndDelete(req.params.id);

        // Update recipe ratings
        const recipe = await Recipe.findById(review.recipe);
        recipe.ratings = recipe.ratings.filter(
            r => r.user.toString() !== review.user.toString()
        );
        recipe.calculateAverageRating();
        await recipe.save();

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
