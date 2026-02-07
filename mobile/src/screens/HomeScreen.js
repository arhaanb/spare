import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
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
  allFilteredRestaurants
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
      />

      {(searchQuery.length > 0 || selectedCategory) ? (
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

  const insets = useSafeAreaInsets();

  // Filter based on category AND search query
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
        r.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    return result;
  }, [selectedCategory, searchQuery]);

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
              handleFilterPress={() => console.log('Filter')}
              selectedCategory={selectedCategory}
              handleCategorySelect={handleCategorySelect}
              relevantRestaurants={relevantRestaurants}
              popularRestaurants={popularRestaurants}
              newlyAddedRestaurants={newlyAddedRestaurants}
              handleRestaurantPress={handleRestaurantPress}
              handleSeeAll={() => { }}
              allFilteredRestaurants={allFilteredRestaurants}
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
});

export default HomeScreen;
