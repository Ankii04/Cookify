# 🎯 Dual API Integration - Complete Guide

## Overview

Your Recipe Book now uses **BOTH APIs** intelligently:
- **TheMealDB**: Stores recipes in MongoDB for your core database
- **Spoonacular**: Provides real-time search with in-app recipe details

---

## 🔄 How Both APIs Work Together

### **1. TheMealDB → MongoDB (Database Seeding)**

**Purpose:** Build your core recipe database

**Process:**
```
TheMealDB API → Fetch Recipes → Save to MongoDB → Display in /recipes
```

**When It Runs:**
```bash
npm run seed
```

**What Gets Saved:**
- ~80 recipes from TheMealDB
- ~40 recipes from Spoonacular (if API key configured)
- All stored permanently in MongoDB
- Accessible via `/recipes` page

**Data Flow:**
```
User visits /recipes
    ↓
Frontend calls /api/recipes
    ↓
Backend queries MongoDB
    ↓
Returns saved recipes (TheMealDB + Spoonacular)
```

---

### **2. Spoonacular → Real-Time Search**

**Purpose:** Search millions of recipes on-demand

**Process:**
```
User searches → Spoonacular API → Display results → View details in-app
```

**When It Runs:**
- When user searches on `/search` page
- Real-time, no database storage
- Fresh results every time

**Data Flow:**
```
User enters "pasta" in search
    ↓
Frontend calls /api/search?query=pasta
    ↓
Backend calls Spoonacular API
    ↓
Results cached for 30 minutes
    ↓
User clicks recipe
    ↓
Navigate to /spoonacular/:id
    ↓
Fetch full recipe details from Spoonacular
    ↓
Display in-app (no external redirect!)
```

---

## 📁 File Structure

### **Backend Routes:**

**1. `/api/recipes`** (MongoDB recipes)
- Source: `backend/routes/recipes.js`
- Data: MongoDB database
- Includes: TheMealDB + Spoonacular seeded recipes

**2. `/api/search`** (Spoonacular search)
- Source: `backend/routes/search.js`
- Data: Spoonacular API (real-time)
- Caching: 30 minutes

**3. `/api/search/:id`** (Spoonacular recipe details)
- Source: `backend/routes/search.js`
- Data: Spoonacular API
- Returns: Full recipe with ingredients & steps

### **Frontend Pages:**

**1. `/recipes`** - MongoDB Recipes
- Component: `pages/Recipes.jsx`
- Shows: Saved recipes from database
- Sources: TheMealDB + Spoonacular (seeded)

**2. `/recipes/:id`** - MongoDB Recipe Detail
- Component: `pages/RecipeDetail.jsx`
- Shows: Full details of saved recipes
- Can: Edit, Review, Favorite

**3. `/search`** - Spoonacular Search
- Component: `pages/Search.jsx`
- Shows: Real-time search results
- Features: Advanced filters

**4. `/spoonacular/:id`** - Spoonacular Recipe Detail
- Component: `pages/SpoonacularRecipeDetail.jsx`
- Shows: Full Spoonacular recipe IN-APP
- No external redirect!

---

## 🎨 User Experience

### **Scenario 1: Browse Saved Recipes**

```
User clicks "Recipes" in navbar
    ↓
Views recipes from MongoDB
    ↓
Clicks a recipe
    ↓
Sees full details (can edit/review/favorite)
```

**Source:** TheMealDB or Spoonacular (seeded)
**Storage:** MongoDB
**Editable:** Yes (if user-created)

---

### **Scenario 2: Search New Recipes**

```
User clicks "🔍 Search" in navbar
    ↓
Enters "chicken tikka masala"
    ↓
Sees results from Spoonacular
    ↓
Clicks "View Full Recipe"
    ↓
Sees complete recipe details IN-APP
    ↓
Can view ingredients, steps, health score, etc.
    ↓
Optional: Click "View Original" for source website
```

**Source:** Spoonacular API
**Storage:** None (cached 30 min)
**Editable:** No

---

## 🔑 Key Differences

| Feature | MongoDB Recipes | Spoonacular Search |
|---------|----------------|-------------------|
| **Route** | `/recipes` | `/search` |
| **Detail Route** | `/recipes/:id` | `/spoonacular/:id` |
| **Data Source** | MongoDB | Spoonacular API |
| **Storage** | Permanent | Cached (30 min) |
| **Quantity** | ~120 recipes | Millions |
| **Editable** | Yes (user recipes) | No |
| **Reviews** | Yes | No |
| **Favorites** | Yes | No |
| **Filters** | Basic | Advanced |
| **Health Score** | No | Yes |
| **Dietary Info** | Basic | Detailed |
| **Cost** | Free | API quota |

---

## 💾 Database vs Real-Time

### **When to Use MongoDB Recipes (`/recipes`):**
- ✅ Browse curated collection
- ✅ View user-submitted recipes
- ✅ Add reviews and ratings
- ✅ Save to favorites
- ✅ Edit your own recipes
- ✅ Offline-capable (once loaded)

### **When to Use Search (`/search`):**
- ✅ Find specific recipes
- ✅ Explore new cuisines
- ✅ Filter by diet/cuisine/type
- ✅ Get health scores
- ✅ Access millions of recipes
- ✅ Find trending recipes

---

## 🚀 Setup Instructions

### **1. Seed MongoDB Database**

```bash
cd backend

# Clear existing data (optional)
npm run clear

# Seed with both APIs
npm run seed
```

**Result:**
- ~80 recipes from TheMealDB
- ~40 recipes from Spoonacular (if API key set)
- All saved to MongoDB

### **2. Configure Spoonacular API**

```bash
# In backend/.env
SPOONACULAR_API_KEY=your_actual_api_key_here
```

**Get API Key:**
1. Visit https://spoonacular.com/food-api
2. Sign up (free)
3. Copy API key
4. Add to `.env`
5. Restart backend

### **3. Test Both Features**

**Test MongoDB Recipes:**
```
http://localhost:5173/recipes
```

**Test Spoonacular Search:**
```
http://localhost:5173/search
```

---

## 📊 API Usage Optimization

### **TheMealDB:**
- **Cost:** Free forever
- **Usage:** One-time seeding (~160 requests)
- **Quota:** Unlimited
- **Rate Limit:** None

### **Spoonacular:**
- **Cost:** Free tier (150 requests/day)
- **Usage Breakdown:**
  - Seeding: ~8 requests (one-time)
  - Search: ~1 request per search
  - Recipe Details: ~1 request per recipe view
- **Optimization:**
  - 30-minute caching
  - Rate limiting (20/15min)
  - Efficient queries

**Daily Budget Example:**
```
Seeding: 8 requests (one-time)
Remaining: 142 requests/day

If 50 users search:
- 50 searches = 50 requests
- 25 recipe views = 25 requests
- Total: 75 requests
- Remaining: 67 requests
```

---

## 🎯 Best Practices

### **For Users:**

1. **Browse First:**
   - Check `/recipes` for saved recipes
   - Faster, no API quota usage

2. **Search When Needed:**
   - Use `/search` for specific recipes
   - Explore new cuisines
   - Find dietary-specific recipes

3. **Save Favorites:**
   - Add MongoDB recipes to favorites
   - Create your own recipes

### **For Developers:**

1. **Seed Regularly:**
   - Update database monthly
   - Add new categories
   - Refresh Spoonacular recipes

2. **Monitor API Usage:**
   - Check Spoonacular dashboard
   - Adjust caching if needed
   - Consider paid tier if popular

3. **Optimize Queries:**
   - Use specific search terms
   - Apply filters to reduce results
   - Cache common searches

---

## 🔍 Example Workflows

### **Workflow 1: Quick Dinner Idea**

```
1. Go to /recipes
2. Filter by "Quick" or "Easy"
3. Browse saved recipes
4. Click recipe → View details
5. Cook!
```

**API Calls:** 0 (uses MongoDB)

---

### **Workflow 2: Find Specific Recipe**

```
1. Go to /search
2. Search "chicken tikka masala"
3. Apply filter: Cuisine = Indian
4. Browse results
5. Click recipe → View full details IN-APP
6. See ingredients, steps, health score
7. Cook!
```

**API Calls:** 2 (search + details)
**Cached:** 30 minutes

---

### **Workflow 3: Dietary Restriction**

```
1. Go to /search
2. Search "pasta"
3. Apply filter: Diet = Vegan
4. Browse vegan pasta recipes
5. Click recipe → View details
6. Check ingredients for allergens
7. Cook!
```

**API Calls:** 2
**Benefit:** Advanced dietary filtering

---

## ✨ Features Summary

### **MongoDB Recipes:**
- ✅ Permanent storage
- ✅ User reviews & ratings
- ✅ Favorites system
- ✅ Edit capabilities
- ✅ Fast loading
- ✅ No API quota concerns

### **Spoonacular Search:**
- ✅ Millions of recipes
- ✅ Advanced filters
- ✅ Health scores
- ✅ Detailed dietary info
- ✅ In-app recipe details
- ✅ No external redirects
- ✅ Fresh, updated content

---

## 🎉 Summary

**Your Recipe Book now offers the best of both worlds:**

1. **Curated Collection** (MongoDB)
   - Fast, reliable, editable
   - Perfect for regular cooking

2. **Unlimited Search** (Spoonacular)
   - Explore new recipes
   - Advanced filtering
   - Detailed nutritional info

**All recipe details displayed in-app - no external redirects!** 🚀🍳
