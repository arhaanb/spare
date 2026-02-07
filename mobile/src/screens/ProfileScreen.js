import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SustainabilityBadges from '../components/SustainabilityBadges';

// Mocked user data
const USER_DATA = {
    name: 'Arhaan Bahadur',
    email: 'hi@arhaanb.com',
    phone: '+91 98765 43210',
    profileImage: 'https://arhaanb.com/me.jpeg',
};

// Mocked user sustainability totals
const USER_SUSTAINABILITY_TOTALS = {
    moneySaved: 2348,
    carbonOffset: 12.4,
    foodSaved: 2.4,
};

const ProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { signOut } = useAuth();
    const { hasActiveOrder, completeOrder } = useOrder();
    const { getCartItemCount, clearCart } = useCart();
    const { toggleFavorite, favorites } = useFavorites();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const paddingBottom = 100 + (getCartItemCount() > 0 ? 72 : 0) + (hasActiveOrder ? 72 : 0);

    const handleLogout = async () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out? Your cart and active order will be cleared.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoggingOut(true);
                        try {
                            // Clear all contexts
                            clearCart();
                            await completeOrder();
                            
                            // Clear all favorites
                            favorites.forEach(id => toggleFavorite(id));

                            // Clear all AsyncStorage keys
                            await AsyncStorage.multiRemove([
                                'spare.auth.v1',
                                '@active_order',
                                '@cart',
                                '@favorites',
                            ]);

                            // Sign out (will update auth state)
                            signOut();
                        } catch (error) {
                            console.error('Error during logout:', error);
                            Alert.alert('Error', 'Failed to log out. Please try again.');
                        } finally {
                            setIsLoggingOut(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView
            style={[styles.container, { paddingTop: insets.top + SPACING.xl }]}
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.headerTitle}>Profile</Text>

            <View style={styles.profileCard}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>AB</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.name}>Arhaan Bahadur</Text>
                    <Text style={styles.email}>hi@arhaanb.com</Text>
                </View>
            </View>


            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>

                {hasActiveOrder && (
                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomColor: COLORS.activeCategory }]}
                        onPress={() => navigation.navigate('OrderConfirmation')}
                    >
                        <Ionicons name="receipt" size={24} color={COLORS.activeCategory} />
                        <Text style={[styles.menuText, { color: COLORS.activeCategory }]}>Active Order</Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.activeCategory} />
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="settings-outline" size={24} color={COLORS.textPrimary} />
                    <Text style={styles.menuText}>Settings</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="card-outline" size={24} color={COLORS.textPrimary} />
                    <Text style={styles.menuText}>Payment Methods</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.menuItem, styles.logoutMenuItem]} 
                    onPress={handleLogout}
                    disabled={isLoggingOut}
                >
                    <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
                    <Text style={[styles.menuText, styles.logoutMenuText]}>Log Out</Text>
                    {isLoggingOut ? (
                        <ActivityIndicator size="small" color={COLORS.error} />
                    ) : (
                        <Ionicons name="chevron-forward" size={20} color={COLORS.error} />
                    )}
                </TouchableOpacity>
            </View>


            {/* Sustainability Impact Section */}
            <View style={[styles.section, { marginBottom: paddingBottom }]}>
                <Text style={styles.sectionTitle}>Your Impact</Text>
                <SustainabilityBadges
                    moneySaved={USER_SUSTAINABILITY_TOTALS.moneySaved}
                    carbonOffset={USER_SUSTAINABILITY_TOTALS.carbonOffset}
                    foodSaved={USER_SUSTAINABILITY_TOTALS.foodSaved}
                />
            </View>
        </ScrollView>
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
        marginBottom: SPACING.xl,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.headerBox,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.xl,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primaryAccent,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    avatarText: {
        fontFamily: 'Gargoyle',
        fontSize: 24,
        color: COLORS.background,
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        fontFamily: 'Gargoyle',
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    email: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontFamily: 'Gargoyle',
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    menuText: {
        flex: 1,
        fontFamily: 'Saans-Medium',
        fontSize: FONT_SIZES.md,
        color: COLORS.textPrimary,
        marginLeft: SPACING.md,
    },
    logoutMenuItem: {
        borderBottomWidth: 0,
        marginTop: SPACING.xs,
    },
    logoutMenuText: {
        color: COLORS.error,
    },
});

export default ProfileScreen;
