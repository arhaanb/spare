import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { notifications } from '../data/mockData';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

const NotificationItem = ({ item, index }) => {
    return (
        <Animated.View
            entering={FadeInDown.delay(index * 100).duration(400)}
            style={styles.notificationCard}
        >
            <View style={styles.iconContainer}>
                <Text style={styles.emojiIcon}>{item.icon}</Text>
            </View>
            <View style={styles.textContainer}>
                <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemTime}>{item.time}</Text>
                </View>
                <Text style={styles.itemMessage}>{item.message}</Text>
            </View>
        </Animated.View>
    );
};

const NotificationsScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {notifications.length > 0 ? (
                    notifications.map((item, index) => (
                        <NotificationItem key={item.id} item={item} index={index} />
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={64} color={COLORS.textSecondary} />
                        <Text style={styles.emptyText}>No notifications yet</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: 'Gargoyle',
        fontSize: 28,
        color: COLORS.textPrimary,
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.xxl,
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    emojiIcon: {
        fontSize: 24,
    },
    textContainer: {
        flex: 1,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    itemTitle: {
        fontFamily: 'Saans-SemiBold',
        fontSize: FONT_SIZES.md,
        color: COLORS.textPrimary,
        flex: 1,
        marginRight: SPACING.sm,
    },
    itemTime: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.xs,
        color: COLORS.textSecondary,
    },
    itemMessage: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.lg,
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
    },
});

export default NotificationsScreen;
