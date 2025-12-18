# 🇮🇳 Indian Recipe App - Transformation Guide

## ✅ Changes Made

### 1. **Backend - Recipe Model** ✅
Added `isVeg` field to Recipe schema:
```javascript
isVeg: {
    type: Boolean,
    default: true
}
```

### 2. **Frontend - Navbar** ✅
- Changed logo from 🍳 to 🍛 (Indian food)
- Changed title from "Recipe Book" to "Indian Recipes"
- Added **Swiggy-style Veg/Non-Veg toggle button**
  - Green dot for Veg
  - Red dot for Non-Veg/All
  - Stores preference in localStorage
  - Triggers custom event for other components

---

## 📝 Remaining Changes Needed

### 3. **Update Recipes Page** (You need to do this)

File: `frontend/src/pages/Recipes.jsx`

Add this code after line 18 (after state declarations):

```javascript
const [vegOnly, setVegOnly] = useState(false);

useEffect(() => {
  // Listen for veg filter changes from navbar
  const handleVegFilterChange = (e) => {
    setVegOnly(e.detail);
    setPage(1); // Reset to first page
  };

  // Get initial value
  const initialVegFilter = localStorage.getItem('vegFilter') === 'true';
  setVegOnly(initialVegFilter);

  window.addEventListener('vegFilterChanged', handleVegFilterChange);
  return () => window.removeEventListener('vegFilterChanged', handleVegFilterChange);
}, []);
```

Then update the `fetchRecipes` function to include veg filter:

```javascript
const params = {
  page,
  limit: 12,
  ...(search && { search }),
  ...(category && { category }),
  ...(difficulty && { difficulty }),
  ...(sort && { sort }),
  ...(vegOnly && { isVeg: true }) // Add this line
};
```

### 4. **Update Backend Routes** (You need to do this)

File: `backend/routes/recipes.js`

In the `GET /api/recipes` route (around line 18), add veg filter:

```javascript
// Filter by isVeg
if (req.query.isVeg) {
  query.isVeg = req.query.isVeg === 'true';
}
```

### 5. **Update Seed Script** (Important!)

File: `backend/scripts/seedDatabase.js`

Replace the CATEGORIES array (line 8) with Indian categories:

```javascript
const CATEGORIES = ['Vegetarian', 'Chicken', 'Dessert', 'Lamb', 'Pasta', 'Seafood', 'Breakfast'];
```

And add logic to set `isVeg` based on category:

```javascript
// After creating recipe object (around line 70), add:
const recipe = {
  title: mealDetail.strMeal,
  ingredients,
  steps: steps.length > 0 ? steps : [instructions],
  category: mealDetail.strCategory || category,
  cuisine: mealDetail.strArea || 'Indian', // Change to Indian
  cookingTime: Math.floor(Math.random() * 60) + 30,
  difficulty,
  image: mealDetail.strMealThumb || '',
  source: 'themealdb',
  tags: [mealDetail.strCategory, mealDetail.strArea].filter(Boolean),
  servings: 4,
  // Add this line:
  isVeg: !['Chicken', 'Lamb', 'Seafood', 'Beef', 'Pork', 'Goat'].includes(mealDetail.strCategory)
};
```

### 6. **Update RecipeCard Component**

File: `frontend/src/components/RecipeCard.jsx`

Add Veg/Non-Veg indicator. After the difficulty badge (around line 50), add:

```jsx
{/* Veg/Non-Veg Indicator */}
<div className="absolute top-3 left-3">
  <div className={`w-6 h-6 border-2 flex items-center justify-center bg-white ${
    recipe.isVeg ? 'border-green-600' : 'border-red-600'
  }`}>
    <div className={`w-3 h-3 rounded-full ${
      recipe.isVeg ? 'bg-green-600' : 'bg-red-600'
    }`}></div>
  </div>
</div>
```

### 7. **Update AddRecipe Form**

File: `frontend/src/pages/AddRecipe.jsx`

Add isVeg checkbox in the form (after difficulty field, around line 150):

```jsx
<div>
  <label className="flex items-center space-x-2 cursor-pointer">
    <input
      type="checkbox"
      checked={formData.isVeg}
      onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
    />
    <span className="label">Vegetarian Recipe</span>
    <div className={`w-5 h-5 border-2 flex items-center justify-center ${
      formData.isVeg ? 'border-green-600' : 'border-red-600'
    }`}>
      <div className={`w-2.5 h-2.5 rounded-full ${
        formData.isVeg ? 'bg-green-600' : 'bg-red-600'
      }`}></div>
    </div>
  </label>
</div>
```

And add `isVeg: true` to initial formData state.

### 8. **Update Home Page**

File: `frontend/src/pages/Home.jsx`

Change the category emojis to Indian style (around line 120):

```javascript
const getCategoryEmoji = (category) => {
  const emojis = {
    'Vegetarian': '🥗',
    'Chicken': '🍗',
    'Dessert': '🍰',
    'Lamb': '🍖',
    'Pasta': '🍝',
    'Seafood': '🦐',
    'Breakfast': '🍳',
    'Paneer': '🧈',
    'Dal': '🍲',
    'Rice': '🍚',
    'Roti': '🫓',
    'Biryani': '🍛',
    'Curry': '🍛'
  };
  return emojis[category] || '🍽️';
};
```

---

## 🗑️ Remove Foreign Categories

### 9. **Clean Database**

Run this in MongoDB:

```javascript
// Remove recipes with foreign meat categories
db.recipes.deleteMany({
  category: { $in: ['Beef', 'Pork', 'Goat'] }
});

// Update remaining recipes to Indian cuisine
db.recipes.updateMany(
  {},
  { $set: { cuisine: 'Indian' } }
);
```

### 10. **Re-seed with Indian Categories**

After making changes to seed script:

```bash
cd backend
npm run seed
```

---

## 🎨 UI Enhancements

### Veg/Non-Veg Indicator Style

The toggle button uses:
- **Green** square with green dot = Vegetarian
- **Red** square with red dot = Non-Vegetarian
- Exactly like Swiggy's design!

---

## 🚀 Quick Implementation Steps

1. ✅ Backend model updated (DONE)
2. ✅ Navbar updated with toggle (DONE)
3. ⏳ Update Recipes.jsx (see section 3)
4. ⏳ Update backend routes (see section 4)
5. ⏳ Update seed script (see section 5)
6. ⏳ Update RecipeCard (see section 6)
7. ⏳ Update AddRecipe form (see section 7)
8. ⏳ Update Home page (see section 8)
9. ⏳ Clean database (see section 9)
10. ⏳ Re-seed database (see section 10)

---

## 📸 Expected Result

- Navbar shows **🍛 Indian Recipes**
- Veg/Non-Veg toggle button (Swiggy style)
- All recipes show green/red dot indicator
- Filter works instantly
- No foreign meat categories (Beef, Pork, Goat)
- Indian-focused categories

---

Would you like me to implement the remaining changes automatically?
