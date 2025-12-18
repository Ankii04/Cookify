import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Recipe from '../models/Recipe.js';

dotenv.config();

const clearDatabase = async () => {
    try {
        console.log('🗑️  Starting database cleanup...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Count existing recipes
        const count = await Recipe.countDocuments();
        console.log(`📊 Found ${count} recipes in database`);

        if (count === 0) {
            console.log('ℹ️  Database is already empty. Nothing to delete.');
            process.exit(0);
        }

        // Ask for confirmation (in production, you'd want user input)
        console.log('⚠️  This will delete ALL recipes from the database!');

        // Delete all recipes
        const result = await Recipe.deleteMany({});
        console.log(`✅ Successfully deleted ${result.deletedCount} recipes!`);

        console.log('\n🎉 Database cleanup completed!');
        console.log('💡 You can now run "npm run seed" to populate with fresh data.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing database:', error);
        process.exit(1);
    }
};

// Run the clear function
clearDatabase();
