import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Recipe API
export const recipeAPI = {
    getAll: (params) => api.get('/api/recipes', { params }),
    getById: (id) => api.get(`/api/recipes/${id}`),
    getFeatured: () => api.get('/api/recipes/featured'),
    getCategories: () => api.get('/api/recipes/categories'),
    getCuisines: () => api.get('/api/recipes/cuisines'),
    create: (formData) => api.post('/api/recipes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, formData) => api.put(`/api/recipes/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/api/recipes/${id}`),
    toggleFavorite: (id) => api.post(`/api/recipes/${id}/favorite`)
};

// Review API
export const reviewAPI = {
    getByRecipe: (recipeId) => api.get(`/api/reviews/recipe/${recipeId}`),
    create: (data) => api.post('/api/reviews', data),
    update: (id, data) => api.put(`/api/reviews/${id}`, data),
    delete: (id) => api.delete(`/api/reviews/${id}`)
};

// Suggestions API (Spoonacular)
export const suggestionAPI = {
    getByIngredients: (ingredients) => api.get('/api/suggestions', {
        params: { ingredients }
    }),
    getById: (id) => api.get(`/api/suggestions/${id}`)
};

// Search API (Spoonacular)
export const searchAPI = {
    search: (query, filters = {}) => api.get('/api/search', {
        params: { query, ...filters }
    }),
    getById: (id) => api.get(`/api/search/${id}`)
};

export default api;
