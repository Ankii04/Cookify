import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import routes
import authRoutes from './routes/auth.js';
import recipeRoutes from './routes/recipes.js';
import reviewRoutes from './routes/reviews.js';
import suggestionRoutes from './routes/suggestions.js';
import searchRoutes from './routes/search.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Database connection helper
const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) return;

        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI is missing in environment variables');
            return;
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
    }
};

// Middleware
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:5173'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            return callback(null, true);
        } else {
            return callback(null, new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB connection for all API requests
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files (uploaded images)
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/search', searchRoutes);

// Root route - API welcome message
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Cookiify API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth/*',
            recipes: '/api/recipes/*',
            reviews: '/api/reviews/*',
            suggestions: '/api/suggestions/*',
            search: '/api/search/*'
        },
        documentation: 'Visit the frontend at https://cookiify.vercel.app'
    });
});


// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Recipe Book API is running',
        dbConnected: mongoose.connection.readyState === 1,
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// Start server (only for local development)
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`\n🚀 Server is running on port ${PORT}`);
        });
    });
}

export default app;
