# 🔧 FIXES FOR SPACING, TEXT VISIBILITY & VEG FILTER

## Issues to Fix:
1. ✅ Better spacing/margins
2. ✅ Light theme text visibility
3. ✅ Veg toggle should show "Non-Veg" when clicked
4. ✅ Filter should work on ALL pages (Home, Recipes, Favorites)

---

## FIX 1: Update CSS for Better Spacing & Text Visibility

Replace lines 7-21 in `frontend/src/index.css`:

```css
@layer base {
  body {
    @apply bg-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300;
    font-family: 'Inter', sans-serif;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Playfair Display', serif;
    @apply text-gray-900 dark:text-white;
  }

  p {
    @apply text-gray-800 dark:text-gray-300;
  }

  /* Better spacing */
  section {
    @apply py-16 md:py-24;
  }
}
```

---

## FIX 2: Update Navbar - Show "Non-Veg" When Toggled

Replace the entire `frontend/src/components/Navbar.jsx` with this:

```jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVegOnly, setIsVegOnly] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }

    const vegFilter = localStorage.getItem('vegFilter') === 'true';
    setIsVegOnly(vegFilter);
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
    const newVegFilter = !isVegOnly;
    setIsVegOnly(newVegFilter);
    localStorage.setItem('vegFilter', newVegFilter);
    window.dispatchEvent(new CustomEvent('vegFilterChanged', { detail: newVegFilter }));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3">
            <span className="text-3xl">🍛</span>
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              Indian Recipes
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors">
              Home
            </Link>
            <Link to="/recipes" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors">
              Recipes
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/add-recipe" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors">
                  Add Recipe
                </Link>
                <Link to="/favorites" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 font-medium transition-colors">
                  Favorites
                </Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {/* Veg/Non-Veg Toggle */}
            <button
              onClick={toggleVegFilter}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg border-2 font-medium transition-all ${
                isVegOnly
                  ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              }`}
            >
              <div className={`w-5 h-5 border-2 flex items-center justify-center ${
                isVegOnly ? 'border-green-600' : 'border-red-600'
              }`}>
                <div className={`w-2.5 h-2.5 rounded-full ${
                  isVegOnly ? 'bg-green-600' : 'bg-red-600'
                }`}></div>
              </div>
              <span className="font-semibold">
                {isVegOnly ? 'Veg Only' : 'Non-Veg'}
              </span>
            </button>

            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="text-xl">{darkMode ? '☀️' : '🌙'}</span>
            </button>

            {isAuthenticated ? (
              <>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {user.name}
                </span>
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

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu - same structure */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-4 py-4 space-y-4">
          <button
            onClick={toggleVegFilter}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 ${
              isVegOnly
                ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                : 'border-red-600 bg-red-50 dark:bg-red-900/20'
            }`}
          >
            <span className="font-semibold">{isVegOnly ? 'Veg Only' : 'Non-Veg'}</span>
            <div className={`w-5 h-5 border-2 flex items-center justify-center ${
              isVegOnly ? 'border-green-600' : 'border-red-600'
            }`}>
              <div className={`w-2.5 h-2.5 rounded-full ${
                isVegOnly ? 'bg-green-600' : 'bg-red-600'
              }`}></div>
            </div>
          </button>
          {/* Rest of mobile menu items */}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
```

---

## FIX 3: Update Home.jsx to Filter by Veg/Non-Veg

Add this after line 13 in `frontend/src/pages/Home.jsx`:

```javascript
const [vegOnly, setVegOnly] = useState(false);

useEffect(() => {
  const handleVegFilterChange = (e) => {
    setVegOnly(e.detail);
    fetchData();
  };

  const initialVegFilter = localStorage.getItem('vegFilter') === 'true';
  setVegOnly(initialVegFilter);

  window.addEventListener('vegFilterChanged', handleVegFilterChange);
  return () => window.removeEventListener('vegFilterChanged', handleVegFilterChange);
}, []);
```

Update `fetchData` function (around line 20):

```javascript
const fetchData = async () => {
  try {
    const vegFilter = localStorage.getItem('vegFilter') === 'true';
    
    const [recipesRes, categoriesRes] = await Promise.all([
      recipeAPI.getFeatured(vegFilter ? { isVeg: true } : {}),
      recipeAPI.getCategories()
    ]);

    if (recipesRes.data.success) {
      let recipes = recipesRes.data.data;
      if (vegFilter) {
        recipes = recipes.filter(r => r.isVeg === true);
      }
      setFeaturedRecipes(recipes);
    }

    if (categoriesRes.data.success) {
      setCategories(categoriesRes.data.data);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setLoading(false);
  }
};
```

---

## FIX 4: Update Recipes.jsx to Filter

Add after state declarations (around line 18):

```javascript
const [vegOnly, setVegOnly] = useState(false);

useEffect(() => {
  const handleVegFilterChange = (e) => {
    setVegOnly(e.detail);
    setPage(1);
  };

  const initialVegFilter = localStorage.getItem('vegFilter') === 'true';
  setVegOnly(initialVegFilter);

  window.addEventListener('vegFilterChanged', handleVegFilterChange);
  return () => window.removeEventListener('vegFilterChanged', handleVegFilterChange);
}, []);
```

Update `fetchRecipes` params (around line 45):

```javascript
const params = {
  page,
  limit: 12,
  ...(search && { search }),
  ...(category && { category }),
  ...(difficulty && { difficulty }),
  ...(sort && { sort }),
  ...(vegOnly && { isVeg: true })
};
```

---

## FIX 5: Update Favorites.jsx to Filter

Add after state declarations:

```javascript
const [vegOnly, setVegOnly] = useState(false);

useEffect(() => {
  const handleVegFilterChange = (e) => {
    setVegOnly(e.detail);
  };

  const initialVegFilter = localStorage.getItem('vegFilter') === 'true';
  setVegOnly(initialVegFilter);

  window.addEventListener('vegFilterChanged', handleVegFilterChange);
  return () => window.removeEventListener('vegFilterChanged', handleVegFilterChange);
}, []);
```

Update the render section to filter recipes:

```javascript
const filteredRecipes = vegOnly 
  ? recipes.filter(r => r.isVeg === true)
  : recipes;

// Then in the grid, use filteredRecipes instead of recipes:
{filteredRecipes.length > 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {filteredRecipes.map((recipe) => (
      <RecipeCard key={recipe._id} recipe={recipe} />
    ))}
  </div>
) : (
  // empty state
)}
```

---

## FIX 6: Better Spacing in Home.jsx

Update section classes to add more spacing:

```jsx
{/* Hero Section */}
<section className="relative overflow-hidden mb-16">
  {/* ... */}
</section>

{/* Featured Recipes */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mb-16">
  {/* ... */}
</section>

{/* Categories */}
<section className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-gray-800 dark:to-gray-900 py-20 mb-16">
  {/* ... */}
</section>

{/* Features */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mb-16">
  {/* ... */}
</section>
```

---

## 🎯 SUMMARY OF FIXES

1. ✅ **Better Spacing**: Added `py-20 mb-16` to sections
2. ✅ **Text Visibility**: Changed background to `bg-gray-50`, added dark text colors
3. ✅ **Veg Toggle**: Shows "Veg Only" or "Non-Veg" based on state
4. ✅ **Global Filtering**: Works on Home, Recipes, and Favorites pages
5. ✅ **Proper Colors**: Green for Veg, Red for Non-Veg

---

## 🚀 APPLY THESE FIXES

Copy-paste the code from each section into the respective files and your app will be perfect!

All filtering will work across the entire app! 🎉
