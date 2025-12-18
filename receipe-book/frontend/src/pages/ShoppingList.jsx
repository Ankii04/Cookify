import { Link } from 'react-router-dom';
import { useShopping } from '../context/ShoppingContext';
import { motion, AnimatePresence } from 'framer-motion';

const ShoppingList = () => {
    const { items, removeItem, toggleItem, clearItems } = useShopping();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="max-w-3xl mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">🛒 Shopping List</h1>
                    {items.length > 0 && (
                        <button
                            onClick={clearItems}
                            className="text-red-600 hover:text-red-700 font-semibold"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                    <AnimatePresence mode="popLayout">
                        {items.length > 0 ? (
                            <div className="divide-y dark:divide-gray-700">
                                {items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="p-4 flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="checkbox"
                                                checked={item.completed}
                                                onChange={() => toggleItem(item.id)}
                                                className="w-5 h-5 rounded border-2 border-orange-500 text-orange-500 focus:ring-orange-500 cursor-pointer"
                                            />
                                            <div className={item.completed ? 'line-through text-gray-400' : ''}>
                                                <p className="font-semibold">{item.name}</p>
                                                {item.measure && <p className="text-sm text-gray-500">{item.measure}</p>}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ✕
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <span className="text-6xl mb-4 block">📝</span>
                                <h2 className="text-2xl font-bold mb-2">Your list is empty</h2>
                                <p className="text-gray-500 mb-6">Add ingredients from any recipe to start your shopping list!</p>
                                <Link to="/recipes" className="btn-primary inline-block">
                                    Browse Recipes
                                </Link>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ShoppingList;
