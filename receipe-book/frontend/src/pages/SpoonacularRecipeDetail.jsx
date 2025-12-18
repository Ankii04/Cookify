import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { searchAPI } from '../utils/api';
import Loading from '../components/Loading';
import { motion, AnimatePresence } from 'framer-motion';

const SpoonacularRecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cookingMode, setCookingMode] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [showIngredientsInCooking, setShowIngredientsInCooking] = useState(false);

    useEffect(() => {
        if (cookingMode) {
            document.body.style.overflow = 'hidden';
            setCurrentStep(0);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [cookingMode]);

    useEffect(() => {
        fetchRecipeDetails();
    }, [id]);

    const fetchRecipeDetails = async () => {
        try {
            setLoading(true);
            const response = await searchAPI.getById(id);

            if (response.data.success) {
                setRecipe(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching recipe:', err);
            setError('Failed to load recipe details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading message="Loading recipe details..." />;
    }

    if (error || !recipe) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="card p-8 text-center">
                        <div className="text-6xl mb-4">😕</div>
                        <h2 className="text-2xl font-bold mb-2">Recipe Not Found</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                        <button onClick={() => navigate('/search')} className="btn-primary">
                            Back to Search
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-bold group"
                    >
                        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back
                    </button>
                    {recipe.steps && recipe.steps.length > 0 && (
                        <button
                            onClick={() => setCookingMode(true)}
                            className="btn-primary flex items-center gap-2"
                        >
                            👨‍🍳 Start Cooking
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {cookingMode && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl flex flex-col p-8 text-gray-900 dark:text-white"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold">Cooking Mode: {recipe.title}</h2>
                                    <button
                                        onClick={() => setShowIngredientsInCooking(!showIngredientsInCooking)}
                                        className="text-orange-500 font-bold hover:underline"
                                    >
                                        {showIngredientsInCooking ? '← Back to Steps' : '📋 View Ingredients'}
                                    </button>
                                </div>
                                <button
                                    onClick={() => setCookingMode(false)}
                                    className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <div className="max-w-4xl mx-auto py-12 px-4">
                                    <AnimatePresence mode="wait">
                                        {showIngredientsInCooking ? (
                                            <motion.div
                                                key="ingredients-list"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                            >
                                                <h3 className="col-span-full text-2xl font-black mb-4">Ingredients Required</h3>
                                                {recipe.ingredients.map((ing, i) => (
                                                    <div key={i} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl flex justify-between">
                                                        <span className="font-bold">{ing.name}</span>
                                                        <span className="text-orange-500">{ing.measure}</span>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="step-content"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="text-center"
                                            >
                                                <span className="text-orange-500 font-bold mb-6 uppercase tracking-[0.4em] text-xs block">Step {currentStep + 1} of {recipe.steps.length}</span>
                                                <p className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight drop-shadow-sm">
                                                    {recipe.steps[currentStep]}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {!showIngredientsInCooking && (
                                <div className="flex justify-between py-8 max-w-4xl mx-auto w-full gap-6">
                                    <button
                                        disabled={currentStep === 0}
                                        onClick={() => setCurrentStep(prev => prev - 1)}
                                        className={`flex-1 py-5 rounded-3xl text-xl font-bold transition-all shadow-xl ${currentStep === 0
                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                            : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-100 dark:border-gray-700'
                                            }`}
                                    >
                                        Previous
                                    </button>
                                    {currentStep === recipe.steps.length - 1 ? (
                                        <button
                                            onClick={() => setCookingMode(false)}
                                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-5 rounded-3xl text-xl font-bold hover:scale-105 transition-all shadow-2xl shadow-green-500/20"
                                        >
                                            Finish & Enjoy! 🎉
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setCurrentStep(prev => prev + 1)}
                                            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-5 rounded-3xl text-xl font-bold hover:scale-105 transition-all shadow-2xl shadow-orange-500/20"
                                        >
                                            Next Step →
                                        </button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Image and Info */}
                    <div className="lg:col-span-1">
                        <div className="card overflow-hidden sticky top-8">
                            {/* Recipe Image */}
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={recipe.image || '/placeholder-recipe.jpg'}
                                    alt={recipe.title}
                                    className="w-full h-full object-cover"
                                />
                                {recipe.isVeg && (
                                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        🥗 Vegetarian
                                    </div>
                                )}
                            </div>

                            {/* Quick Info */}
                            <div className="p-6">
                                <h1 className="text-xl font-bold mb-4">{recipe.title}</h1>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">⏱️ Cooking Time</span>
                                        <span className="font-semibold">{recipe.cookingTime} min</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">🍽️ Servings</span>
                                        <span className="font-semibold">{recipe.servings}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">🌍 Cuisine</span>
                                        <span className="font-semibold">{recipe.cuisine}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">📂 Category</span>
                                        <span className="font-semibold">{recipe.category}</span>
                                    </div>
                                </div>

                                {/* Health Score */}
                                {recipe.healthScore && (
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-gray-600 dark:text-gray-400">Health Score</span>
                                            <span className="font-semibold text-green-600">{recipe.healthScore}/100</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${recipe.healthScore}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Dietary Info */}
                                <div className="flex flex-wrap gap-2">
                                    {recipe.vegetarian && (
                                        <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                            Vegetarian
                                        </span>
                                    )}
                                    {recipe.vegan && (
                                        <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                            Vegan
                                        </span>
                                    )}
                                    {recipe.glutenFree && (
                                        <span className="badge bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                            Gluten Free
                                        </span>
                                    )}
                                    {recipe.dairyFree && (
                                        <span className="badge bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                            Dairy Free
                                        </span>
                                    )}
                                    {recipe.veryHealthy && (
                                        <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                            Very Healthy
                                        </span>
                                    )}
                                    {recipe.cheap && (
                                        <span className="badge bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                                            Budget Friendly
                                        </span>
                                    )}
                                    {recipe.sustainable && (
                                        <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                            Sustainable
                                        </span>
                                    )}
                                </div>

                                {/* Source Badge */}
                                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Source</span>
                                        <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                                            Spoonacular
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Summary */}
                        {recipe.summary && (
                            <div className="card p-6">
                                <h2 className="text-xl font-bold mb-4">About This Recipe</h2>
                                <div
                                    className="text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ __html: recipe.summary }}
                                />
                            </div>
                        )}

                        {/* Ingredients */}
                        {recipe.ingredients && recipe.ingredients.length > 0 && (
                            <div className="card p-6">
                                <h2 className="text-xl font-bold mb-4">
                                    🛒 Ingredients ({recipe.ingredients.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {recipe.ingredients.map((ingredient, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                        >
                                            <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
                                            <div className="flex-1">
                                                <span className="font-medium">{ingredient.name}</span>
                                                {ingredient.measure && (
                                                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                                                        ({ingredient.measure})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Instructions */}
                        {recipe.steps && recipe.steps.length > 0 && (
                            <div className="card p-6">
                                <h2 className="text-xl font-bold mb-4">
                                    👨‍🍳 Instructions ({recipe.steps.length} steps)
                                </h2>
                                <div className="space-y-4">
                                    {recipe.steps.map((step, index) => (
                                        <div key={index} className="flex space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                                                    {index + 1}
                                                </div>
                                            </div>
                                            <div className="flex-1 pt-1">
                                                <p className="text-gray-700 dark:text-gray-300">{step}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* External Link */}
                        {recipe.sourceUrl && (
                            <div className="card p-6 bg-gradient-to-r from-primary-50 to-orange-50 dark:from-primary-900/20 dark:to-orange-900/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Want More Details?</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Visit the original recipe source for additional information
                                        </p>
                                    </div>
                                    <a
                                        href={recipe.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary whitespace-nowrap"
                                    >
                                        View Original →
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpoonacularRecipeDetail;
