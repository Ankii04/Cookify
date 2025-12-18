import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from '../components/RecipeCard';
import { SkeletonCard } from '../components/Skeletons';
import { motion } from 'framer-motion';

const Profile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const [userRes, recipesRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/api/auth/user/${id}`),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/recipes?createdBy=${id}`)
                ]);

                if (userRes.data.success) setProfile(userRes.data.data);
                if (recipesRes.data.success) setRecipes(recipesRes.data.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [id]);

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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Header / Cover */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 h-64 relative">
                <div className="max-w-7xl mx-auto px-4 h-full relative">
                    <div className="absolute -bottom-16 left-4 md:left-8 flex flex-col md:flex-row items-end gap-6">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white p-2 shadow-2xl border-4 border-white dark:border-gray-800 dark:bg-gray-800">
                            <div className="w-full h-full rounded-2xl bg-orange-100 dark:bg-gray-700 flex items-center justify-center text-5xl">
                                👨‍🍳
                            </div>
                        </div>
                        <div className="mb-4">
                            <h1 className="text-4xl font-black text-white drop-shadow-lg">{profile.name}</h1>
                            <p className="text-orange-100 font-medium">Joined {new Date(profile.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 mt-24">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sidebar / Bio */}
                    <div className="lg:col-span-1">
                        <div className="card p-6 sticky top-24">
                            <h2 className="text-xl font-bold mb-4">About Chef</h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {profile.bio || "This chef hasn't shared a bio yet, but their recipes speak for themselves!"}
                            </p>
                            <div className="mt-8 pt-8 border-t dark:border-gray-700">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">Recipes</span>
                                    <span className="font-bold">{recipes.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Role</span>
                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-xs font-bold uppercase tracking-wider">
                                        {profile.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recipe Grid */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold">Recipes by {profile.name}</h2>
                            <div className="h-1 flex-1 mx-8 bg-gray-200 dark:bg-gray-800 rounded-full" />
                        </div>

                        {recipes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {recipes.map((recipe, index) => (
                                    <motion.div
                                        key={recipe._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="h-full"
                                    >
                                        <RecipeCard recipe={recipe} />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                <p className="text-xl text-gray-500">No recipes uploaded yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
