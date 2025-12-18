# 🍳 Recipe Book - Full-Stack Collaborative Recipe Platform

A production-ready, full-stack web application for sharing and discovering recipes. Built with React.js, Node.js, Express, and MongoDB.

## ✨ Features

### Core Features
- 📚 **Browse Recipes** - Explore hundreds of recipes from various cuisines
- 🔍 **Advanced Search & Filters** - Search by name, category, cuisine, difficulty
- ⭐ **Ratings & Reviews** - Rate and review recipes you've tried
- ❤️ **Favorites System** - Save your favorite recipes
- 👨‍🍳 **User Contributions** - Add your own recipes with images
- 🌙 **Dark Mode** - Beautiful dark theme support
- 📱 **Responsive Design** - Works perfectly on all devices

### Technical Features
- 🔐 **JWT Authentication** - Secure user authentication
- 🖼️ **Image Upload** - Upload recipe images with Multer
- 🎨 **Modern UI** - Built with Tailwind CSS
- 🚀 **Fast Performance** - Optimized queries and pagination
- 🔄 **Real-time Updates** - Instant feedback on actions
- 🛡️ **Role-based Access** - Admin and user roles

## 🏗️ Architecture

### Data Strategy (HYBRID SYSTEM)

#### MongoDB - PRIMARY DATA SOURCE ✅
- All recipes displayed on the site are stored in MongoDB
- User-created recipes
- Seeded recipes from TheMealDB (one-time import)
- Ratings, reviews, favorites, user data
- **All core features work using MongoDB only**

#### TheMealDB API - INITIAL SEED ONLY
- Used ONCE to populate database with initial recipes
- Recipes are normalized and stored permanently in MongoDB
- After seeding, no further calls to TheMealDB for existing recipes

#### Spoonacular API - TEMPORARY SUGGESTIONS (Optional)
- Provides ingredient-based recipe suggestions
- Results are NOT stored in database
- Shown as temporary recommendations
- Includes rate limiting and caching
- App works fully without this API

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd receipe-book
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Configure Backend Environment**
Create `backend/.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/recipe-book
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipe-book

PORT=5000
NODE_ENV=development

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# TheMealDB (free tier uses "1")
THEMEALDB_API_KEY=1

# Spoonacular (optional - get free key from spoonacular.com)
SPOONACULAR_API_KEY=your_spoonacular_api_key_here

FRONTEND_URL=http://localhost:5173
```

4. **Seed the Database**
```bash
npm run seed
```
This will fetch ~100 recipes from TheMealDB and store them in MongoDB.

5. **Start Backend Server**
```bash
npm run dev
# or
npm start
```
Server runs on http://localhost:5000

6. **Frontend Setup**
```bash
cd ../frontend
npm install
```

7. **Configure Frontend Environment**
The `.env` file should already exist with:
```env
VITE_API_URL=http://localhost:5000
```

8. **Start Frontend**
```bash
npm run dev
```
Frontend runs on http://localhost:5173

## 📁 Project Structure

```
receipe-book/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Recipe.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── recipes.js
│   │   ├── reviews.js
│   │   └── suggestions.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── scripts/
│   │   └── seedDatabase.js
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── RecipeCard.jsx
    │   │   └── Loading.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Recipes.jsx
    │   │   ├── RecipeDetail.jsx
    │   │   ├── AddRecipe.jsx
    │   │   ├── Favorites.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── NotFound.jsx
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── .env
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Recipes
- `GET /api/recipes` - Get all recipes (with filters & pagination)
- `GET /api/recipes/featured` - Get featured recipes
- `GET /api/recipes/categories` - Get all categories
- `GET /api/recipes/:id` - Get single recipe
- `POST /api/recipes` - Create recipe (protected)
- `PUT /api/recipes/:id` - Update recipe (protected)
- `DELETE /api/recipes/:id` - Delete recipe (protected)
- `POST /api/recipes/:id/favorite` - Toggle favorite (protected)

### Reviews
- `GET /api/reviews/recipe/:recipeId` - Get reviews for recipe
- `POST /api/reviews` - Create review (protected)
- `PUT /api/reviews/:id` - Update review (protected)
- `DELETE /api/reviews/:id` - Delete review (protected)

### Suggestions (Spoonacular)
- `GET /api/suggestions?ingredients=` - Get recipe suggestions
- `GET /api/suggestions/:id` - Get suggestion details

## 🎨 Tech Stack

### Frontend
- **React.js** - UI library
- **Vite** - Build tool
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Context API** - State management

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **bcryptjs** - Password hashing

### External APIs
- **TheMealDB** - Initial recipe seeding
- **Spoonacular** - Recipe suggestions (optional)

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes
- Input validation
- File upload restrictions
- CORS configuration
- Rate limiting on external API calls

## 🎯 Usage

1. **Browse Recipes** - Visit homepage to see featured recipes
2. **Search** - Use search and filters on /recipes page
3. **Register** - Create an account to unlock all features
4. **Add Recipe** - Share your own recipes with images
5. **Rate & Review** - Help others by rating recipes
6. **Save Favorites** - Build your personal recipe collection

## 📝 Notes

- The database must be seeded before first use (`npm run seed`)
- Spoonacular API is optional - app works without it
- Images are stored locally in `backend/uploads/`
- Default admin account can be created manually in MongoDB

## 🤝 Contributing

This is a complete, production-ready application. Feel free to:
- Add new features
- Improve UI/UX
- Add more external API integrations
- Enhance search capabilities
- Add social features

## 📄 License

MIT License - feel free to use this project for learning or production.

## 🙏 Acknowledgments

- TheMealDB for providing free recipe data
- Spoonacular for recipe suggestion API
- The open-source community

---

**Built with ❤️ using React, Node.js, Express & MongoDB**

For issues or questions, please check the code comments or create an issue.
