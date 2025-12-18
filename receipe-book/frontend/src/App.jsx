import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ShoppingProvider } from './context/ShoppingContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import AddRecipe from './pages/AddRecipe';
import Favorites from './pages/Favorites';
import Search from './pages/Search';
import SpoonacularRecipeDetail from './pages/SpoonacularRecipeDetail';
import Profile from './pages/Profile';
import ShoppingList from './pages/ShoppingList';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <ShoppingProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/recipes/:id" element={<RecipeDetail />} />
              <Route path="/recipes/:id/edit" element={<AddRecipe />} />
              <Route path="/add-recipe" element={<AddRecipe />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/search" element={<Search />} />
              <Route path="/spoonacular/:id" element={<SpoonacularRecipeDetail />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/shopping-list" element={<ShoppingList />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-3 font-bold text-lg dark:text-white">
                    <span className="text-2xl">👨‍🍳</span> Cookify
                  </div>
                  <p className="text-gray-500 text-sm">
                    © {new Date().getFullYear()} Cookify. A community-driven recipe platform.
                  </p>
                  <p className="text-xs mt-2">
                    Built with React, Node.js, Express & MongoDB
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </ShoppingProvider>
    </AuthProvider>
  );
}

export default App;
