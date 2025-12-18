import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';
import Loading from '../components/Loading';

const Favorites = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchFavorites();
    }, [isAuthenticated, user]);

    const fetchFavorites = async () => {
        if (!user?.favorites || user.favorites.length === 0) {
            setLoading(false);
            return;
        }

        try {
            // Fetch all favorite recipes
            const promises = user.favorites.map(id => recipeAPI.getById(id));
            const responses = await Promise.all(promises);

            const favoriteRecipes = responses
                .filter(res => res.data.success)
                .map(res => res.data.data);

            setRecipes(favoriteRecipes);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading message="Loading your favorites..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold mb-8">My Favorite Recipes</h1>

                {recipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recipes.map((recipe) => (
                            <RecipeCard key={recipe._id} recipe={recipe} />
                        ))}
                    </div>
                ) : (
                    <div className="card p-12 text-center">
                        <div className="text-6xl mb-4">🤍</div>
                        <h2 className="text-2xl font-bold mb-4">No favorites yet</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Start exploring recipes and add your favorites!
                        </p>
                        <button
                            onClick={() => navigate('/recipes')}
                            className="btn-primary"
                        >
                            Browse Recipes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;
