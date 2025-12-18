# 🚀 Deployment Guide

## Overview
This guide covers deploying the Recipe Book application to production.

## Prerequisites
- MongoDB Atlas account (free tier available)
- Hosting platform account (Render, Heroku, Vercel, etc.)
- Domain name (optional)

## MongoDB Atlas Setup

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create Cluster**
   - Create a new cluster (M0 Free tier)
   - Choose your preferred region

3. **Configure Access**
   - Database Access: Create a database user
   - Network Access: Add IP address (0.0.0.0/0 for all IPs)

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## Backend Deployment (Render)

1. **Prepare Backend**
   - Ensure `package.json` has start script: `"start": "node server.js"`
   - Create `render.yaml` (optional)

2. **Deploy to Render**
   - Go to https://render.com
   - Create new Web Service
   - Connect your GitHub repository
   - Configure:
     - Build Command: `cd backend && npm install`
     - Start Command: `cd backend && npm start`
     - Environment: Node

3. **Environment Variables**
   Add these in Render dashboard:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_production_jwt_secret
   NODE_ENV=production
   PORT=5000
   THEMEALDB_API_KEY=1
   SPOONACULAR_API_KEY=your_key
   FRONTEND_URL=your_frontend_url
   ```

4. **Seed Database**
   - After first deployment, run seed script via Render shell
   - Or seed from local: `MONGODB_URI=your_atlas_uri npm run seed`

## Frontend Deployment (Vercel)

1. **Update API URL**
   - In `frontend/.env`:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Import your repository
   - Configure:
     - Framework: Vite
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `dist`

3. **Environment Variables**
   Add in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

## Alternative: Full-Stack on Render

Deploy both frontend and backend on Render:

1. **Backend** (as above)

2. **Frontend**
   - Create new Static Site
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`

## Post-Deployment

### 1. Seed Database
```bash
# From local machine
MONGODB_URI=your_atlas_uri npm run seed
```

### 2. Create Admin User
Connect to MongoDB Atlas and run:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### 3. Test Application
- Register a new user
- Add a recipe
- Upload an image
- Create a review
- Test favorites

### 4. Configure CORS
Ensure backend CORS allows your frontend domain:
```javascript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
})
```

## Environment Variables Summary

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=strong_random_string_here
NODE_ENV=production
PORT=5000
THEMEALDB_API_KEY=1
SPOONACULAR_API_KEY=your_key
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend.onrender.com
```

## Security Checklist

- [ ] Strong JWT_SECRET in production
- [ ] MongoDB user has strong password
- [ ] MongoDB network access configured
- [ ] CORS properly configured
- [ ] Environment variables not committed to git
- [ ] HTTPS enabled (automatic on Vercel/Render)
- [ ] Rate limiting enabled
- [ ] File upload size limits set

## Monitoring

### Backend Health Check
```
GET https://your-backend.onrender.com/api/health
```

### Check Logs
- Render: View logs in dashboard
- Vercel: View function logs

## Troubleshooting

### Images Not Loading
- Check VITE_API_URL is correct
- Verify CORS settings
- Check uploads directory exists

### MongoDB Connection Failed
- Verify connection string
- Check IP whitelist (0.0.0.0/0)
- Confirm database user credentials

### API Calls Failing
- Check CORS configuration
- Verify environment variables
- Check backend logs

## Scaling Considerations

### Free Tier Limitations
- Render: Spins down after inactivity
- MongoDB Atlas: 512MB storage
- Vercel: 100GB bandwidth/month

### Upgrade Path
1. Render Pro ($7/month) - Always on
2. MongoDB Atlas M10 ($0.08/hour) - More storage
3. CDN for images (Cloudinary, AWS S3)
4. Redis for caching

## Custom Domain

### Vercel
1. Go to project settings
2. Add custom domain
3. Configure DNS records

### Render
1. Go to service settings
2. Add custom domain
3. Configure DNS records

## Backup Strategy

### MongoDB Atlas
- Automatic backups on paid tiers
- Export data regularly:
```bash
mongodump --uri="your_connection_string"
```

### Images
- Consider cloud storage (S3, Cloudinary)
- Regular backups of uploads directory

## Performance Optimization

1. **Enable Compression**
   - Add compression middleware to Express

2. **CDN for Static Assets**
   - Use Cloudinary for images
   - Vercel CDN for frontend

3. **Database Indexes**
   - Already configured in models
   - Monitor slow queries

4. **Caching**
   - Implement Redis for API responses
   - Cache Spoonacular suggestions

## Maintenance

### Regular Tasks
- Monitor error logs
- Check database size
- Update dependencies
- Review user feedback
- Backup data

### Updates
```bash
# Update dependencies
npm update

# Check for security issues
npm audit
npm audit fix
```

## Support

For issues:
1. Check logs (Render/Vercel dashboard)
2. Verify environment variables
3. Test API endpoints
4. Check MongoDB connection

---

**Your Recipe Book is now live! 🎉**

Remember to:
- Monitor performance
- Backup regularly
- Keep dependencies updated
- Listen to user feedback
