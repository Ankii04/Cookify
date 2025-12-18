# 🌍 International Recipe App with Veg/Non-Veg Filter - COMPLETE GUIDE

## ✅ COMPLETED CHANGES

### 1. Backend Model ✅
- Added `isVeg` boolean field to Recipe schema
- Default value: `true`

### 2. Backend API Routes ✅
- Added `isVeg` filter support in GET /api/recipes
- Added `isVeg` field to POST /api/recipes (create)
- Added `isVeg` field to PUT /api/recipes/:id (update)

### 3. Navbar Component ✅
- Changed logo: 🍳 → 🍛
- Changed title: "Recipe Book" → "Indian Recipes"
- Added Swiggy-style Veg/Non-Veg toggle button
- Green dot (🟢) for Veg
- Red dot (🔴) for Non-Veg/All
- localStorage persistence
- Custom event broadcasting

---

## 📝 REMAINING FRONTEND CHANGES

Copy and paste these code snippets:

### 1. Update Recipes.jsx

Add after line 18 (state declarations):

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

Update `fetchRecipes` function (around line 45):

```javascript
const params = {
  page,
  limit: 12,
  ...(search && { search }),
  ...(category && { category }),
  ...(difficulty && { difficulty }),
  ...(sort && { sort }),
  ...(vegOnly && { isVeg: true })  // ADD THIS LINE
};
```

### 2. Update RecipeCard.jsx

Add Veg/Non-Veg indicator after line 40 (inside the image div):

```jsx
{/* Veg/Non-Veg Indicator */}
<div className="absolute top-3 left-3">
  <div className={`w-6 h-6 border-2 flex items-center justify-center bg-white rounded ${
    recipe.isVeg ? 'border-green-600' : 'border-red-600'
  }`}>
    <div className={`w-3 h-3 rounded-full ${
      recipe.isVeg ? 'bg-green-600' : 'bg-red-600'
    }`}></div>
  </div>
</div>
```

### 3. Update AddRecipe.jsx

Add to initial formData state (around line 20):

```javascript
const [formData, setFormData] = useState({
  title: '',
  category: '',
  cuisine: '',
  cookingTime: '',
  difficulty: 'Medium',
  servings: '4',
  ingredients: [{ name: '', measure: '' }],
  steps: [''],
  tags: [],
  isVeg: true  // ADD THIS LINE
});
```

Add checkbox in form (after servings field, around line 180):

```jsx
<div>
  <label className="flex items-center space-x-3 cursor-pointer">
    <input
      type="checkbox"
      checked={formData.isVeg}
      onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
    />
    <span className="label">Vegetarian Recipe</span>
    <div className={`w-6 h-6 border-2 flex items-center justify-center rounded ${
      formData.isVeg ? 'border-green-600' : 'border-red-600'
    }`}>
      <div className={`w-3 h-3 rounded-full ${
        formData.isVeg ? 'bg-green-600' : 'bg-red-600'
      }`}></div>
    </div>
  </label>
</div>
```

Update handleSubmit (around line 145):

```javascript
data.append('isVeg', formData.isVeg);  // ADD THIS LINE
```

### 4. Update RecipeDetail.jsx

Add Veg/Non-Veg indicator in recipe details (after servings, around line 120):

```jsx
<span className="flex items-center">
  <div className={`w-5 h-5 border-2 flex items-center justify-center mr-2 rounded ${
    recipe.isVeg ? 'border-green-600' : 'border-red-600'
  }`}>
    <div className={`w-2.5 h-2.5 rounded-full ${
      recipe.isVeg ? 'bg-green-600' : 'bg-red-600'
    }`}></div>
  </div>
  {recipe.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
</span>
```

---

## 🗄️ DATABASE UPDATE

### Update Existing Recipes

Run this MongoDB command to set isVeg for existing recipes:

```javascript
// Mark vegetarian recipes
db.recipes.updateMany(
  { category: { $in: ['Vegetarian', 'Dessert', 'Pasta', 'Breakfast'] } },
  { $set: { isVeg: true } }
);

// Mark non-vegetarian recipes
db.recipes.updateMany(
  { category: { $in: ['Chicken', 'Lamb', 'Seafood', 'Beef', 'Pork', 'Goat'] } },
  { $set: { isVeg: false } }
);
```

### Optional: Rename Categories (Remove Animal Names)

```javascript
// Rename categories to be more generic
db.recipes.updateMany(
  { category: 'Beef' },
  { $set: { category: 'Non-Veg', isVeg: false } }
);

db.recipes.updateMany(
  { category: 'Pork' },
  { $set: { category: 'Non-Veg', isVeg: false } }
);

db.recipes.updateMany(
  { category: 'Goat' },
  { $set: { category: 'Non-Veg', isVeg: false } }
);

db.recipes.updateMany(
  { category: 'Lamb' },
  { $set: { category: 'Non-Veg', isVeg: false } }
);

db.recipes.updateMany(
  { category: 'Chicken' },
  { $set: { category: 'Chicken Dishes', isVeg: false } }
);
```

---

## 🎨 VISUAL RESULT

### Veg/Non-Veg Toggle (Navbar)
```
[🟢 Veg]  ← When clicked, shows only vegetarian recipes
[🔴 All]  ← Shows all recipes
```

### Recipe Cards
```
┌─────────────────┐
│ 🟢              │ ← Green dot for Veg
│   Recipe Image  │
│                 │
└─────────────────┘

┌─────────────────┐
│ 🔴              │ ← Red dot for Non-Veg
│   Recipe Image  │
│                 │
└─────────────────┘
```

---

## 🚀 TESTING

1. Click Veg toggle in navbar
2. Should show only vegetarian recipes
3. Click again to show all recipes
4. Add new recipe with Veg checkbox
5. See green/red dot on recipe cards

---

## 📊 SUMMARY

✅ Backend: isVeg field added to model and routes
✅ Navbar: Swiggy-style toggle implemented
⏳ Recipes Page: Need to add veg filter logic
⏳ Recipe Card: Need to add veg/non-veg indicator
⏳ Add Recipe: Need to add veg checkbox
⏳ Recipe Detail: Need to show veg status
⏳ Database: Need to update existing recipes

---

**All code snippets are ready to copy-paste!** 🎉

Just update the 4 frontend files and run the MongoDB commands.
