import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { recipeAPI } from '../utils/api';
import RecipeCard from '../components/RecipeCard';
import { SkeletonCard } from '../components/Skeletons';
import { motion, AnimatePresence } from 'framer-motion';

const Recipes = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [recipes, setRecipes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});

    // Filters
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [cuisine, setCuisine] = useState(searchParams.get('cuisine') || '');
    const [isVeg, setIsVeg] = useState(searchParams.get('isVeg') || '');
    const [cuisines, setCuisines] = useState([]);
    const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
    const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

    useEffect(() => {
        // Get initial veg filter from localStorage
        const vegFilter = localStorage.getItem('vegFilter') || 'all';
        if (vegFilter === 'veg') {
            setIsVeg('true');
        } else if (vegFilter === 'non-veg') {
            setIsVeg('false');
        } else {
            setIsVeg('');
        }

        // Listen for veg filter changes from navbar
        const handleVegFilterChange = (event) => {
            if (event.detail === 'veg') {
                setIsVeg('true');
            } else if (event.detail === 'non-veg') {
                setIsVeg('false');
            } else {
                setIsVeg('');
            }
        };

        window.addEventListener('vegFilterChanged', handleVegFilterChange);

        return () => {
            window.removeEventListener('vegFilterChanged', handleVegFilterChange);
        };
    }, []);

    useEffect(() => {
        fetchRecipes();
    }, [search, category, cuisine, isVeg, sort, page]);

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [categoriesRes, cuisinesRes] = await Promise.all([
                    recipeAPI.getCategories(),
                    recipeAPI.getCuisines()
                ]);

                if (categoriesRes.data.success) {
                    setCategories(categoriesRes.data.data);
                }
                if (cuisinesRes.data.success) {
                    setCuisines(cuisinesRes.data.data);
                }
            } catch (err) {
                console.error('Error fetching filters:', err);
            }
        };
        fetchFilters();
    }, []);

    const fetchRecipes = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 12,
                ...(search && { search }),
                ...(category && { category }),
                ...(cuisine && { cuisine }),
                ...(isVeg && { isVeg }),
                ...(sort && { sort })
            };

            // Update URL params
            const newParams = {};
            Object.keys(params).forEach(key => {
                if (params[key]) newParams[key] = params[key];
            });
            setSearchParams(newParams);

            const response = await recipeAPI.getAll(params);
            if (response.data.success) {
                setRecipes(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching recipes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchRecipes();
    };

    const handleFilterChange = (filterType, value) => {
        setPage(1);
        switch (filterType) {
            case 'category':
                setCategory(value);
                break;
            case 'cuisine':
                setCuisine(value);
                break;
            case 'isVeg':
                setIsVeg(value);
                break;
            case 'sort':
                setSort(value);
                break;
            default:
                break;
        }
    };

    const clearFilters = () => {
        setSearch('');
        setCategory('');
        setCuisine('');
        setIsVeg('');
        setSort('newest');
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold mb-8">All Recipes</h1>

                {/* Search and Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                    {/* Search Bar */}
                    <form onSubmit={handleSearchSubmit} className="mb-6">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Search recipes..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-field flex-1"
                            />
                            <button type="submit" className="btn-primary">
                                Search
                            </button>
                        </div>
                    </form>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Category Filter */}
                        <div>
                            <label className="label">Category</label>
                            <select
                                value={category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="input-field"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="label">Sort By</label>
                            <select
                                value={sort}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                                className="input-field"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="rating">Highest Rated</option>
                            </select>
                        </div>

                        {/* Cuisine Filter */}
                        <div>
                            <label className="label">Cuisine</label>
                            <select
                                value={cuisine}
                                onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                                className="input-field"
                            >
                                <option value="">All Cuisines</option>
                                {cuisines.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Filters */}
                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="btn-secondary w-full"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : recipes.length > 0 ? (
                    <>
                        <div className="mb-6 flex justify-between items-center">
                            <span className="text-gray-500 font-medium">Found {pagination.total} recipes</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {recipes.map((recipe, index) => (
                                <motion.div
                                    key={recipe._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: (index % 6) * 0.1 }}
                                    className="h-full"
                                >
                                    <RecipeCard recipe={recipe} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                    className="btn-secondary disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                <div className="flex items-center gap-1 md:gap-2">
                                    {/* Pagination Logic */}
                                    {(() => {
                                        const pages = [];
                                        const totalPages = pagination.pages;
                                        const current = page;
                                        const delta = 1; // Number of pages to show before and after current

                                        for (let i = 1; i <= totalPages; i++) {
                                            if (
                                                i === 1 || // Always show first
                                                i === totalPages || // Always show last
                                                (i >= current - delta && i <= current + delta) // Show neighbors
                                            ) {
                                                pages.push(i);
                                            } else if (
                                                (i === current - delta - 1) ||
                                                (i === current + delta + 1)
                                            ) {
                                                pages.push('...');
                                            }
                                        }

                                        // Remove consecutive dots
                                        const filteredPages = pages.filter((item, index) => {
                                            return item !== '...' || pages[index - 1] !== '...';
                                        });

                                        return filteredPages.map((p, i) => (
                                            p === '...' ? (
                                                <span key={`dots-${i}`} className="px-2 text-gray-400">...</span>
                                            ) : (
                                                <button
                                                    key={p}
                                                    onClick={() => setPage(p)}
                                                    className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all duration-300 ${page === p
                                                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-110'
                                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                                        }`}
                                                >
                                                    {p}
                                                </button>
                                            )
                                        ));
                                    })()}
                                </div>

                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === pagination.pages}
                                    className="btn-secondary disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            No recipes found. Try adjusting your filters.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recipes;
