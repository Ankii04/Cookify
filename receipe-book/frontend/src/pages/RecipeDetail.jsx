import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { recipeAPI, reviewAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useShopping } from '../context/ShoppingContext';
import { SkeletonDetail } from '../components/Skeletons';
import { motion, AnimatePresence } from 'framer-motion';

const RecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, isFavorite, toggleFavorite } = useAuth();
    const { addItem } = useShopping();

    const [recipe, setRecipe] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFav, setIsFav] = useState(false);
    const [servings, setServings] = useState(4);
    const [cookingMode, setCookingMode] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [showIngredientsInCooking, setShowIngredientsInCooking] = useState(false);

    // Review form
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRecipe();
        fetchReviews();
    }, [id]);

    useEffect(() => {
        if (recipe && isAuthenticated) {
            setIsFav(isFavorite(recipe._id));
        }
    }, [recipe, isAuthenticated]);

    const fetchRecipe = async () => {
        try {
            const response = await recipeAPI.getById(id);
            if (response.data.success) {
                const data = response.data.data;
                setRecipe(data);
                setServings(data.servings || 4);
            }
        } catch (error) {
            console.error('Error fetching recipe:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await reviewAPI.getByRecipe(id);
            if (response.data.success) {
                setReviews(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleFavoriteClick = async () => {
        if (!isAuthenticated) {
            alert('Please login to add favorites');
            return;
        }

        try {
            const newFavStatus = await toggleFavorite(recipe._id);
            setIsFav(newFavStatus);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const addToShoppingList = (ingredient) => {
        addItem(ingredient);
        // Add a small toast or notification logic here if needed
    };

    const getImageUrl = () => {
        if (recipe.image) {
            if (recipe.image.startsWith('http')) {
                return recipe.image;
            }
            return `${import.meta.env.VITE_API_URL}${recipe.image}`;
        }
        return 'https://via.placeholder.com/800x600?text=No+Image';
    };

    const calculateQuantity = (measure) => {
        if (!measure) return '';
        const ratio = servings / (recipe.servings || 4);
        // Simple regex to find numbers/fractions and multiply them
        return measure.replace(/(\d+(?:\.\d+)?|\d+\/\d+)/g, (match) => {
            let val;
            if (match.includes('/')) {
                const [n, d] = match.split('/');
                val = parseInt(n) / parseInt(d);
            } else {
                val = parseFloat(match);
            }
            const result = (val * ratio).toFixed(1);
            return result.endsWith('.0') ? result.slice(0, -2) : result;
        });
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this recipe?')) {
            try {
                await recipeAPI.delete(id);
                navigate('/recipes');
            } catch (error) {
                console.error('Error deleting recipe:', error);
                alert('Failed to delete recipe');
            }
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert('Please login to submit a review');
            return;
        }

        setSubmitting(true);
        try {
            const response = await reviewAPI.create({
                recipe: id,
                rating,
                comment
            });

            if (response.data.success) {
                setReviews([response.data.data, ...reviews]);
                setShowReviewForm(false);
                setRating(5);
                setComment('');
                fetchRecipe(); // Refresh to update average rating
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

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

    if (loading) {
        return <SkeletonDetail />;
    }

    if (!recipe) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Recipe not found</h2>
                    <Link to="/recipes" className="btn-primary">
                        Back to Recipes
                    </Link>
                </div>
            </div>
        );
    }

    const canEdit = user && (user._id === recipe.createdBy?._id || user.role === 'admin');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 relative">
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
                                            <h3 className="col-span-full text-3xl font-black mb-4">Ingredients Required</h3>
                                            {recipe.ingredients.map((ing, i) => (
                                                <div key={i} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl flex justify-between">
                                                    <span className="font-bold">{ing.name}</span>
                                                    <span className="text-orange-500">{calculateQuantity(ing.measure)}</span>
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button & Start Cooking */}
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors font-bold group"
                    >
                        <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span> Back
                    </button>
                    <div className="flex gap-4">
                        {recipe.steps && recipe.steps.length > 0 && (
                            <button
                                onClick={() => setCookingMode(true)}
                                className="btn-primary flex items-center gap-2 px-6"
                            >
                                <span className="text-xl">👨‍🍳</span> Start Cooking
                            </button>
                        )}
                        {canEdit && (
                            <div className="flex gap-2">
                                <Link to={`/recipes/${id}/edit`} className="btn-secondary px-6">Edit</Link>
                                <button onClick={handleDelete} className="bg-red-50 text-red-600 px-6 py-2.5 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all">Delete</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column - Sidebar Info */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="card overflow-hidden shadow-2xl border-none">
                                <div className="relative h-72">
                                    <img
                                        src={getImageUrl()}
                                        alt={recipe.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/800x600?text=No+Image';
                                        }}
                                    />
                                    <div className="absolute top-4 right-4">
                                        {isAuthenticated && (
                                            <button
                                                onClick={handleFavoriteClick}
                                                className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform"
                                            >
                                                <span className="text-xl">{isFav ? '❤️' : '🤍'}</span>
                                            </button>
                                        )}
                                    </div>
                                    {recipe.isVeg !== undefined && (
                                        <div className="absolute top-4 left-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${recipe.isVeg ? 'bg-green-500' : 'bg-red-500'}`}>
                                                {recipe.isVeg ? '🥗 Veg' : '🍖 Non-Veg'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-8">
                                    <h1 className="text-2xl font-black mb-4 leading-tight text-gray-900 dark:text-white">{recipe.title}</h1>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400 font-medium">⏱️ Cooking Time</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{recipe.cookingTime} min</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400 font-medium">👥 Servings</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{recipe.servings}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400 font-medium">🌍 Cuisine</span>
                                            <span className="font-bold text-gray-900 dark:text-white capitalize">{recipe.cuisine}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400 font-medium">📂 Category</span>
                                            <span className="font-bold text-gray-900 dark:text-white capitalize">{recipe.category}</span>
                                        </div>
                                    </div>

                                    {/* Author Info */}
                                    {recipe.createdBy && (
                                        <div className="pt-6 border-t dark:border-gray-700">
                                            <Link
                                                to={`/profile/${recipe.createdBy._id}`}
                                                className="flex items-center gap-3 group"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-lg">👨‍🍳</div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Chef</p>
                                                    <p className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">{recipe.createdBy.name}</p>
                                                </div>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tags */}
                            {recipe.tags && recipe.tags.length > 0 && (
                                <div className="card p-6 border-none shadow-xl bg-white dark:bg-gray-800">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {recipe.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Serving Adjuster */}
                        <div className="card p-8 bg-orange-50 dark:bg-orange-900/10 border-none shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <h3 className="text-xl font-bold text-orange-800 dark:text-orange-300">Adjust Serving Size</h3>
                                <p className="text-sm text-orange-600/70 dark:text-orange-400/70">Ingredients will update automatically</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <button onClick={() => setServings(Math.max(1, servings - 1))} className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-2xl font-bold hover:bg-orange-500 hover:text-white transition-all">−</button>
                                <span className="text-4xl font-black text-orange-600 min-w-[60px] text-center">{servings}</span>
                                <button onClick={() => setServings(servings + 1)} className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-2xl font-bold hover:bg-orange-500 hover:text-white transition-all">+</button>
                            </div>
                        </div>

                        {/* Ingredients */}
                        <div className="card p-8 border-none shadow-xl">
                            <h2 className="text-2xl font-black mb-6 flex items-center gap-4 text-gray-900 dark:text-white">
                                🛒 Ingredients
                                <div className="h-0.5 flex-1 bg-gray-100 dark:bg-gray-800 rounded-full" />
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                {recipe.ingredients.map((ingredient, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700 last:border-0"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                                            <div>
                                                <span className="font-bold text-orange-600 mr-2">
                                                    {calculateQuantity(ingredient.measure)}
                                                </span>
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{ingredient.name}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => addToShoppingList(ingredient)}
                                            className="p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg text-orange-600"
                                            title="Add to list"
                                        >
                                            🛒+
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="card p-8 border-none shadow-xl">
                            <h2 className="text-2xl font-black mb-6 flex items-center gap-4 text-gray-900 dark:text-white">
                                👨‍🍳 Instructions
                                <div className="h-0.5 flex-1 bg-gray-100 dark:bg-gray-800 rounded-full" />
                            </h2>
                            <div className="space-y-10">
                                {recipe.steps.map((step, index) => (
                                    <div key={index} className="flex gap-8 group">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-black rounded-2xl flex items-center justify-center text-xl group-hover:bg-orange-500 group-hover:text-white transition-all transform group-hover:rotate-6">
                                                {index + 1}
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{step}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chef Tip */}
                        <div className="p-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 transform group-hover:scale-110 transition-transform">
                                <span className="text-9xl">💡</span>
                            </div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="animate-pulse text-2xl">✨</span> Chef's Smart Tip
                            </h3>
                            <p className="relative z-10 text-xl leading-relaxed font-medium text-indigo-50">
                                "To elevate this {recipe.category} dish, make sure to prep all {recipe.ingredients.length} ingredients beforehand. Fresh {recipe.ingredients[0]?.name} makes all the difference in the final flavor profile!"
                            </p>
                        </div>

                        {/* Reviews */}
                        <div className="card p-10 border-none shadow-xl">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Reviews ({reviews.length})</h2>
                                {isAuthenticated && !showReviewForm && (
                                    <button onClick={() => setShowReviewForm(true)} className="btn-primary px-8">Write a Review</button>
                                )}
                            </div>

                            {showReviewForm && (
                                <form onSubmit={handleReviewSubmit} className="mb-12 p-8 bg-gray-50 dark:bg-gray-700/50 rounded-3xl animate-fade-in">
                                    <div className="mb-6 text-center">
                                        <label className="label text-lg mb-4 block">How would you rate this recipe?</label>
                                        <div className="flex justify-center gap-4">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    className={`text-5xl transition-all hover:scale-125 ${star <= rating ? 'grayscale-0' : 'grayscale text-gray-300'}`}
                                                >
                                                    ⭐
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="label">Share your thoughts</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            className="input-field min-h-[150px] text-lg rounded-2xl"
                                            placeholder="Was it delicious? Did you change anything?"
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <button type="submit" disabled={submitting} className="btn-primary flex-1 py-4 text-lg">
                                            {submitting ? 'Submitting...' : 'Post Review'}
                                        </button>
                                        <button type="button" onClick={() => setShowReviewForm(false)} className="btn-secondary px-8">Cancel</button>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-8">
                                {reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <div key={review._id} className="p-6 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-50 dark:border-gray-700">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="font-black text-lg text-gray-900 dark:text-white">{review.user?.name || 'Home Chef'}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="text-yellow-500 text-sm">
                                                            {'⭐'.repeat(review.rating)}
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-400">
                                                            • {new Date(review.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{review.comment}</p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-gray-400 font-bold italic">No reviews yet. Be the first to cook and review!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetail;
