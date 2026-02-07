import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, TextInput, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStats } from '../context/StatsContext';
import SustainabilityBadges from '../components/SustainabilityBadges';
import LocationBottomSheet from '../components/LocationBottomSheet';
import PaymentBottomSheet from '../components/PaymentBottomSheet';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Profile image placeholder (working URI)
const PROFILE_IMAGE_URI = 'https://arhaanb.com/new_me.jpeg';

const ProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { signOut } = useAuth();
    const { hasActiveOrder, completeOrder } = useOrder();
    const { getCartItemCount, clearCart } = useCart();
    const { toggleFavorite, favorites } = useFavorites();
    const { stats, formatMoneySaved, resetStats } = useStats();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);

    // Bottom sheet refs
    const locationBottomSheetRef = useRef(null);
    const paymentBottomSheetRef = useRef(null);
    const editProfileBottomSheetRef = useRef(null);

    // User data state (for mock editing)
    const [userData, setUserData] = useState({
        name: 'Arhaan Bahadur',
        email: 'hi@arhaanb.com',
        phone: '+91 98765 43210',
    });

    // Temp state for editing
    const [editData, setEditData] = useState({ ...userData });

    const paddingBottom = 100 + (getCartItemCount() > 0 ? 72 : 0) + (hasActiveOrder ? 72 : 0);

    // Snap points for edit profile sheet
    const editProfileSnapPoints = useMemo(() => ['75%'], []);

    const handleOpenLocationSheet = useCallback(() => {
        locationBottomSheetRef.current?.present();
    }, []);

    const handleOpenPaymentSheet = useCallback(() => {
        paymentBottomSheetRef.current?.present();
    }, []);

    const handleOpenEditProfile = useCallback(() => {
        setEditData({ ...userData });
        editProfileBottomSheetRef.current?.present();
    }, [userData]);

    const handleSelectLocation = useCallback((location) => {
        setSelectedLocation(location);
        Alert.alert('Address Selected', `Selected: ${location.label || location.address}`);
    }, []);

    const handleSelectPayment = useCallback((payment) => {
        setSelectedPayment(payment);
        Alert.alert('Payment Method', `Selected: ${payment.label}`);
    }, []);

    const handleSaveProfile = useCallback(() => {
        setUserData({ ...editData });
        editProfileBottomSheetRef.current?.dismiss();
        Alert.alert('Success', 'Profile updated successfully!');
    }, [editData]);

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.4}
            >
                <BlurView
                    intensity={40}
                    tint="dark"
                    style={StyleSheet.absoluteFill}
                />
            </BottomSheetBackdrop>
        ),
        []
    );

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

                            // Reset stats
                            await resetStats();

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

    const handleMenuPress = (item) => {
        if (item === 'order_history') {
            Alert.alert('Order History', `You have rescued ${stats.bagsRescued} bags so far! 🌿`);
        } else if (item === 'notifications') {
            navigation.navigate('Notifications');
        } else if (item === 'addresses') {
            handleOpenLocationSheet();
        } else if (item === 'help') {
            Alert.alert('Help & Support', 'Contact us at support@spare.app or call +91 98765 43210');
        } else if (item === 'about') {
            Alert.alert('About Spare', 'Version 1.0.0\nHelping reduce food waste, one bag at a time! 🌍');
        } else if (item === 'payment') {
            handleOpenPaymentSheet();
        }
    };

    const MenuItem = ({ icon, label, onPress, color = COLORS.textPrimary, showBorder = true, badge }) => (
        <TouchableOpacity
            style={[styles.menuItem, !showBorder && styles.noBorder]}
            onPress={onPress}
        >
            <View style={styles.menuIconContainer}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <Text style={[styles.menuText, { color }]}>{label}</Text>
            {badge && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                </View>
            )}
            <Ionicons name="chevron-forward" size={18} color={color === COLORS.error ? color : COLORS.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <>
            <ScrollView
                style={[styles.container, { paddingTop: insets.top + SPACING.xl }]}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.headerTitle}>Profile</Text>

                {/* Profile Card with Image */}
                <View style={styles.profileCard}>
                    <View style={styles.profileImageContainer}>
                        <Image
                            source={{ uri: PROFILE_IMAGE_URI }}
                            style={styles.profileImage}
                        />
                        <TouchableOpacity style={styles.editImageButton} onPress={handleOpenEditProfile}>
                            <Ionicons name="camera" size={14} color={COLORS.background} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.name}>{userData.name}</Text>
                        <Text style={styles.email}>{userData.email}</Text>
                        <Text style={styles.phone}>{userData.phone}</Text>
                    </View>
                    <TouchableOpacity style={styles.editButton} onPress={handleOpenEditProfile}>
                        <Ionicons name="create-outline" size={20} color={COLORS.primaryAccent} />
                    </TouchableOpacity>
                </View>

                {/* Quick Stats */}
                <View style={styles.quickStats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.bagsRescued}</Text>
                        <Text style={styles.statLabel}>Bags Rescued</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{favorites.length}</Text>
                        <Text style={styles.statLabel}>Favourites</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{formatMoneySaved()}</Text>
                        <Text style={styles.statLabel}>Saved</Text>
                    </View>
                </View>

                {/* Orders Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Orders</Text>

                    {hasActiveOrder && (
                        <MenuItem
                            icon="timer"
                            label="Active Order"
                            onPress={() => navigation.navigate('OrderConfirmation')}
                            color={COLORS.activeCategory}
                            badge="1"
                        />
                    )}

                    <MenuItem
                        icon="receipt-outline"
                        label="Order History"
                        onPress={() => handleMenuPress('order_history')}
                        badge={stats.bagsRescued > 0 ? String(stats.bagsRescued) : null}
                    />
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <MenuItem
                        icon="notifications-outline"
                        label="Notifications"
                        onPress={() => handleMenuPress('notifications')}
                    />

                    <MenuItem
                        icon="location-outline"
                        label="Saved Addresses"
                        onPress={() => handleMenuPress('addresses')}
                    />

                    <MenuItem
                        icon="card-outline"
                        label="Payment Methods"
                        onPress={() => handleMenuPress('payment')}
                    />
                </View>

                {/* Sustainability Impact Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Impact</Text>
                    <SustainabilityBadges
                        moneySaved={stats.moneySaved}
                        carbonOffset={stats.carbonOffset}
                        foodSaved={stats.foodSaved}
                    />
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>

                    <MenuItem
                        icon="help-circle-outline"
                        label="Help & Support"
                        onPress={() => handleMenuPress('help')}
                    />

                    <MenuItem
                        icon="information-circle-outline"
                        label="About Spare"
                        onPress={() => handleMenuPress('about')}
                    />
                </View>

                {/* Logout */}
                <View style={[styles.section, { marginBottom: paddingBottom }]}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? (
                            <ActivityIndicator size="small" color={COLORS.error} />
                        ) : (
                            <>
                                <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
                                <Text style={styles.logoutText}>Log Out</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Edit Profile Bottom Sheet */}
            <BottomSheetModal
                ref={editProfileBottomSheetRef}
                index={0}
                snapPoints={editProfileSnapPoints}
                backdropComponent={renderBackdrop}
                backgroundStyle={styles.bottomSheetBackground}
                handleIndicatorStyle={styles.indicator}
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore"
            >
                <BottomSheetView style={[styles.editSheetContent, { paddingBottom: insets.bottom + SPACING.lg }]}>
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>Edit Profile</Text>
                        <TouchableOpacity onPress={() => editProfileBottomSheetRef.current?.dismiss()}>
                            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.editProfileImageContainer}>
                        <Image
                            source={{ uri: PROFILE_IMAGE_URI }}
                            style={styles.editProfileImage}
                        />
                        <TouchableOpacity style={styles.changePhotoButton}>
                            <Ionicons name="camera" size={20} color={COLORS.background} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Name</Text>
                        <BottomSheetTextInput
                            style={styles.input}
                            value={editData.name}
                            onChangeText={(text) => setEditData({ ...editData, name: text })}
                            placeholder="Enter your name"
                            placeholderTextColor={COLORS.textSecondary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <BottomSheetTextInput
                            style={styles.input}
                            value={editData.email}
                            onChangeText={(text) => setEditData({ ...editData, email: text })}
                            placeholder="Enter your email"
                            placeholderTextColor={COLORS.textSecondary}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Phone</Text>
                        <BottomSheetTextInput
                            style={styles.input}
                            value={editData.phone}
                            onChangeText={(text) => setEditData({ ...editData, phone: text })}
                            placeholder="Enter your phone"
                            placeholderTextColor={COLORS.textSecondary}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                </BottomSheetView>
            </BottomSheetModal>

            {/* Location Bottom Sheet */}
            <LocationBottomSheet
                ref={locationBottomSheetRef}
                onSelectLocation={handleSelectLocation}
                selectedLocation={selectedLocation}
            />

            {/* Payment Bottom Sheet */}
            <PaymentBottomSheet
                ref={paymentBottomSheetRef}
                onSelectPayment={handleSelectPayment}
                selectedPayment={selectedPayment}
            />
        </>
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
        marginBottom: SPACING.lg,
    },
    profileImageContainer: {
        position: 'relative',
        marginRight: SPACING.md,
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: COLORS.primaryAccent,
    },
    editImageButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.primaryAccent,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.headerBox,
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        fontFamily: 'Gargoyle',
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    email: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    phone: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    editButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickStats: {
        flexDirection: 'row',
        backgroundColor: COLORS.headerBox,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.xl,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontFamily: 'Gargoyle',
        fontSize: FONT_SIZES.xl,
        color: COLORS.primaryAccent,
        marginBottom: 2,
    },
    statLabel: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.xs,
        color: COLORS.textSecondary,
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: SPACING.xs,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontFamily: 'Gargoyle',
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    noBorder: {
        borderBottomWidth: 0,
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.headerBox,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    menuText: {
        flex: 1,
        fontFamily: 'Saans-Medium',
        fontSize: FONT_SIZES.md,
        color: COLORS.textPrimary,
    },
    badge: {
        backgroundColor: COLORS.primaryAccent,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginRight: SPACING.sm,
    },
    badgeText: {
        fontFamily: 'Saans-Medium',
        fontSize: FONT_SIZES.xs,
        color: COLORS.background,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.error,
        gap: SPACING.sm,
        marginBottom: 10,
    },
    logoutText: {
        fontFamily: 'Saans-Medium',
        fontSize: FONT_SIZES.md,
        color: COLORS.error,
    },
    // Bottom Sheet Styles
    bottomSheetBackground: {
        backgroundColor: 'rgba(15, 58, 40, 0.95)',
        borderTopLeftRadius: BORDER_RADIUS.xxl,
        borderTopRightRadius: BORDER_RADIUS.xxl,
    },
    indicator: {
        backgroundColor: COLORS.borderLight,
        width: 40,
    },
    editSheetContent: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.sm,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    sheetTitle: {
        fontFamily: 'Gargoyle',
        fontSize: FONT_SIZES.xl,
        color: COLORS.textPrimary,
    },
    editProfileImageContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    editProfileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primaryAccent,
    },
    changePhotoButton: {
        position: 'absolute',
        bottom: 0,
        right: SCREEN_WIDTH / 2 - 50 - 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primaryAccent,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(15, 58, 40, 0.95)',
    },
    inputGroup: {
        marginBottom: SPACING.lg,
    },
    inputLabel: {
        fontFamily: 'Saans-Medium',
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    input: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.md,
        color: COLORS.textPrimary,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    saveButton: {
        backgroundColor: COLORS.primaryAccent,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        marginTop: SPACING.md,
    },
    saveButtonText: {
        fontFamily: 'Saans-Medium',
        fontSize: FONT_SIZES.md,
        color: COLORS.background,
    },
});

export default ProfileScreen;
