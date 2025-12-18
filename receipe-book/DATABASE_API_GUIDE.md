# 🔄 Database Management & API Guide

## 📚 How to Delete Existing Recipes and Re-seed

### **Step 1: Clear the Database**
```bash
cd backend
npm run clear
```

**What it does:**
- Connects to MongoDB
- Counts existing recipes
- Deletes ALL recipes from the database
- Shows confirmation message

**Output:**
```
🗑️  Starting database cleanup...
✅ Connected to MongoDB
📊 Found 92 recipes in database
⚠️  This will delete ALL recipes from the database!
✅ Successfully deleted 92 recipes!
🎉 Database cleanup completed!
```

### **Step 2: Seed with Fresh Data**
```bash
npm run seed
```

**What it does:**
- Fetches recipes from TheMealDB (always)
- Fetches recipes from Spoonacular (if API key configured)
- Saves all recipes to MongoDB
- Shows detailed summary

---

## 🔷 How TheMealDB API Works

### **API Endpoint Structure:**

**1. Filter by Category:**
```
https://www.themealdb.com/api/json/v1/1/filter.php?c=Chicken
```
- Returns list of recipes in "Chicken" category
- Only gives basic info (id, name, thumbnail)

**2. Get Recipe Details:**
```
https://www.themealdb.com/api/json/v1/1/lookup.php?i=52772
```
- Returns full recipe details for specific ID
- Includes ingredients, instructions, cuisine, etc.

### **Categories Available:**
- Beef
- Chicken
- Dessert
- Lamb
- Pasta
- Pork
- Seafood
- Vegetarian
- Breakfast
- Goat
- Side
- Starter
- Vegan

### **What We Fetch:**
```javascript
// For each category:
1. Get list of recipes in category (filter.php)
2. For each recipe (first 10):
   - Get detailed information (lookup.php)
   - Parse ingredients (up to 20)
   - Parse cooking steps
   - Determine difficulty
   - Detect if vegetarian
   - Save to database
```

### **Data Transformation:**
```javascript
TheMealDB Response → Our Database Format

{
  strMeal: "Chicken Curry"          → title: "Chicken Curry"
  strIngredient1: "Chicken"         → ingredients: [{name: "Chicken", measure: "500g"}]
  strInstructions: "Step 1..."      → steps: ["Step 1...", "Step 2..."]
  strCategory: "Chicken"            → category: "Chicken"
  strArea: "Indian"                 → cuisine: "Indian"
  strMealThumb: "image.jpg"         → image: "image.jpg"
  (calculated)                      → isVeg: false (based on category)
}
```

---

## 🔶 How Spoonacular API Works

### **API Endpoint Structure:**

**1. Complex Search (What We Use):**
```
https://api.spoonacular.com/recipes/complexSearch?
  apiKey=YOUR_KEY
  &cuisine=Indian
  &number=5
  &addRecipeInformation=true
  &fillIngredients=true
```

**Parameters:**
- `cuisine`: Filter by cuisine type
- `number`: How many recipes to return
- `addRecipeInformation`: Include full recipe details
- `fillIngredients`: Include ingredient information

### **Cuisines We Fetch:**
- Indian
- Italian
- Chinese
- Mexican
- Thai
- Japanese
- American
- Mediterranean

### **What We Get:**
```javascript
// For each cuisine:
1. Search for 5 recipes in that cuisine
2. API returns complete recipe data in one call
3. Extract:
   - Title
   - Ingredients (with measurements)
   - Step-by-step instructions
   - Cooking time (actual from API)
   - Vegetarian status (from API)
   - Dish types (dessert, breakfast, etc.)
   - Servings
```

### **Data Transformation:**
```javascript
Spoonacular Response → Our Database Format

{
  title: "Chicken Tikka"            → title: "Chicken Tikka"
  extendedIngredients: [...]        → ingredients: [{name: "...", measure: "..."}]
  analyzedInstructions: [...]       → steps: ["Step 1...", "Step 2..."]
  dishTypes: ["main course"]        → category: "Main Course"
  (from search param)               → cuisine: "Indian"
  readyInMinutes: 45                → cookingTime: 45
  vegetarian: false                 → isVeg: false
  servings: 4                       → servings: 4
}
```

### **Rate Limiting:**
```javascript
// Free tier: 150 requests/day
// Our usage:
- 8 cuisines × 1 request each = 8 requests
- Leaves 142 requests for suggestions feature
- 1 second delay between requests to be safe
```

### **Error Handling:**
```javascript
if (error.response?.status === 402) {
  // Quota exceeded - stop gracefully
  console.log('Daily limit reached');
  break;
}
```

---

## 📊 Comparison: TheMealDB vs Spoonacular

| Feature | TheMealDB | Spoonacular |
|---------|-----------|-------------|
| **API Calls Needed** | 2 per recipe | 1 per batch |
| **Recipes Per Call** | 1 | 5 |
| **Total API Calls** | ~160 | ~8 |
| **Cooking Time** | Estimated | Actual |
| **Vegetarian Flag** | Calculated | From API |
| **Instructions** | Text block | Step-by-step |
| **Ingredients** | Name + measure | Detailed with units |
| **Cost** | Free | Free tier: 150/day |
| **Setup** | None | API key required |

---

## 🚀 Complete Workflow

### **First Time Setup:**

1. **Get Spoonacular API Key** (Optional but recommended):
   ```
   Visit: https://spoonacular.com/food-api
   Sign up → Get API key
   ```

2. **Add to `.env`:**
   ```env
   SPOONACULAR_API_KEY=your_actual_key_here
   ```

3. **Seed Database:**
   ```bash
   cd backend
   npm run seed
   ```

### **Re-seeding (Fresh Start):**

1. **Clear existing data:**
   ```bash
   npm run clear
   ```

2. **Seed again:**
   ```bash
   npm run seed
   ```

### **Expected Results:**

**With Spoonacular API Key:**
```
📊 Total recipes fetched: 120
   - TheMealDB: 80 recipes
   - Spoonacular: 40 recipes

📋 Summary by Source:
   themealdb: 80 recipes
   spoonacular: 40 recipes
```

**Without Spoonacular API Key:**
```
📊 Total recipes fetched: 80
   - TheMealDB: 80 recipes
   - Spoonacular: 0 recipes

⚠️  Spoonacular API key not configured. Skipping...
```

---

## 💡 Pro Tips

1. **Check Your Data:**
   - Use MongoDB Compass to view recipes
   - Filter by `source: "themealdb"` or `source: "spoonacular"`
   - Check `isVeg` field for accuracy

2. **API Quota Management:**
   - Spoonacular free tier resets daily
   - Seed once, use for development
   - Save API calls for suggestions feature

3. **Customization:**
   - Edit `THEMEALDB_CATEGORIES` array for different categories
   - Edit `SPOONACULAR_CUISINES` array for different cuisines
   - Adjust `number: 5` to fetch more/less per cuisine

4. **Troubleshooting:**
   - If seed fails, check internet connection
   - If Spoonacular fails, check API key in `.env`
   - If quota exceeded, wait 24 hours or use TheMealDB only

---

## 🎯 Summary

**TheMealDB:**
- ✅ Always works (no setup)
- ✅ Free forever
- ✅ Good variety of recipes
- ⚠️ Requires 2 API calls per recipe
- ⚠️ Estimated cooking times

**Spoonacular:**
- ✅ More accurate data
- ✅ Better vegetarian detection
- ✅ Actual cooking times
- ✅ Diverse cuisines
- ⚠️ Requires API key
- ⚠️ Daily quota limit

**Best Practice:**
Use both APIs for maximum recipe diversity and data quality! 🎉
