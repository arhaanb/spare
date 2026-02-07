import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { signOut } = useAuth();
    const { hasActiveOrder } = useOrder();
    const { getCartItemCount } = useCart();

    const paddingBottom = 100 + (getCartItemCount() > 0 ? 72 : 0) + (hasActiveOrder ? 72 : 0);

    return (
        <View style={[styles.container, { paddingTop: insets.top + SPACING.xl }]}>
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
            </View>

            <TouchableOpacity style={[styles.logoutButton, { marginBottom: paddingBottom }]} onPress={signOut}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
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
    logoutButton: {
        paddingVertical: SPACING.md,
        alignItems: 'center',
        marginTop: 'auto',
        // marginBottom is handled dynamically
    },
    logoutText: {
        fontFamily: 'Saans-Bold',
        fontSize: FONT_SIZES.md,
        color: COLORS.error,
    },
});

export default ProfileScreen;
