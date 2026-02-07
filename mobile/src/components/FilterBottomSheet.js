import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FilterChip = ({ label, active, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[styles.chip, active && styles.chipActive]}
    >
        <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
);

const FilterSection = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.chipContainer}>
            {children}
        </View>
    </View>
);

const FilterBottomSheet = React.forwardRef(({ filters, onApply, onReset }, ref) => {
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ['65%'], []);

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.6}
                style={[props.style, { backgroundColor: '#000' }]} // Darker backdrop
            />
        ),
        []
    );

    // Local state for filters could be managed here if we wanted "Apply" button logic logic
    // For now, we rely on the parent updating the state immediately as per previous design,
    // or we can wrap it if we want "Apply" only on button press. 
    // Given the previous design was immediate, let's keep it immediate but controlled.

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
                    <Text style={styles.title}>Filters</Text>
                    <TouchableOpacity onPress={onReset}>
                        <Text style={styles.resetText}>Reset</Text>
                    </TouchableOpacity>
                </View>

                <FilterSection title="Dietary">
                    <FilterChip
                        label="Veg Only"
                        active={filters.onlyVeg}
                        onPress={() => onApply({ onlyVeg: !filters.onlyVeg })}
                    />
                    <FilterChip
                        label="Available Now"
                        active={filters.availableOnly}
                        onPress={() => onApply({ availableOnly: !filters.availableOnly })}
                    />
                </FilterSection>

                <FilterSection title="Distance">
                    <FilterChip
                        label="Any"
                        active={filters.maxDistanceKm === null}
                        onPress={() => onApply({ maxDistanceKm: null })}
                    />
                    <FilterChip
                        label="< 2 km"
                        active={filters.maxDistanceKm === 2}
                        onPress={() => onApply({ maxDistanceKm: 2 })}
                    />
                    <FilterChip
                        label="< 5 km"
                        active={filters.maxDistanceKm === 5}
                        onPress={() => onApply({ maxDistanceKm: 5 })}
                    />
                </FilterSection>

                <FilterSection title="Minimum Rating">
                    <FilterChip
                        label="Any"
                        active={filters.minRating === null}
                        onPress={() => onApply({ minRating: null })}
                    />
                    <FilterChip
                        label="4.0+"
                        active={filters.minRating === 4}
                        onPress={() => onApply({ minRating: 4 })}
                    />
                    <FilterChip
                        label="4.5+"
                        active={filters.minRating === 4.5}
                        onPress={() => onApply({ minRating: 4.5 })}
                    />
                </FilterSection>

                <FilterSection title="Sort By">
                    <FilterChip
                        label="Relevance"
                        active={filters.sortBy === 'relevance'}
                        onPress={() => onApply({ sortBy: 'relevance' })}
                    />
                    <FilterChip
                        label="Top Rated"
                        active={filters.sortBy === 'rating'}
                        onPress={() => onApply({ sortBy: 'rating' })}
                    />
                    <FilterChip
                        label="Nearest"
                        active={filters.sortBy === 'distance'}
                        onPress={() => onApply({ sortBy: 'distance' })}
                    />
                    <FilterChip
                        label="Price (Low to High)"
                        active={filters.sortBy === 'priceAsc'}
                        onPress={() => onApply({ sortBy: 'priceAsc' })}
                    />
                </FilterSection>
            </BottomSheetView>
        </BottomSheetModal>
    );
});

const styles = StyleSheet.create({
    bottomSheetBackground: {
        backgroundColor: COLORS.surfaceStrong,
        borderTopLeftRadius: BORDER_RADIUS.xxl,
        borderTopRightRadius: BORDER_RADIUS.xxl,
    },
    indicator: {
        backgroundColor: COLORS.borderLight,
        width: 40,
    },
    contentContainer: {
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    resetText: {
        fontSize: FONT_SIZES.md,
        fontFamily: 'Saans-Medium',
        color: COLORS.activeCategory,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.sm,
        fontFamily: 'Saans-SemiBold',
        color: COLORS.textMuted,
        marginBottom: SPACING.md,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    chipActive: {
        backgroundColor: COLORS.activeCategory,
        borderColor: COLORS.activeCategory,
    },
    chipText: {
        fontSize: FONT_SIZES.sm,
        fontFamily: 'Saans-Medium',
        color: COLORS.textPrimary,
    },
    chipTextActive: {
        color: COLORS.background,
        fontFamily: 'Saans-SemiBold',
    },
});

export default FilterBottomSheet;
