import { useState } from 'react';
import { Link } from 'react-router-dom';
import { searchAPI } from '../utils/api';
import Loading from '../components/Loading';

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');

    // Filters
    const [cuisine, setCuisine] = useState('');
    const [diet, setDiet] = useState('');
    const [type, setType] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!searchQuery.trim()) {
            setError('Please enter a search term');
            return;
        }

        setLoading(true);
        setError('');
        setSearched(true);

        try {
            const filters = {};
            if (cuisine) filters.cuisine = cuisine;
            if (diet) filters.diet = diet;
            if (type) filters.type = type;

            const response = await searchAPI.search(searchQuery, filters);

            if (response.data.success) {
                setResults(response.data.data);
            }
        } catch (err) {
            console.error('Search error:', err);
            if (err.response?.status === 503) {
                setError('Search feature requires Spoonacular API key. Please configure it in the backend.');
            } else if (err.response?.status === 402) {
                setError('Daily search quota exceeded. Please try again tomorrow.');
            } else {
                setError('Failed to search recipes. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setCuisine('');
        setDiet('');
        setType('');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="gradient-text">Search Recipes</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Powered by Spoonacular - Search millions of recipes worldwide
                    </p>
                </div>

                {/* Search Form */}
                <div className="card p-6 mb-8">
                    <form onSubmit={handleSearch}>
                        {/* Main Search */}
                        <div className="mb-6">
                            <label className="label">Search for recipes</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="e.g., pasta, chicken curry, chocolate cake..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input-field flex-1"
                                />
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? '🔍 Searching...' : '🔍 Search'}
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Cuisine Filter */}
                            <div>
                                <label className="label">Cuisine</label>
                                <select
                                    value={cuisine}
                                    onChange={(e) => setCuisine(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">Any Cuisine</option>
                                    <option value="African">African</option>
                                    <option value="American">American</option>
                                    <option value="British">British</option>
                                    <option value="Chinese">Chinese</option>
                                    <option value="French">French</option>
                                    <option value="German">German</option>
                                    <option value="Greek">Greek</option>
                                    <option value="Indian">Indian</option>
                                    <option value="Italian">Italian</option>
                                    <option value="Japanese">Japanese</option>
                                    <option value="Korean">Korean</option>
                                    <option value="Mexican">Mexican</option>
                                    <option value="Thai">Thai</option>
                                    <option value="Vietnamese">Vietnamese</option>
                                </select>
                            </div>

                            {/* Diet Filter */}
                            <div>
                                <label className="label">Diet</label>
                                <select
                                    value={diet}
                                    onChange={(e) => setDiet(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">Any Diet</option>
                                    <option value="vegetarian">Vegetarian</option>
                                    <option value="vegan">Vegan</option>
                                    <option value="gluten free">Gluten Free</option>
                                    <option value="ketogenic">Ketogenic</option>
                                    <option value="paleo">Paleo</option>
                                </select>
                            </div>

                            {/* Type Filter */}
                            <div>
                                <label className="label">Meal Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">Any Type</option>
                                    <option value="main course">Main Course</option>
                                    <option value="side dish">Side Dish</option>
                                    <option value="dessert">Dessert</option>
                                    <option value="appetizer">Appetizer</option>
                                    <option value="salad">Salad</option>
                                    <option value="bread">Bread</option>
                                    <option value="breakfast">Breakfast</option>
                                    <option value="soup">Soup</option>
                                    <option value="beverage">Beverage</option>
                                    <option value="sauce">Sauce</option>
                                    <option value="snack">Snack</option>
                                </select>
                            </div>

                            {/* Clear Filters */}
                            <div className="flex items-end">
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="btn-secondary w-full"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-8">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Loading */}
                {loading && <Loading message="Searching recipes..." />}

                {/* Results */}
                {!loading && searched && (
                    <>
                        {results.length > 0 ? (
                            <>
                                <div className="mb-4 text-gray-600 dark:text-gray-400">
                                    Found {results.length} recipe{results.length !== 1 ? 's' : ''}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {results.map((recipe) => (
                                        <div key={recipe.id} className="card overflow-hidden">
                                            {/* Recipe Image */}
                                            <div className="relative h-48 overflow-hidden">
                                                <img
                                                    src={recipe.image || '/placeholder-recipe.jpg'}
                                                    alt={recipe.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                {recipe.isVeg && (
                                                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                                        🥗 Veg
                                                    </div>
                                                )}
                                            </div>

                                            {/* Recipe Info */}
                                            <div className="p-4">
                                                <h3 className="text-xl font-bold mb-2 line-clamp-2">
                                                    {recipe.title}
                                                </h3>

                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {recipe.cuisine && (
                                                        <span className="badge bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                                                            {recipe.cuisine}
                                                        </span>
                                                    )}
                                                    {recipe.category && (
                                                        <span className="badge bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                                            {recipe.category}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                    <span>⏱️ {recipe.cookingTime} min</span>
                                                    <span>🍽️ {recipe.servings} servings</span>
                                                </div>

                                                {recipe.healthScore && (
                                                    <div className="mb-3">
                                                        <div className="flex items-center justify-between text-xs mb-1">
                                                            <span>Health Score</span>
                                                            <span className="font-semibold">{recipe.healthScore}/100</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                            <div
                                                                className="bg-green-500 h-2 rounded-full"
                                                                style={{ width: `${recipe.healthScore}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}

                                                <Link
                                                    to={`/spoonacular/${recipe.id}`}
                                                    className="btn-primary w-full text-center block"
                                                >
                                                    View Full Recipe →
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 card">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-2xl font-bold mb-2">No recipes found</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Try different keywords or adjust your filters
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* Initial State */}
                {!loading && !searched && (
                    <div className="text-center py-12 card">
                        <div className="text-6xl mb-4">🔎</div>
                        <h3 className="text-2xl font-bold mb-2">Start Searching!</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Enter a keyword above to find recipes from around the world
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <button
                                onClick={() => { setSearchQuery('pasta'); handleSearch({ preventDefault: () => { } }); }}
                                className="btn-outline"
                            >
                                Try "pasta"
                            </button>
                            <button
                                onClick={() => { setSearchQuery('chicken curry'); handleSearch({ preventDefault: () => { } }); }}
                                className="btn-outline"
                            >
                                Try "chicken curry"
                            </button>
                            <button
                                onClick={() => { setSearchQuery('chocolate cake'); handleSearch({ preventDefault: () => { } }); }}
                                className="btn-outline"
                            >
                                Try "chocolate cake"
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
