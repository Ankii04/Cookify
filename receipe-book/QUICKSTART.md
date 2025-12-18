# 🚀 Quick Start Guide

## Prerequisites
- Node.js installed
- MongoDB running (local or Atlas)

## Setup Steps

### 1. Backend Setup
```bash
cd backend
npm install
```

### 2. Configure Environment
Edit `backend/.env`:
- Set your MongoDB URI
- Keep other defaults for development

### 3. Seed Database (IMPORTANT!)
```bash
cd backend
npm run seed
```
This fetches ~100 recipes from TheMealDB and stores them in MongoDB.

### 4. Start Backend
```bash
cd backend
npm run dev
```
Backend runs on http://localhost:5000

### 5. Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173

## First Steps in the App

1. **Browse** - Visit http://localhost:5173
2. **Register** - Create an account
3. **Explore** - Browse recipes, search, filter
4. **Add Recipe** - Share your own recipe
5. **Rate & Review** - Try a recipe and leave feedback
6. **Favorites** - Save recipes you love

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check MONGODB_URI in backend/.env
- For MongoDB Atlas, whitelist your IP address

### Port Already in Use
- Backend: Change PORT in backend/.env
- Frontend: Vite will auto-select another port

### No Recipes Showing
- Run `npm run seed` in backend directory
- Check MongoDB connection
- Check browser console for errors

### Images Not Loading
- Check backend/uploads directory exists
- Verify VITE_API_URL in frontend/.env
- Check CORS settings in backend/server.js

## Default Credentials

There are no default users. You need to register a new account.

To create an admin user, manually update a user in MongoDB:
```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

## API Testing

Health check: http://localhost:5000/api/health

## Need Help?

Check the main README.md for detailed documentation.
