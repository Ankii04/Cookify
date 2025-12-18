import { createContext, useContext, useState, useEffect } from 'react';

const ShoppingContext = createContext();

export const ShoppingProvider = ({ children }) => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        const savedItems = localStorage.getItem('shoppingList');
        if (savedItems) {
            setItems(JSON.parse(savedItems));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('shoppingList', JSON.stringify(items));
    }, [items]);

    const addItem = (item) => {
        setItems(prev => {
            if (prev.find(i => i.name === item.name)) return prev;
            return [...prev, { ...item, id: Date.now() + Math.random(), completed: false }];
        });
    };

    const removeItem = (id) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const toggleItem = (id) => {
        setItems(prev => prev.map(i =>
            i.id === id ? { ...i, completed: !i.completed } : i
        ));
    };

    const clearItems = () => {
        setItems([]);
    };

    return (
        <ShoppingContext.Provider value={{ items, addItem, removeItem, toggleItem, clearItems }}>
            {children}
        </ShoppingContext.Provider>
    );
};

export const useShopping = () => useContext(ShoppingContext);
