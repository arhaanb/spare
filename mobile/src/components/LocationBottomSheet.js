import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { userLocation, savedLocations } from '../data/mockData';

const LocationItem = ({ label, address, icon, isActive, onPress }) => (
    <TouchableOpacity
        style={[styles.locationItem, isActive && styles.locationItemActive]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
            <Ionicons
                name={icon}
                size={22}
                color={isActive ? COLORS.background : COLORS.activeCategory}
            />
        </View>
        <View style={styles.locationInfo}>
            <Text style={[styles.locationLabel, isActive && styles.locationLabelActive]}>{label}</Text>
            <Text style={styles.locationAddress} numberOfLines={1}>{address}</Text>
        </View>
        {isActive && (
            <Ionicons name="checkmark-circle" size={20} color={COLORS.activeCategory} />
        )}
    </TouchableOpacity>
);

const LocationBottomSheet = React.forwardRef(({ onSelectLocation, selectedLocation }, ref) => {
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ['50%', '75%'], []);

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

    const handleSelect = (location) => {
        if (onSelectLocation) {
            onSelectLocation(location);
        }
        ref.current?.dismiss();
    };

    return (
        <BottomSheetModal
            ref={ref}
            index={0}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            backgroundStyle={styles.bottomSheetBackground}
            handleIndicatorStyle={styles.indicator}
        >
            <BottomSheetView style={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}>
                <View style={styles.header}>
                    <Text style={styles.title}>Select Location</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    <Text style={styles.sectionTitle}>Current Location</Text>
                    <LocationItem
                        label="Use Current Location"
                        address={userLocation.address}
                        icon="navigate"
                        isActive={!selectedLocation || selectedLocation.label === 'Current Location'}
                        onPress={() => handleSelect(userLocation)}
                    />

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Saved Locations</Text>
                    {savedLocations.map((loc) => (
                        <LocationItem
                            key={loc.id}
                            label={loc.label}
                            address={loc.address}
                            icon={loc.icon === 'home' ? 'home' : loc.icon === 'work' ? 'briefcase' : 'heart'}
                            isActive={selectedLocation?.id === loc.id}
                            onPress={() => handleSelect(loc)}
                        />
                    ))}

                    <TouchableOpacity style={styles.addNewButton}>
                        <Ionicons name="add" size={20} color={COLORS.activeCategory} />
                        <Text style={styles.addNewText}>Add New Address</Text>
                    </TouchableOpacity>

                </ScrollView>
            </BottomSheetView>
        </BottomSheetModal>
    );
});

const styles = StyleSheet.create({
    bottomSheetBackground: {
        backgroundColor: 'rgba(15, 58, 40, 0.95)',
        borderTopLeftRadius: BORDER_RADIUS.xxl,
        borderTopRightRadius: BORDER_RADIUS.xxl,
    },
    indicator: {
        backgroundColor: COLORS.borderLight,
        width: 40,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.sm,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    title: {
        fontSize: FONT_SIZES.xl,
        fontFamily: 'Gargoyle',
        color: COLORS.textPrimary,
    },
    scrollContent: {
        paddingBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.sm,
        fontFamily: 'Saans-SemiBold',
        color: COLORS.textMuted,
        marginBottom: SPACING.md,
        marginTop: SPACING.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    locationItemActive: {
        borderColor: COLORS.activeCategory,
        backgroundColor: 'rgba(198, 240, 77, 0.1)',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(198, 240, 77, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    iconBoxActive: {
        backgroundColor: COLORS.activeCategory,
    },
    locationInfo: {
        flex: 1,
        marginRight: SPACING.sm,
    },
    locationLabel: {
        fontSize: FONT_SIZES.md,
        fontFamily: 'Saans-Bold',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    locationLabelActive: {
        color: COLORS.activeCategory,
    },
    locationAddress: {
        fontSize: FONT_SIZES.sm,
        fontFamily: 'Saans',
        color: COLORS.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: SPACING.sm,
        marginBottom: SPACING.md,
    },
    addNewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.activeCategory,
        borderStyle: 'dashed',
        borderRadius: BORDER_RADIUS.lg,
        marginTop: SPACING.sm,
        gap: SPACING.xs,
    },
    addNewText: {
        fontSize: FONT_SIZES.md,
        fontFamily: 'Saans-Medium',
        color: COLORS.activeCategory,
    },
});

export default LocationBottomSheet;
