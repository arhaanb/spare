import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { LocationHeader, CategoryFilter, RestaurantCard, SearchBar } from '../components';
import BottomTabBar from '../components/BottomTabBar';
import FavouritesScreen from './FavouritesScreen';
import ProfileScreen from './ProfileScreen';
import {
  categories,
  userLocation,
  restaurants,
  getRelevantRestaurants,
  getPopularRestaurants,
  getNewlyAddedRestaurants,
} from '../data/mockData';

const DEFAULT_FILTERS = {
  onlyVeg: false,
  availableOnly: true,
  maxDistanceKm: null, // null | number
  minRating: null, // null | number
  sortBy: 'relevance', // relevance | rating | distance | priceAsc
};

const FilterChip = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    style={[styles.filterChip, active && styles.filterChipActive]}
  >
    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const FilterSheet = ({ visible, onClose, filters, onChange, onReset, insets }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={styles.sheetOverlay} onPress={onClose} />
    <View style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      <View style={styles.sheetGrabber} />
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>Filters</Text>
        <TouchableOpacity onPress={onReset} activeOpacity={0.8}>
          <Text style={styles.sheetReset}>Reset</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sheetSectionTitle}>Diet</Text>
      <View style={styles.sheetRow}>
        <FilterChip
          label="Veg Only"
          active={filters.onlyVeg}
          onPress={() => onChange({ onlyVeg: !filters.onlyVeg })}
        />
        <FilterChip
          label="Available Now"
          active={filters.availableOnly}
          onPress={() => onChange({ availableOnly: !filters.availableOnly })}
        />
      </View>

      <Text style={styles.sheetSectionTitle}>Distance</Text>
      <View style={styles.sheetRow}>
        <FilterChip
          label="Any"
          active={filters.maxDistanceKm === null}
          onPress={() => onChange({ maxDistanceKm: null })}
        />
        <FilterChip
          label="< 2 km"
          active={filters.maxDistanceKm === 2}
          onPress={() => onChange({ maxDistanceKm: 2 })}
        />
        <FilterChip
          label="< 5 km"
          active={filters.maxDistanceKm === 5}
          onPress={() => onChange({ maxDistanceKm: 5 })}
        />
      </View>

      <Text style={styles.sheetSectionTitle}>Minimum Rating</Text>
      <View style={styles.sheetRow}>
        <FilterChip
          label="Any"
          active={filters.minRating === null}
          onPress={() => onChange({ minRating: null })}
        />
        <FilterChip
          label="4.0+"
          active={filters.minRating === 4}
          onPress={() => onChange({ minRating: 4 })}
        />
        <FilterChip
          label="4.5+"
          active={filters.minRating === 4.5}
          onPress={() => onChange({ minRating: 4.5 })}
        />
      </View>

      <Text style={styles.sheetSectionTitle}>Sort</Text>
      <View style={styles.sheetRow}>
        <FilterChip
          label="Relevance"
          active={filters.sortBy === 'relevance'}
          onPress={() => onChange({ sortBy: 'relevance' })}
        />
        <FilterChip
          label="Top Rated"
          active={filters.sortBy === 'rating'}
          onPress={() => onChange({ sortBy: 'rating' })}
        />
        <FilterChip
          label="Nearest"
          active={filters.sortBy === 'distance'}
          onPress={() => onChange({ sortBy: 'distance' })}
        />
        <FilterChip
          label="Lowest Price"
          active={filters.sortBy === 'priceAsc'}
          onPress={() => onChange({ sortBy: 'priceAsc' })}
        />
      </View>
    </View>
  </Modal>
);

const SectionHeader = ({ title, onSeeAll }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={styles.seeAllText}>See all</Text>
      </TouchableOpacity>
    )}
  </View>
);

const RestaurantSection = ({ title, restaurants: restaurantList, onRestaurantPress, onSeeAll }) => (
  <View style={styles.section}>
    <SectionHeader title={title} onSeeAll={onSeeAll} />
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalScrollContent}
    >
      {restaurantList.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          onPress={onRestaurantPress}
        />
      ))}
    </ScrollView>
  </View>
);

const HomeContent = ({
  insets,
  searchQuery,
  setSearchQuery,
  handleFilterPress,
  selectedCategory,
  handleCategorySelect,
  relevantRestaurants,
  popularRestaurants,
  newlyAddedRestaurants,
  handleRestaurantPress,
  handleSeeAll,
  allFilteredRestaurants,
  hasActiveFilters,
  activeFiltersCount,
}) => {
  return (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: insets.top + SPACING.sm }
      ]}
    >
      <LocationHeader
        location={userLocation}
        onPress={() => console.log('Location pressed')}
      />

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFilterPress={handleFilterPress}
        activeFiltersCount={activeFiltersCount}
      />

      {(searchQuery.length > 0 || selectedCategory || hasActiveFilters) ? (
        // Grid View for Search/Category Results
        <Animated.View
          key="grid"
          style={styles.section}
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(160)}
          layout={Layout.springify().damping(18).stiffness(180)}
        >
          <View style={{ marginLeft: SPACING.lg, marginBottom: SPACING.md }}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? 'Search Results' : 'Available Restaurants'}
            </Text>
            {selectedCategory && !searchQuery && (
              <Text style={styles.categorySubtitle}>
                in <Text style={{ color: COLORS.primaryAccent, fontWeight: '700' }}>
                  {categories.find(c => c.id === selectedCategory)?.name}
                </Text>
              </Text>
            )}
          </View>
          {allFilteredRestaurants.length > 0 ? (
            <View style={styles.gridContainer}>
              {allFilteredRestaurants.map((restaurant) => (
                <Animated.View
                  key={restaurant.id}
                  style={styles.gridItem}
                  layout={Layout.springify().damping(18).stiffness(180)}
                  entering={FadeIn.duration(180)}
                  exiting={FadeOut.duration(140)}
                >
                  <RestaurantCard
                    restaurant={restaurant}
                    onPress={handleRestaurantPress}
                    variant="grid"
                  />
                </Animated.View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              No restaurants found.
            </Text>
          )}
        </Animated.View>
      ) : (
        // Standard Home View
        <Animated.View
          key="home"
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(160)}
          layout={Layout.springify().damping(18).stiffness(180)}
        >
          {relevantRestaurants.length > 0 && (
            <RestaurantSection
              title="Most Relevant"
              restaurants={relevantRestaurants}
              onRestaurantPress={handleRestaurantPress}
              onSeeAll={() => handleSeeAll('relevant')}
            />
          )}

          {popularRestaurants.length > 0 && (
            <RestaurantSection
              title="Most Popular Near You"
              restaurants={popularRestaurants}
              onRestaurantPress={handleRestaurantPress}
              onSeeAll={() => handleSeeAll('popular')}
            />
          )}

          {newlyAddedRestaurants.length > 0 && (
            <RestaurantSection
              title="New Added Rescue Bags"
              restaurants={newlyAddedRestaurants}
              onRestaurantPress={handleRestaurantPress}
              onSeeAll={() => handleSeeAll('new')}
            />
          )}
        </Animated.View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const HomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('explore');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const insets = useSafeAreaInsets();

  const hasActiveFilters = useMemo(() => (
    filters.onlyVeg !== DEFAULT_FILTERS.onlyVeg
    || filters.availableOnly !== DEFAULT_FILTERS.availableOnly
    || filters.maxDistanceKm !== DEFAULT_FILTERS.maxDistanceKm
    || filters.minRating !== DEFAULT_FILTERS.minRating
    || filters.sortBy !== DEFAULT_FILTERS.sortBy
  ), [filters]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.onlyVeg) count += 1;
    if (!filters.availableOnly) count += 1;
    if (filters.maxDistanceKm !== null) count += 1;
    if (filters.minRating !== null) count += 1;
    if (filters.sortBy !== 'relevance') count += 1;
    return count;
  }, [filters]);

  // Filter based on category, search query, and user-selected filters.
  const allFilteredRestaurants = useMemo(() => {
    let result = restaurants;

    // 1. Filter by Category
    if (selectedCategory) {
      result = result.filter(r => r.category === selectedCategory);
    }

    // 2. Filter by Search Query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(lowerQuery) ||
        r.location.toLowerCase().includes(lowerQuery) ||
        r.category.toLowerCase().includes(lowerQuery) ||
        r.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    if (filters.onlyVeg) {
      result = result.filter((r) => r.vegOnly);
    }

    if (filters.availableOnly) {
      result = result.filter((r) => r.isAvailable);
    }

    if (filters.maxDistanceKm !== null) {
      result = result.filter((r) => r.distance <= filters.maxDistanceKm);
    }

    if (filters.minRating !== null) {
      result = result.filter((r) => r.rating >= filters.minRating);
    }

    if (filters.sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === 'distance') {
      result = [...result].sort((a, b) => a.distance - b.distance);
    } else if (filters.sortBy === 'priceAsc') {
      result = [...result].sort((a, b) => {
        const aPrice = Math.min(...a.bagOptions.map((o) => o.price));
        const bPrice = Math.min(...b.bagOptions.map((o) => o.price));
        return aPrice - bPrice;
      });
    }

    return result;
  }, [selectedCategory, searchQuery, filters]);

  const relevantRestaurants = useMemo(() => {
    return getRelevantRestaurants(allFilteredRestaurants).slice(0, 6);
  }, [allFilteredRestaurants]);

  const popularRestaurants = useMemo(() => {
    return getPopularRestaurants(allFilteredRestaurants).slice(0, 6);
  }, [allFilteredRestaurants]);

  const newlyAddedRestaurants = useMemo(() => {
    return getNewlyAddedRestaurants(allFilteredRestaurants).slice(0, 6);
  }, [allFilteredRestaurants]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleRestaurantPress = (restaurant) => {
    navigation.navigate('RestaurantDetail', { restaurant });
  };

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'explore':
        return (
          <Animated.View entering={FadeIn.duration(300)} key="explore" style={styles.animatedContainer}>
            <HomeContent
              insets={insets}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleFilterPress={() => setFiltersOpen(true)}
              selectedCategory={selectedCategory}
              handleCategorySelect={handleCategorySelect}
              relevantRestaurants={relevantRestaurants}
              popularRestaurants={popularRestaurants}
              newlyAddedRestaurants={newlyAddedRestaurants}
              handleRestaurantPress={handleRestaurantPress}
              handleSeeAll={() => { }}
              allFilteredRestaurants={allFilteredRestaurants}
              hasActiveFilters={hasActiveFilters}
              activeFiltersCount={activeFiltersCount}
            />
          </Animated.View>
        );
      case 'favourites':
        return (
          <Animated.View entering={FadeIn.duration(300)} key="favourites" style={styles.animatedContainer}>
            <FavouritesScreen onRestaurantPress={handleRestaurantPress} />
          </Animated.View>
        );
      case 'profile':
        return (
          <Animated.View entering={FadeIn.duration(300)} key="profile" style={styles.animatedContainer}>
            <ProfileScreen />
          </Animated.View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {renderContent()}

      <FilterSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        insets={insets}
      />

      <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  animatedContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING.xxl,
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: 'Gargoyle',
  },
  seeAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
    fontFamily: 'Saans',
  },
  horizontalScrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  bottomPadding: {
    height: 100,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: SPACING.lg,
  },
  emptyText: {
    marginLeft: SPACING.lg,
    fontFamily: 'Saans',
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
  },
  categorySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontFamily: 'Saans',
    marginTop: 2,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlayStrong,
  },
  sheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.surfaceStrong,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
  },
  sheetGrabber: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.borderLight,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sheetTitle: {
    color: COLORS.textPrimary,
    fontFamily: 'Gargoyle',
    fontSize: FONT_SIZES.xxl,
  },
  sheetReset: {
    color: COLORS.activeCategory,
    fontFamily: 'Saans-SemiBold',
    fontSize: FONT_SIZES.sm,
  },
  sheetSectionTitle: {
    color: COLORS.textOnMuted,
    fontFamily: 'Saans-SemiBold',
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sheetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  filterChip: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  filterChipActive: {
    borderColor: COLORS.activeCategory,
    backgroundColor: COLORS.activeCategory,
  },
  filterChipText: {
    color: COLORS.textOnDark,
    fontFamily: 'Saans-Medium',
    fontSize: FONT_SIZES.sm,
  },
  filterChipTextActive: {
    color: COLORS.background,
    fontFamily: 'Saans-SemiBold',
  },
});

export default HomeScreen;
