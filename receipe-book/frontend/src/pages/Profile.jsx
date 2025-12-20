import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from '../components/RecipeCard';
import { SkeletonCard } from '../components/Skeletons';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCamera, FiEdit2, FiSave, FiX, FiUpload } from 'react-icons/fi';

const Profile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', bio: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isOwnProfile = currentUser._id === id;

    useEffect(() => {
        fetchProfileData();
    }, [id]);

    const fetchProfileData = async () => {
        try {
            const [userRes, recipesRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/api/auth/user/${id}`),
                axios.get(`${import.meta.env.VITE_API_URL}/api/recipes?createdBy=${id}`)
            ]);

            if (userRes.data.success) {
                setProfile(userRes.data.data);
                setEditData({
                    name: userRes.data.data.name,
                    bio: userRes.data.data.bio || ''
                });
            }
            if (recipesRes.data.success) setRecipes(recipesRes.data.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async () => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('name', editData.name);
            formData.append('bio', editData.bio);
            if (imageFile) {
                formData.append('profileImage', imageFile);
            }

            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/auth/profile`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                setProfile(response.data.data);
                setIsEditing(false);
                setImageFile(null);
                setImagePreview(null);

                // Update localStorage
                const updatedUser = { ...currentUser, ...response.data.data };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditData({
            name: profile.name,
            bio: profile.bio || ''
        });
        setImageFile(null);
        setImagePreview(null);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="skeleton h-48 w-full rounded-2xl mb-12" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    if (!profile) return <div className="text-center py-20 text-2xl font-bold">User not found</div>;

    const displayImage = imagePreview || profile.profileImage;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-red-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pb-20">
            {/* Enhanced Header / Cover with Gradient */}
            <div className="relative h-[28rem]">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-center">
                    <div className="text-center">
                        {/* Profile Image with Upload */}
                        <div className="relative group inline-block mb-6">
                            <motion.div
                                className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-white p-3 shadow-2xl border-4 border-white dark:border-gray-800 dark:bg-gray-800"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-100 to-red-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden relative">
                                    {displayImage ? (
                                        <img
                                            src={displayImage}
                                            alt={profile.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-7xl">👨‍🍳</span>
                                    )}

                                    {isOwnProfile && (
                                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center rounded-full">
                                            <FiCamera className="text-white text-4xl" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                                disabled={!isEditing}
                                            />
                                        </label>
                                    )}
                                </div>
                            </motion.div>
                            {isEditing && imageFile && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white rounded-full p-3 shadow-lg">
                                    <FiUpload className="text-xl" />
                                </div>
                            )}
                        </div>

                        {/* Name and Info Card */}
                        <motion.div
                            className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl max-w-2xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="text-4xl md:text-5xl font-black text-white drop-shadow-lg bg-white/20 backdrop-blur-sm border-2 border-white/50 rounded-xl px-6 py-3 w-full text-center focus:outline-none focus:ring-2 focus:ring-white"
                                    placeholder="Your name"
                                />
                            ) : (
                                <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-lg mb-4">{profile.name}</h1>
                            )}

                            <div className="flex items-center justify-center gap-6 text-orange-100 font-medium mt-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">📅</span>
                                    <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">📚</span>
                                    <span>{recipes.length} Recipes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                                        {profile.role}
                                    </span>
                                </div>
                            </div>

                            {/* Edit Button */}
                            {isOwnProfile && (
                                <div className="mt-6">
                                    {!isEditing ? (
                                        <motion.button
                                            onClick={() => setIsEditing(true)}
                                            className="btn-primary flex items-center gap-2 shadow-xl mx-auto"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <FiEdit2 /> Edit Profile
                                        </motion.button>
                                    ) : (
                                        <div className="flex gap-3 justify-center">
                                            <motion.button
                                                onClick={handleUpdateProfile}
                                                disabled={uploading}
                                                className="btn-primary flex items-center gap-2 shadow-xl disabled:opacity-50"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <FiSave /> {uploading ? 'Saving...' : 'Save'}
                                            </motion.button>
                                            <motion.button
                                                onClick={cancelEdit}
                                                disabled={uploading}
                                                className="btn-secondary flex items-center gap-2 shadow-xl"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <FiX /> Cancel
                                            </motion.button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Enhanced Sidebar */}
                    <div className="lg:col-span-1">
                        <motion.div
                            className="card p-8 sticky top-24 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-orange-100 dark:border-gray-700"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                    <span className="text-white text-xl">👨‍🍳</span>
                                </div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">About Chef</h2>
                            </div>

                            {isEditing ? (
                                <textarea
                                    value={editData.bio}
                                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                    className="w-full p-4 border-2 border-orange-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white resize-none"
                                    rows="6"
                                    maxLength="500"
                                    placeholder="Tell us about yourself..."
                                />
                            ) : (
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {profile.bio || "This chef hasn't shared a bio yet, but their recipes speak for themselves!"}
                                </p>
                            )}

                        </motion.div>
                    </div>

                    {/* Recipe Grid */}
                    <div className="lg:col-span-3">
                        <motion.div
                            className="flex items-center justify-between mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                                    <span className="text-white text-2xl">🍳</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                    Recipes by {profile.name}
                                </h2>
                            </div>
                        </motion.div>

                        {recipes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {recipes.map((recipe, index) => (
                                    <motion.div
                                        key={recipe._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                        className="h-full"
                                    >
                                        <RecipeCard recipe={recipe} />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                className="text-center py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border-2 border-dashed border-orange-200 dark:border-gray-700"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="text-6xl mb-4">🍽️</div>
                                <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">No recipes uploaded yet.</p>
                                {isOwnProfile && (
                                    <p className="text-gray-400 dark:text-gray-500 mt-2">Start sharing your culinary creations!</p>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
