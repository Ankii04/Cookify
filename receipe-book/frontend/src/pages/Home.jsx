import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recipeAPI } from '../utils/api';
import RecipeCard from '../components/RecipeCard';
import { SkeletonCard } from '../components/Skeletons';

const Home = () => {
    const [featuredRecipes, setFeaturedRecipes] = useState([]);
    const [categories] = useState(['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Dessert', 'Appetizer', 'Main Course', 'Beverages']);
    const [loading, setLoading] = useState(true);
    const [isVegOnly, setIsVegOnly] = useState('all');

    useEffect(() => {
        // Get initial veg filter from localStorage
        const vegFilter = localStorage.getItem('vegFilter') || 'all';
        setIsVegOnly(vegFilter);

        fetchData(vegFilter);

        // Listen for veg filter changes from navbar
        const handleVegFilterChange = (event) => {
            setIsVegOnly(event.detail);
            fetchData(event.detail);
        };

        window.addEventListener('vegFilterChanged', handleVegFilterChange);

        return () => {
            window.removeEventListener('vegFilterChanged', handleVegFilterChange);
        };
    }, []);

    const fetchData = async (vegFilter = isVegOnly) => {
        try {
            let params = { limit: 6, sort: 'rating' };

            // Add filter based on vegFilter state
            if (vegFilter === 'veg') {
                params.isVeg = 'true';
            } else if (vegFilter === 'non-veg') {
                params.isVeg = 'false';
            }
            // If 'all', don't add isVeg parameter

            const recipesRes = await recipeAPI.getAll(params);

            if (recipesRes.data.success) {
                setFeaturedRecipes(recipesRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen food-pattern">
            {/* Hero Section ... */}
            <section className="relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 hero-gradient opacity-95"></div>

                {/* Floating Food Icons */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 text-6xl opacity-20 animate-float">🍕</div>
                    <div className="absolute top-40 right-20 text-5xl opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>🍔</div>
                    <div className="absolute bottom-20 left-1/4 text-7xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>🍝</div>
                    <div className="absolute top-60 right-1/3 text-6xl opacity-20 animate-float" style={{ animationDelay: '1.5s' }}>🍛</div>
                    <div className="absolute bottom-40 right-10 text-5xl opacity-20 animate-float" style={{ animationDelay: '2s' }}>🍰</div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                    <div className="text-center animate-fade-in">
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
                            Discover Culinary
                            <span className="block mt-2">Masterpieces</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto drop-shadow-lg">
                            Explore thousands of recipes from around the world, share your creations, and join our community of food lovers
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                to="/recipes"
                                className="btn-primary text-lg px-8 py-4 shadow-2xl hover:shadow-orange-500/50"
                            >
                                🔍 Explore Recipes
                            </Link>
                            <Link
                                to="/add-recipe"
                                className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-2 border-white/50 font-semibold px-8 py-4 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300"
                            >
                                ✨ Share Your Recipe
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-orange-50 dark:text-gray-900" />
                    </svg>
                </div>
            </section>

            {/* Featured Recipes */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-12 animate-slide-in">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">Featured Recipes</span>
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Handpicked by our chefs, loved by our community
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 6].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : featuredRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-scale-in">
                        {featuredRecipes.map((recipe, index) => (
                            <div
                                key={recipe._id}
                                className="animate-fade-in h-full"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <RecipeCard recipe={recipe} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 card-glass max-w-2xl mx-auto">
                        <div className="text-6xl mb-4">🍳</div>
                        <h3 className="text-2xl font-bold mb-4">No recipes yet!</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Be the first to share a delicious recipe with our community
                        </p>
                        <Link to="/add-recipe" className="btn-primary inline-block">
                            Add First Recipe
                        </Link>
                    </div>
                )}

                <div className="text-center mt-12">
                    <Link
                        to="/recipes"
                        className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold text-lg transition-colors group"
                    >
                        View All Recipes
                        <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                    </Link>
                </div>
            </section>

            {/* Categories */}
            <section className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-gray-800 dark:to-gray-900 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Browse by <span className="gradient-text">Category</span>
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            Find exactly what you're craving
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                        {categories.map((category, index) => (
                            <Link
                                key={category}
                                to={`/recipes?category=${category}`}
                                className="card-glass hover-glow p-8 text-center transform hover:-translate-y-2 transition-all duration-300 animate-scale-in"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="text-5xl mb-4 food-icon">
                                    {getCategoryEmoji(category)}
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                                    {category}
                                </h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">
                    Why Choose <span className="gradient-text">Cookify?</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="card-glass p-8 text-center hover-glow transform hover:-translate-y-2 transition-all duration-300">
                        <div className="text-6xl mb-6 animate-float">📚</div>
                        <h3 className="text-2xl font-bold mb-4">Vast Collection</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Thousands of recipes from cuisines around the world, all in one place
                        </p>
                    </div>

                    <div className="card-glass p-8 text-center hover-glow transform hover:-translate-y-2 transition-all duration-300" style={{ animationDelay: '0.2s' }}>
                        <div className="text-6xl mb-6 animate-float" style={{ animationDelay: '0.5s' }}>👨‍🍳</div>
                        <h3 className="text-2xl font-bold mb-4">Share & Connect</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Share your culinary creations and connect with fellow food enthusiasts
                        </p>
                    </div>

                    <div className="card-glass p-8 text-center hover-glow transform hover:-translate-y-2 transition-all duration-300" style={{ animationDelay: '0.4s' }}>
                        <div className="text-6xl mb-6 animate-float" style={{ animationDelay: '1s' }}>⭐</div>
                        <h3 className="text-2xl font-bold mb-4">Rate & Review</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Help others discover great recipes with your honest ratings and reviews
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative overflow-hidden py-20">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 opacity-90"></div>
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Start Cooking?
                    </h2>
                    <p className="text-xl text-white/90 mb-8">
                        Join thousands of home chefs sharing and discovering amazing recipes
                    </p>
                    <Link
                        to="/register"
                        className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-10 py-4 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 inline-block"
                    >
                        Get Started Free
                    </Link>
                </div>
            </section>
        </div>
    );
};

// Helper function for category emojis
const getCategoryEmoji = (category) => {
    const emojis = {
        'Breakfast': '🍳',
        'Lunch': '🍱',
        'Dinner': '🍽️',
        'Snacks': '🍿',
        'Dessert': '🍰',
        'Appetizer': '🥗',
        'Main Course': '🍛',
        'Beverages': '🥤',
        'Chicken Dishes': '🍗',
        'Vegetarian': '🥗',
        'Lamb Dishes': '🍖',
        'Pasta': '🍝',
        'Seafood': '🦐',
        'Non-Veg Dishes': '🍖',
        'Paneer': '🧈',
        'Dal': '🍲',
        'Rice': '🍚',
        'Roti': '🫓',
        'Biryani': '🍛',
        'Curry': '🍛'
    };
    return emojis[category] || '🍽️';
};

export default Home;
