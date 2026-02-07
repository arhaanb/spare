import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { RestaurantCard } from '../components';
import { restaurants } from '../data/mockData';

const FavouritesScreen = ({ onRestaurantPress }) => {
    const insets = useSafeAreaInsets();
    const { favorites } = useFavorites();
    const { getCartItemCount } = useCart();
    const { hasActiveOrder } = useOrder();

    const paddingBottom = 100 + (getCartItemCount() > 0 ? 72 : 0) + (hasActiveOrder ? 72 : 0);

    const favoriteRestaurants = restaurants.filter(r => favorites.includes(r.id));

    return (
        <View style={[styles.container, { paddingTop: insets.top + SPACING.xl }]}>
            <Text style={styles.headerTitle}>Favourites</Text>

            {favoriteRestaurants.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No favourites yet.</Text>
                    <Text style={styles.emptySubtext}>Heart items to see them here.</Text>
                </View>
            ) : (
                <FlatList
                    data={favoriteRestaurants}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.cardWrapper}>
                            <RestaurantCard
                                restaurant={item}
                                onPress={onRestaurantPress}
                                variant="large"
                            />
                        </View>
                    )}
                    contentContainerStyle={[styles.listContent, { paddingBottom }]}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: SPACING.lg,
    },
    headerTitle: {
        fontSize: 28,
        fontFamily: 'Gargoyle',
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -50,
    },
    emptyText: {
        fontFamily: 'Gargoyle',
        fontSize: FONT_SIZES.xl,
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    emptySubtext: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
    },
    listContent: {
        // paddingBottom is handled dynamically
    },
    cardWrapper: {
        marginBottom: SPACING.lg,
        width: '100%',
        alignItems: 'center',
        // Let the heart glow extend slightly without being clipped by the list.
        overflow: 'visible',
    },
});

export default FavouritesScreen;
