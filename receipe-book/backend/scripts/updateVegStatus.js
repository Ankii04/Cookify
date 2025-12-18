import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Recipe from '../models/Recipe.js';

dotenv.config();

const updateRecipesWithVegStatus = async () => {
    try {
        console.log('🔄 Updating recipes with Veg/Non-Veg status...');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Mark vegetarian recipes
        const vegResult = await Recipe.updateMany(
            { category: { $in: ['Vegetarian', 'Dessert', 'Pasta', 'Breakfast'] } },
            { $set: { isVeg: true } }
        );
        console.log(`✅ Marked ${vegResult.modifiedCount} recipes as Vegetarian`);

        // Mark non-vegetarian recipes
        const nonVegResult = await Recipe.updateMany(
            { category: { $in: ['Chicken', 'mutton', 'fish'] } },
            { $set: { isVeg: false } }
        );
        console.log(`✅ Marked ${nonVegResult.modifiedCount} recipes as Non-Vegetarian`);

        // Optional: Rename animal-based categories
        await Recipe.updateMany(
            { category: 'Beef' },
            { $set: { category: 'Non-Veg Dishes', isVeg: false } }
        );

        await Recipe.updateMany(
            { category: 'Pork' },
            { $set: { category: 'Non-Veg Dishes', isVeg: false } }
        );

        await Recipe.updateMany(
            { category: 'Goat' },
            { $set: { category: 'Non-Veg Dishes', isVeg: false } }
        );

        await Recipe.updateMany(
            { category: 'Lamb' },
            { $set: { category: 'Lamb Dishes', isVeg: false } }
        );

        await Recipe.updateMany(
            { category: 'Chicken' },
            { $set: { category: 'Chicken Dishes', isVeg: false } }
        );

        console.log('✅ Updated category names to remove direct animal references');

        // Show summary
        const vegCount = await Recipe.countDocuments({ isVeg: true });
        const nonVegCount = await Recipe.countDocuments({ isVeg: false });

        console.log('\n📊 Summary:');
        console.log(`   Vegetarian recipes: ${vegCount}`);
        console.log(`   Non-Vegetarian recipes: ${nonVegCount}`);
        console.log(`   Total recipes: ${vegCount + nonVegCount}`);

        console.log('\n🎉 Update completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Update error:', error);
        process.exit(1);
    }
};

updateRecipesWithVegStatus();
