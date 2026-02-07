import React, { createContext, useState, useContext, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const { signedIn } = useAuth(); // Re-fetch on sign in

    useEffect(() => {
        if (!signedIn) {
            setFavorites([]);
            return;
        }

        const fetchFavorites = async () => {
            try {
                const { data } = await client.get('/user/favorites');
                if (data.success) {
                    setFavorites(data.data);
                }
            } catch (error) {
                console.error('Error fetching favorites:', error);
            }
        };

        fetchFavorites();
    }, [signedIn]);

    const toggleFavorite = async (restaurantId) => {
        // Optimistic update
        const isFav = favorites.includes(restaurantId);
        setFavorites((prev) =>
            isFav
                ? prev.filter((id) => id !== restaurantId)
                : [...prev, restaurantId]
        );

        try {
            if (isFav) {
                await client.delete(`/user/favorites/${restaurantId}`);
            } else {
                await client.post(`/user/favorites/${restaurantId}`);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            // Revert on error
            setFavorites((prev) =>
                isFav ? [...prev, restaurantId] : prev.filter((id) => id !== restaurantId)
            );
        }
    };

    const isFavorite = (restaurantId) => favorites.includes(restaurantId);

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoritesContext);
