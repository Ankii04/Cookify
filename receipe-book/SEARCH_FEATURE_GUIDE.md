# 🔍 Spoonacular Search Feature Guide

## 🎯 Overview

The Search feature allows users to search for recipes from Spoonacular's database of **millions of recipes** worldwide using keywords and filters.

---

## ✨ Features

### **1. Keyword Search**
- Search by recipe name (e.g., "pasta", "chicken curry")
- Search by ingredients (e.g., "tomato basil")
- Search by dish type (e.g., "dessert", "soup")

### **2. Advanced Filters**
- **Cuisine**: Filter by 14+ cuisines (Indian, Italian, Chinese, etc.)
- **Diet**: Vegetarian, Vegan, Gluten-Free, Keto, Paleo
- **Meal Type**: Main Course, Dessert, Appetizer, Breakfast, etc.

### **3. Rich Recipe Data**
- Recipe title and image
- Cooking time and servings
- Health score (0-100)
- Vegetarian/dietary indicators
- Direct link to full recipe

---

## 🚀 How to Use

### **Step 1: Access Search Page**
Click "🔍 Search" in the navigation menu (desktop or mobile)

### **Step 2: Enter Search Query**
Type your search term in the search box:
- "pasta carbonara"
- "chocolate cake"
- "chicken tikka"
- "vegan burger"

### **Step 3: Apply Filters (Optional)**
- **Cuisine**: Select specific cuisine type
- **Diet**: Choose dietary preference
- **Meal Type**: Filter by meal category

### **Step 4: Click Search**
Results appear instantly with:
- Recipe images
- Cooking time
- Servings
- Health score
- Dietary tags

### **Step 5: View Recipe**
Click "View Full Recipe →" to see complete recipe on source website

---

## 🔧 Backend Implementation

### **API Endpoint:**
```
GET /api/search?query=pasta&cuisine=Italian&diet=vegetarian
```

### **Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `query` | string | Search keyword (required) | "pasta" |
| `cuisine` | string | Cuisine filter (optional) | "Italian" |
| `diet` | string | Diet filter (optional) | "vegetarian" |
| `type` | string | Meal type filter (optional) | "main course" |
| `number` | integer | Results count (default: 10) | 10 |

### **Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": 654959,
      "title": "Pasta Carbonara",
      "image": "https://...",
      "cookingTime": 30,
      "servings": 4,
      "isVeg": false,
      "cuisine": "Italian",
      "category": "Main Course",
      "healthScore": 45,
      "sourceUrl": "https://...",
      "source": "spoonacular"
    }
  ],
  "totalResults": 100,
  "cached": false,
  "source": "spoonacular"
}
```

---

## 💾 Caching System

### **How It Works:**
- Search results are **cached for 30 minutes**
- Same search query returns cached data instantly
- Reduces API calls and improves performance

### **Cache Key:**
```javascript
`${query}-${cuisine}-${diet}-${type}-${number}`.toLowerCase()
```

### **Example:**
```
First search: "pasta-italian--main course-10" → API call
Same search within 30 min → Cached (instant)
After 30 min → New API call
```

---

## 🛡️ Rate Limiting

### **Protection:**
- **20 requests per 15 minutes** per IP address
- Prevents API quota abuse
- Shows error message if exceeded

### **Error Handling:**
```javascript
if (error.response?.status === 402) {
  // Daily quota exceeded
  message: "Daily API quota exceeded. Try again tomorrow"
}
```

---

## 📊 API Usage

### **Spoonacular Free Tier:**
- **150 requests/day**
- Resets daily at midnight UTC

### **Our Usage:**
- **Seeding**: ~8 requests (one-time)
- **Search**: Variable (user-driven)
- **Suggestions**: Variable (user-driven)

### **Optimization:**
- 30-minute caching reduces repeat calls
- Rate limiting prevents abuse
- Efficient API parameter usage

---

## 🎨 Frontend Component

### **Location:**
`frontend/src/pages/Search.jsx`

### **Key Features:**
1. **Search Form** with keyword input
2. **Filter Dropdowns** for cuisine, diet, type
3. **Loading State** with spinner
4. **Error Handling** with user-friendly messages
5. **Results Grid** with recipe cards
6. **Quick Search Buttons** for common queries

### **State Management:**
```javascript
const [searchQuery, setSearchQuery] = useState('');
const [results, setResults] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [cuisine, setCuisine] = useState('');
const [diet, setDiet] = useState('');
const [type, setType] = useState('');
```

---

## 🔑 Setup Requirements

### **1. Get Spoonacular API Key**
Visit: https://spoonacular.com/food-api
- Sign up for free account
- Navigate to "My Console"
- Copy your API key

### **2. Add to Backend .env**
```env
SPOONACULAR_API_KEY=your_actual_api_key_here
```

### **3. Restart Backend Server**
```bash
cd backend
npm run dev
```

### **4. Test Search**
- Navigate to http://localhost:5173/search
- Enter a search term
- View results!

---

## 🎯 Use Cases

### **1. Find Specific Recipes**
```
Search: "chicken tikka masala"
Filter: Cuisine = Indian
Result: Authentic Indian chicken recipes
```

### **2. Dietary Restrictions**
```
Search: "pasta"
Filter: Diet = Vegan
Result: Vegan pasta recipes only
```

### **3. Meal Planning**
```
Search: "quick dinner"
Filter: Type = Main Course
Result: Quick main course ideas
```

### **4. Cuisine Exploration**
```
Search: "traditional"
Filter: Cuisine = Thai
Result: Traditional Thai dishes
```

---

## 📈 Benefits

### **Compared to Database Search:**
| Feature | Database | Spoonacular Search |
|---------|----------|-------------------|
| **Recipe Count** | ~120 | Millions |
| **Freshness** | Static | Always updated |
| **Variety** | Limited | Unlimited |
| **Filters** | Basic | Advanced |
| **Health Data** | No | Yes |
| **Source Links** | No | Yes |

### **User Benefits:**
- ✅ Access to millions of recipes
- ✅ Advanced filtering options
- ✅ Health scores and dietary info
- ✅ Direct links to full recipes
- ✅ Fresh, updated content
- ✅ International cuisine variety

---

## 🔍 Search Examples

### **Example 1: Simple Search**
```
Query: "pasta"
Results: All pasta recipes
```

### **Example 2: With Cuisine**
```
Query: "curry"
Cuisine: "Indian"
Results: Indian curry recipes
```

### **Example 3: Dietary Filter**
```
Query: "burger"
Diet: "Vegan"
Results: Vegan burger recipes
```

### **Example 4: Meal Type**
```
Query: "chocolate"
Type: "Dessert"
Results: Chocolate desserts
```

### **Example 5: Combined Filters**
```
Query: "rice"
Cuisine: "Thai"
Diet: "Vegetarian"
Type: "Main Course"
Results: Thai vegetarian rice main courses
```

---

## 🚨 Error Messages

### **API Not Configured:**
```
"Search feature requires Spoonacular API key. 
Please configure it in the backend."
```
**Solution:** Add API key to `.env`

### **Quota Exceeded:**
```
"Daily search quota exceeded. 
Please try again tomorrow."
```
**Solution:** Wait 24 hours or upgrade plan

### **No Results:**
```
"No recipes found for your search"
```
**Solution:** Try different keywords or adjust filters

### **Rate Limited:**
```
"Too many search requests, 
please try again later"
```
**Solution:** Wait 15 minutes

---

## 💡 Tips for Best Results

1. **Use Specific Keywords**
   - ❌ "food"
   - ✅ "chicken tikka masala"

2. **Combine Filters**
   - Use cuisine + diet for targeted results
   - Example: Italian + Vegetarian

3. **Try Variations**
   - "pasta" vs "spaghetti"
   - "chicken" vs "poultry"

4. **Use Meal Types**
   - Narrow down to specific categories
   - Breakfast, Lunch, Dinner, Snack

5. **Check Health Scores**
   - Higher score = healthier recipe
   - Filter by dietary needs

---

## 🎉 Summary

The Spoonacular Search feature provides:
- ✅ **Millions of recipes** at your fingertips
- ✅ **Advanced filtering** by cuisine, diet, type
- ✅ **Health scores** for informed choices
- ✅ **Caching** for fast performance
- ✅ **Rate limiting** for API protection
- ✅ **Beautiful UI** with recipe cards
- ✅ **Mobile responsive** design

**Perfect for users who want to explore recipes beyond your database!** 🌍🍳
