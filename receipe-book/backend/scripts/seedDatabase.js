import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import Recipe from '../models/Recipe.js';

dotenv.config();

// Categories to fetch from TheMealDB (must use actual categories, not cuisines)
const THEMEALDB_CATEGORIES = ['Beef', 'Chicken', 'Dessert', 'Lamb', 'Pasta', 'Pork', 'Seafood', 'Vegetarian', 'Breakfast'];

// Cuisines to fetch from Spoonacular
const SPOONACULAR_CUISINES = ['Indian', 'Italian', 'Chinese', 'Mexican', 'Thai', 'Japanese', 'American', 'Mediterranean'];

// Fetch recipes from TheMealDB
const fetchTheMealDBRecipes = async () => {
    console.log('\n📥 Fetching recipes from TheMealDB API...');
    const allRecipes = [];

    for (const category of THEMEALDB_CATEGORIES) {
        try {
            const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);

            if (response.data.meals) {
                // Get first 8 recipes from each category
                const meals = response.data.meals.slice(0, 10);

                for (const meal of meals) {
                    // Fetch detailed recipe information
                    const detailResponse = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);

                    if (detailResponse.data.meals && detailResponse.data.meals[0]) {
                        const mealDetail = detailResponse.data.meals[0];

                        // Parse ingredients
                        const ingredients = [];
                        for (let i = 1; i <= 20; i++) {
                            const ingredient = mealDetail[`strIngredient${i}`];
                            const measure = mealDetail[`strMeasure${i}`];

                            if (ingredient && ingredient.trim()) {
                                ingredients.push({
                                    name: ingredient.trim(),
                                    measure: measure ? measure.trim() : ''
                                });
                            }
                        }

                        // Parse instructions into steps
                        const instructions = mealDetail.strInstructions || '';
                        const steps = instructions
                            .split(/\r?\n/)
                            .filter(step => step.trim().length > 0)
                            .map(step => step.trim());

                        // Determine difficulty based on number of ingredients
                        let difficulty = 'Easy';
                        if (ingredients.length > 10) difficulty = 'Medium';
                        if (ingredients.length > 15) difficulty = 'Hard';

                        // Determine if vegetarian
                        const isVeg = mealDetail.strCategory === 'Vegetarian' ||
                            !['Beef', 'Chicken', 'Lamb', 'Pork', 'Seafood'].includes(mealDetail.strCategory);

                        // Determine category
                        let finalCategory = mealDetail.strCategory || category;
                        const mealDbMapping = {
                            'Beef': ['Lunch', 'Dinner', 'Main Course'],
                            'Chicken': ['Lunch', 'Dinner', 'Main Course'],
                            'Lamb': ['Lunch', 'Dinner', 'Main Course'],
                            'Pork': ['Lunch', 'Dinner', 'Main Course'],
                            'Seafood': ['Lunch', 'Dinner', 'Main Course'],
                            'Pasta': ['Lunch', 'Dinner', 'Main Course'],
                            'Vegetarian': ['Lunch', 'Dinner', 'Main Course', 'Appetizer'],
                            'Side': ['Appetizer', 'Snacks'],
                            'Starter': ['Appetizer'],
                            'Dessert': ['Dessert'],
                            'Breakfast': ['Breakfast']
                        };

                        if (mealDbMapping[finalCategory]) {
                            const options = mealDbMapping[finalCategory];
                            finalCategory = options[Math.floor(Math.random() * options.length)];
                        } else {
                            finalCategory = 'Main Course'; // Default
                        }

                        // Create recipe object
                        const recipe = {
                            title: mealDetail.strMeal,
                            ingredients,
                            steps: steps.length > 0 ? steps : [instructions],
                            category: finalCategory,
                            cuisine: mealDetail.strArea || 'International',
                            cookingTime: Math.floor(Math.random() * 60) + 30,
                            difficulty,
                            image: mealDetail.strMealThumb || '',
                            source: 'themealdb',
                            tags: [mealDetail.strCategory, mealDetail.strArea].filter(Boolean),
                            servings: 4,
                            isVeg
                        };

                        allRecipes.push(recipe);
                    }
                }

                console.log(`✓ Fetched ${meals.length} recipes from ${category}`);
            }
        } catch (error) {
            console.error(`❌ Error fetching ${category}:`, error.message);
        }
    }

    return allRecipes;
};

// Fetch recipes from Spoonacular
const fetchSpoonacularRecipes = async () => {
    console.log('\n📥 Fetching recipes from Spoonacular API...');

    // Check if API key is configured
    if (!process.env.SPOONACULAR_API_KEY || process.env.SPOONACULAR_API_KEY === 'your_spoonacular_api_key_here') {
        console.log('⚠️  Spoonacular API key not configured. Skipping Spoonacular recipes.');
        console.log('💡 Add SPOONACULAR_API_KEY to .env to fetch recipes from Spoonacular.');
        return [];
    }

    const allRecipes = [];

    for (const cuisine of SPOONACULAR_CUISINES) {
        try {
            // Fetch random recipes by cuisine
            const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
                params: {
                    apiKey: process.env.SPOONACULAR_API_KEY,
                    cuisine: cuisine,
                    number: 5, // 5 recipes per cuisine
                    addRecipeInformation: true,
                    fillIngredients: true
                },
                timeout: 10000
            });

            if (response.data.results) {
                for (const spoonRecipe of response.data.results) {
                    // Parse ingredients
                    const ingredients = spoonRecipe.extendedIngredients?.map(ing => ({
                        name: ing.name || ing.original,
                        measure: ing.measures?.metric?.amount
                            ? `${ing.measures.metric.amount} ${ing.measures.metric.unitShort}`
                            : ing.amount ? `${ing.amount} ${ing.unit}` : ''
                    })) || [];

                    // Parse instructions
                    let steps = [];
                    if (spoonRecipe.analyzedInstructions && spoonRecipe.analyzedInstructions[0]) {
                        steps = spoonRecipe.analyzedInstructions[0].steps.map(step => step.step);
                    } else if (spoonRecipe.instructions) {
                        steps = [spoonRecipe.instructions];
                    }

                    // Determine difficulty
                    let difficulty = 'Easy';
                    if (ingredients.length > 10) difficulty = 'Medium';
                    if (ingredients.length > 15) difficulty = 'Hard';

                    // Determine category based on dish types
                    let category = 'Main Course';
                    if (spoonRecipe.dishTypes?.includes('dessert')) category = 'Dessert';
                    else if (spoonRecipe.dishTypes?.includes('breakfast')) category = 'Breakfast';
                    else if (spoonRecipe.dishTypes?.includes('appetizer')) category = 'Appetizer';
                    else if (spoonRecipe.dishTypes?.includes('salad')) category = 'Appetizer';
                    else if (spoonRecipe.dishTypes?.includes('snack')) category = 'Snacks';
                    else if (spoonRecipe.dishTypes?.includes('lunch')) category = 'Lunch';
                    else if (spoonRecipe.dishTypes?.includes('dinner')) category = 'Dinner';
                    else if (spoonRecipe.dishTypes?.includes('beverage')) category = 'Beverages';
                    else if (spoonRecipe.dishTypes?.includes('drink')) category = 'Beverages';

                    const recipe = {
                        title: spoonRecipe.title,
                        ingredients,
                        steps: steps.length > 0 ? steps : ['Instructions not available'],
                        category,
                        cuisine: cuisine,
                        cookingTime: spoonRecipe.readyInMinutes || Math.floor(Math.random() * 60) + 30,
                        difficulty,
                        image: spoonRecipe.image || '',
                        source: 'spoonacular',
                        tags: [...(spoonRecipe.dishTypes || []), cuisine].filter(Boolean),
                        servings: spoonRecipe.servings || 4,
                        isVeg: spoonRecipe.vegetarian || false
                    };

                    allRecipes.push(recipe);
                }

                console.log(`✓ Fetched ${response.data.results.length} recipes from ${cuisine} cuisine`);
            }

            // Add delay to respect API rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            if (error.response?.status === 402) {
                console.error(`❌ Spoonacular API quota exceeded. Stopping Spoonacular fetch.`);
                break;
            }
            console.error(`❌ Error fetching ${cuisine}:`, error.message);
        }
    }

    return allRecipes;
};

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if recipes already exist
        const existingRecipes = await Recipe.countDocuments();

        if (existingRecipes > 0) {
            console.log(`ℹ️  Database already has ${existingRecipes} recipes. Skipping seed.`);
            console.log('💡 To re-seed, delete all recipes first or drop the collection.');
            process.exit(0);
        }

        // Fetch from both APIs
        const [themealdbRecipes, spoonacularRecipes] = await Promise.all([
            fetchTheMealDBRecipes(),
            fetchSpoonacularRecipes()
        ]);

        const allRecipes = [...themealdbRecipes, ...spoonacularRecipes];

        console.log(`\n📊 Total recipes fetched: ${allRecipes.length}`);
        console.log(`   - TheMealDB: ${themealdbRecipes.length} recipes`);
        console.log(`   - Spoonacular: ${spoonacularRecipes.length} recipes`);

        if (allRecipes.length === 0) {
            console.log('⚠️  No recipes fetched. Please check your internet connection and API keys.');
            process.exit(1);
        }

        // Insert recipes into MongoDB
        console.log('\n💾 Saving recipes to MongoDB...');
        const savedRecipes = await Recipe.insertMany(allRecipes);

        console.log(`✅ Successfully seeded ${savedRecipes.length} recipes!`);
        console.log('\n📋 Summary by Source:');

        // Show summary by source
        const sourceCounts = {};
        savedRecipes.forEach(recipe => {
            sourceCounts[recipe.source] = (sourceCounts[recipe.source] || 0) + 1;
        });

        Object.entries(sourceCounts).forEach(([source, count]) => {
            console.log(`   ${source}: ${count} recipes`);
        });

        console.log('\n📋 Summary by Category:');

        // Show summary by category
        const categoryCounts = {};
        savedRecipes.forEach(recipe => {
            categoryCounts[recipe.category] = (categoryCounts[recipe.category] || 0) + 1;
        });

        Object.entries(categoryCounts).forEach(([category, count]) => {
            console.log(`   ${category}: ${count} recipes`);
        });

        console.log('\n🎉 Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

// Run the seed function
seedDatabase();
