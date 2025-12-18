import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const RecipeCard = ({ recipe }) => {
    const { isAuthenticated, isFavorite, toggleFavorite } = useAuth();
    const isFav = isFavorite(recipe._id);

    const handleFavoriteClick = (e) => {
        e.preventDefault();
        if (isAuthenticated) {
            toggleFavorite(recipe._id);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';
        if (imagePath.startsWith('http')) return imagePath;
        return `${import.meta.env.VITE_API_URL}${imagePath}`;
    };

    return (
        <Link to={`/recipes/${recipe._id}`} className="block group h-full">
            <div className="recipe-card card-shine h-full flex flex-col">
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden flex-shrink-0">
                    <img
                        src={getImageUrl(recipe.image)}
                        alt={recipe.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';
                        }}
                    />

                    {/* Gradient Overlay */}
                    <div className="image-overlay"></div>

                    {/* Veg/Non-Veg Indicator */}
                    <div className="absolute top-4 left-4 z-20">
                        <div className={`w-7 h-7 border-3 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded shadow-lg ${recipe.isVeg ? 'border-green-600' : 'border-red-600'
                            }`}>
                            <div className={`w-3.5 h-3.5 rounded-full ${recipe.isVeg ? 'bg-green-600' : 'bg-red-600'
                                }`}></div>
                        </div>
                    </div>

                    {/* Favorite Button */}
                    {isAuthenticated && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleFavoriteClick}
                            className="absolute top-4 right-4 z-20 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                        >
                            <span className="text-2xl block">
                                {isFav ? '❤️' : '🤍'}
                            </span>
                        </motion.button>
                    )}

                    {/* Quick Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex items-center gap-3 text-white text-sm font-semibold">
                            <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                                <span>⏱️</span>
                                {recipe.cookingTime} min
                            </span>
                            <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                                <span>⭐</span>
                                {recipe.averageRating?.toFixed(1) || '0.0'}
                            </span>
                            <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                                <span>🍽️</span>
                                {recipe.servings}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 bg-white dark:bg-gray-800">
                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {recipe.title}
                    </h3>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="badge bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                            {recipe.category}
                        </span>
                        <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {recipe.cuisine}
                        </span>
                    </div>

                    {/* Creator */}
                    {recipe.createdBy && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <span className="mr-2">👨‍🍳</span>
                            <span>By {recipe.createdBy.name || 'Anonymous'}</span>
                        </div>
                    )}
                </div>

                {/* Hover Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
            </div>
        </Link>
    );
};

export default RecipeCard;
