import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const LocationHeader = ({ location, onPress, onNotifPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.headerIconBox} onPress={onPress}>
        <Image
          source={require('../../assets/location.png')}
          style={styles.locationIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.textContainer} onPress={onPress}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{location?.label || 'Current Location'}</Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </View>
        <Text style={styles.address}>
          {location?.address || 'Set your location'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.headerIconBox} onPress={onNotifPress}>
        <View style={styles.iconWrapper}>
          <Image
            source={require('../../assets/notif.png')}
            style={styles.notifIcon}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: 'transparent',
  },
  headerIconBox: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationIcon: {
    width: 42,
    height: 42,
  },
  notifIcon: {
    width: 42,
    height: 42,
  },
  iconWrapper: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    backgroundColor: COLORS.error,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.headerBox,
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontFamily: 'Saans-Medium',
  },
  dropdownIcon: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
  },
  address: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.locationText,
    fontFamily: 'Saans-Bold',
    marginTop: 2,
  },
});

export default LocationHeader;
