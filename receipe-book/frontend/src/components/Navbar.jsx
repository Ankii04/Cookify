import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShopping } from '../context/ShoppingContext';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { items } = useShopping();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [vegFilter, setVegFilter] = useState('all'); // 'all', 'veg', 'non-veg'

    useEffect(() => {
        const isDark = localStorage.getItem('darkMode') === 'true';
        setDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
        }

        // Get veg filter from localStorage
        const savedFilter = localStorage.getItem('vegFilter') || 'all';
        setVegFilter(savedFilter);
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode);
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const toggleVegFilter = () => {
        // Cycle through: all -> veg -> non-veg -> all
        let newFilter;
        if (vegFilter === 'all') {
            newFilter = 'veg';
        } else if (vegFilter === 'veg') {
            newFilter = 'non-veg';
        } else {
            newFilter = 'all';
        }

        setVegFilter(newFilter);
        localStorage.setItem('vegFilter', newFilter);

        // Trigger custom event for other components to listen
        window.dispatchEvent(new CustomEvent('vegFilterChanged', { detail: newFilter }));
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center group">
                        <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg group-hover:shadow-orange-500/50 group-hover:scale-110 transition-all duration-300 mr-3">
                            <span className="text-2xl transform group-hover:rotate-12 transition-transform">👨‍🍳</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black tracking-tight leading-none bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-500 bg-clip-text text-transparent">
                                Cookify
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 dark:text-gray-400 leading-tight">
                                Taste the World
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link
                            to="/"
                            className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            to="/recipes"
                            className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                            Recipes
                        </Link>
                        <Link
                            to="/search"
                            className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                            🔍 Search
                        </Link>
                        {isAuthenticated && (
                            <>
                                <Link
                                    to="/add-recipe"
                                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                >
                                    Add Recipe
                                </Link>
                                <Link
                                    to="/favorites"
                                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                >
                                    Favorites
                                </Link>
                                <Link
                                    to="/shopping-list"
                                    className="relative text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1"
                                >
                                    🛒 List
                                    {items.length > 0 && (
                                        <span className="absolute -top-2 -right-3 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                                            {items.length}
                                        </span>
                                    )}
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Right side buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* Veg/Non-Veg Toggle (3-way) */}
                        <button
                            onClick={toggleVegFilter}
                            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg border-2 font-medium transition-all w-36 justify-center ${vegFilter === 'veg'
                                ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                : vegFilter === 'non-veg'
                                    ? 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                    : 'border-gray-400 bg-gray-50 dark:bg-gray-700/20 text-gray-700 dark:text-gray-300'
                                }`}
                            title={vegFilter === 'veg' ? 'Showing Veg Only' : vegFilter === 'non-veg' ? 'Showing Non-Veg Only' : 'Showing All Recipes'}
                        >
                            <div className={`w-5 h-5 border-2 flex-shrink-0 flex items-center justify-center ${vegFilter === 'veg' ? 'border-green-600' : vegFilter === 'non-veg' ? 'border-red-600' : 'border-gray-400'
                                }`}>
                                <div className={`w-2.5 h-2.5 rounded-full ${vegFilter === 'veg' ? 'bg-green-600' : vegFilter === 'non-veg' ? 'bg-red-600' : 'bg-gray-400'
                                    }`}></div>
                            </div>
                            <span className="font-semibold whitespace-nowrap">
                                {vegFilter === 'veg' ? 'Veg Only' : vegFilter === 'non-veg' ? 'Non-Veg' : 'All'}
                            </span>
                        </button>

                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>

                        {isAuthenticated ? (
                            <>
                                <Link
                                    to={`/profile/${user._id}`}
                                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                >
                                    {user.name}
                                </Link>
                                <button onClick={handleLogout} className="btn-primary">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-secondary">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {mobileMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700">
                    <div className="px-4 py-3 space-y-3">
                        {/* Veg Toggle Mobile */}
                        <button
                            onClick={toggleVegFilter}
                            className={`w-full flex items-center justify-between px-4 py-2 rounded-lg border-2 transition-all ${vegFilter === 'veg'
                                ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                                : vegFilter === 'non-veg'
                                    ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}
                        >
                            <span className="text-sm font-medium">
                                {vegFilter === 'veg' ? 'Veg Only' : vegFilter === 'non-veg' ? 'Non-Veg' : 'All Recipes'}
                            </span>
                            <div className={`w-4 h-4 border-2 flex items-center justify-center ${vegFilter === 'veg' ? 'border-green-600' : vegFilter === 'non-veg' ? 'border-red-600' : 'border-gray-400'
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${vegFilter === 'veg' ? 'bg-green-600' : vegFilter === 'non-veg' ? 'bg-red-600' : 'bg-gray-400'
                                    }`}></div>
                            </div>
                        </button>

                        <Link
                            to="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                            Home
                        </Link>
                        <Link
                            to="/recipes"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                            Recipes
                        </Link>
                        <Link
                            to="/search"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                            🔍 Search
                        </Link>
                        {isAuthenticated && (
                            <>
                                <Link
                                    to="/add-recipe"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                                >
                                    Add Recipe
                                </Link>
                                <Link
                                    to="/favorites"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                                >
                                    Favorites
                                </Link>
                                <Link
                                    to="/shopping-list"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                                >
                                    <span>🛒 Shopping List</span>
                                    {items.length > 0 && (
                                        <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            {items.length}
                                        </span>
                                    )}
                                </Link>
                                <Link
                                    to={`/profile/${user._id}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                                >
                                    Profile
                                </Link>
                            </>
                        )}
                        <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                            >
                                {darkMode ? '☀️' : '🌙'}
                            </button>
                            {isAuthenticated ? (
                                <button onClick={handleLogout} className="btn-primary">
                                    Logout
                                </button>
                            ) : (
                                <div className="space-x-2">
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="btn-secondary"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="btn-primary"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
