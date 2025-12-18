import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Recipe from '../models/Recipe.js';

dotenv.config();

const updateCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const recipes = await Recipe.find({});
        console.log(`📊 Found ${recipes.length} recipes to update.`);

        let updatedCount = 0;

        for (const recipe of recipes) {
            let newCategory = recipe.category;

            // Mapping logic
            if (['Beef', 'Chicken', 'Lamb', 'Pork', 'Seafood', 'Pasta'].includes(recipe.category)) {
                // Randomly assign to Lunch, Dinner or Main Course
                const options = ['Lunch', 'Dinner', 'Main Course'];
                newCategory = options[Math.floor(Math.random() * options.length)];
            } else if (recipe.category === 'Vegetarian') {
                const options = ['Lunch', 'Dinner', 'Appetizer', 'Main Course'];
                newCategory = options[Math.floor(Math.random() * options.length)];
            } else if (recipe.category === 'Side' || recipe.category === 'Starter') {
                newCategory = 'Appetizer';
            } else if (recipe.category === 'Miscellaneous') {
                newCategory = 'Snacks';
            }

            // Ensure first letter is capitalized to match UI
            newCategory = newCategory.charAt(0).toUpperCase() + newCategory.slice(1).toLowerCase();

            if (newCategory !== recipe.category) {
                recipe.category = newCategory;
                await recipe.save();
                updatedCount++;
            }
        }

        console.log(`✅ Successfully updated ${updatedCount} recipes.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating categories:', error);
        process.exit(1);
    }
};

updateCategories();
