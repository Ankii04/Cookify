import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { recipeAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AddRecipe = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        cuisine: '',
        cookingTime: '',
        servings: '4',
        ingredients: [{ name: '', measure: '' }],
        steps: [''],
        tags: []
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isEditMode) {
            fetchRecipe();
        }
    }, [id]);

    const fetchRecipe = async () => {
        try {
            const response = await recipeAPI.getById(id);
            if (response.data.success) {
                const recipe = response.data.data;
                setFormData({
                    title: recipe.title,
                    category: recipe.category,
                    cuisine: recipe.cuisine,
                    cookingTime: recipe.cookingTime.toString(),
                    difficulty: recipe.difficulty,
                    servings: recipe.servings.toString(),
                    ingredients: recipe.ingredients,
                    steps: recipe.steps,
                    tags: recipe.tags || []
                });
                if (recipe.image) {
                    setImagePreview(
                        recipe.image.startsWith('http')
                            ? recipe.image
                            : `${import.meta.env.VITE_API_URL}${recipe.image}`
                    );
                }
            }
        } catch (error) {
            console.error('Error fetching recipe:', error);
            alert('Failed to load recipe');
            navigate('/recipes');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index][field] = value;
        setFormData({ ...formData, ingredients: newIngredients });
    };

    const addIngredient = () => {
        setFormData({
            ...formData,
            ingredients: [...formData.ingredients, { name: '', measure: '' }]
        });
    };

    const removeIngredient = (index) => {
        const newIngredients = formData.ingredients.filter((_, i) => i !== index);
        setFormData({ ...formData, ingredients: newIngredients });
    };

    const handleStepChange = (index, value) => {
        const newSteps = [...formData.steps];
        newSteps[index] = value;
        setFormData({ ...formData, steps: newSteps });
    };

    const addStep = () => {
        setFormData({
            ...formData,
            steps: [...formData.steps, '']
        });
    };

    const removeStep = (index) => {
        const newSteps = formData.steps.filter((_, i) => i !== index);
        setFormData({ ...formData, steps: newSteps });
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, tagInput.trim()]
            });
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title || !formData.category || !formData.cookingTime) {
            alert('Please fill in all required fields');
            return;
        }

        if (formData.ingredients.some(ing => !ing.name)) {
            alert('Please fill in all ingredient names');
            return;
        }

        if (formData.steps.some(step => !step.trim())) {
            alert('Please fill in all cooking steps');
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('category', formData.category);
            data.append('cuisine', formData.cuisine);
            data.append('cookingTime', formData.cookingTime);
            data.append('servings', formData.servings);
            data.append('ingredients', JSON.stringify(formData.ingredients));
            data.append('steps', JSON.stringify(formData.steps));
            data.append('tags', JSON.stringify(formData.tags));

            if (image) {
                data.append('image', image);
            }

            let response;
            if (isEditMode) {
                response = await recipeAPI.update(id, data);
            } else {
                response = await recipeAPI.create(data);
            }

            if (response.data.success) {
                navigate(`/recipes/${response.data.data._id}`);
            }
        } catch (error) {
            console.error('Error saving recipe:', error);
            alert(error.response?.data?.message || 'Failed to save recipe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold mb-8">
                    {isEditMode ? 'Edit Recipe' : 'Add New Recipe'}
                </h1>

                <form onSubmit={handleSubmit} className="card p-8 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="label">Recipe Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="e.g., Chocolate Chip Cookies"
                            required
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="label">Recipe Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="input-field"
                        />
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="mt-4 w-full h-64 object-cover rounded-lg"
                            />
                        )}
                    </div>

                    {/* Category and Cuisine */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="input-field"
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Dinner">Dinner</option>
                                <option value="Snacks">Snacks</option>
                                <option value="Dessert">Dessert</option>
                                <option value="Appetizer">Appetizer</option>
                                <option value="Main Course">Main Course</option>
                                <option value="Beverages">Beverages</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Cuisine</label>
                            <input
                                type="text"
                                name="cuisine"
                                value={formData.cuisine}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="e.g., Italian, Mexican"
                            />
                        </div>
                    </div>

                    {/* Cooking Time, Difficulty, Servings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="label">Cooking Time (minutes) *</label>
                            <input
                                type="number"
                                name="cookingTime"
                                value={formData.cookingTime}
                                onChange={handleChange}
                                className="input-field"
                                min="1"
                                required
                            />
                        </div>
                        <div>
                            <label className="label">Servings</label>
                            <input
                                type="number"
                                name="servings"
                                value={formData.servings}
                                onChange={handleChange}
                                className="input-field"
                                min="1"
                            />
                        </div>
                    </div>

                    {/* Ingredients */}
                    <div>
                        <label className="label">Ingredients *</label>
                        <div className="space-y-3">
                            {formData.ingredients.map((ingredient, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Measure (e.g., 2 cups)"
                                        value={ingredient.measure}
                                        onChange={(e) => handleIngredientChange(index, 'measure', e.target.value)}
                                        className="input-field w-1/3"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Ingredient name *"
                                        value={ingredient.name}
                                        onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                                        className="input-field flex-1"
                                        required
                                    />
                                    {formData.ingredients.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeIngredient(index)}
                                            className="btn-primary bg-red-600 hover:bg-red-700 px-4"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addIngredient}
                            className="btn-secondary mt-3"
                        >
                            + Add Ingredient
                        </button>
                    </div>

                    {/* Steps */}
                    <div>
                        <label className="label">Cooking Steps *</label>
                        <div className="space-y-3">
                            {formData.steps.map((step, index) => (
                                <div key={index} className="flex gap-2">
                                    <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold mt-2">
                                        {index + 1}
                                    </span>
                                    <textarea
                                        value={step}
                                        onChange={(e) => handleStepChange(index, e.target.value)}
                                        className="input-field flex-1"
                                        rows="2"
                                        placeholder="Describe this step..."
                                        required
                                    />
                                    {formData.steps.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeStep(index)}
                                            className="btn-primary bg-red-600 hover:bg-red-700 px-4 h-10 mt-2"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addStep}
                            className="btn-secondary mt-3"
                        >
                            + Add Step
                        </button>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="label">Tags (optional)</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                className="input-field flex-1"
                                placeholder="Add a tag..."
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="btn-secondary"
                            >
                                Add Tag
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm flex items-center gap-2"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="hover:text-red-600"
                                    >
                                        ✕
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex-1"
                        >
                            {loading ? 'Saving...' : isEditMode ? 'Update Recipe' : 'Create Recipe'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddRecipe;
