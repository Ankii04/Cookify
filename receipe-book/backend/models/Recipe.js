import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Recipe title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters long']
    },
    ingredients: [{
        name: {
            type: String,
            required: true
        },
        measure: {
            type: String,
            default: ''
        }
    }],
    steps: [{
        type: String,
        required: true
    }],
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    cuisine: {
        type: String,
        default: 'International',
        trim: true
    },
    cookingTime: {
        type: Number,
        min: [1, 'Cooking time must be at least 1 minute']
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    image: {
        type: String,
        default: ''
    },
    source: {
        type: String,
        enum: ['user', 'themealdb', 'spoonacular'],
        default: 'user'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function () {
            return this.source === 'user';
        }
    },
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        }
    }],
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    tags: [{
        type: String,
        trim: true
    }],
    servings: {
        type: Number,
        default: 4
    },
    isVeg: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for faster queries
recipeSchema.index({ title: 'text', category: 1, cuisine: 1 });
recipeSchema.index({ averageRating: -1 });
recipeSchema.index({ createdAt: -1 });

// Method to calculate average rating
recipeSchema.methods.calculateAverageRating = function () {
    if (this.ratings.length === 0) {
        this.averageRating = 0;
    } else {
        const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
        this.averageRating = (sum / this.ratings.length).toFixed(1);
    }
    return this.averageRating;
};

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;
