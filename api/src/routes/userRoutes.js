const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Favorite = require('../models/Favorite');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Stats = require('../models/Stats');

// In-memory fallback storage
const mockStore = {
    favorites: {},
    carts: {},
    orders: [],
    stats: {}
};

// ==========================================
// FAVORITES
// ==========================================

// @route   GET /api/user/favorites
// @desc    Get user favorites
// @access  Private
router.get('/favorites', protect, async (req, res) => {
    try {
        const favorites = await Favorite.find({ session: req.session._id });
        res.json({ success: true, data: favorites.map(f => f.restaurantId) });
    } catch (error) {
        console.error('Get Favorites Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/user/favorites/:restaurantId
// @desc    Add favorite
// @access  Private
router.post('/favorites/:restaurantId', protect, async (req, res) => {
    try {
        const restaurantId = parseInt(req.params.restaurantId);

        // Check if exists
        let favorite = await Favorite.findOne({
            session: req.session._id,
            restaurantId
        });

        if (!favorite) {
            favorite = await Favorite.create({
                session: req.session._id,
                restaurantId
            });
        }

        res.json({ success: true, data: favorite });
    } catch (error) {
        console.error('Add Favorite Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   DELETE /api/user/favorites/:restaurantId
// @desc    Remove favorite
// @access  Private
router.delete('/favorites/:restaurantId', protect, async (req, res) => {
    try {
        const restaurantId = parseInt(req.params.restaurantId);

        if (mongoose.connection.readyState !== 1) {
            const token = req.session.token;
            if (!mockStore.favorites[token]) return res.json({ success: true, message: 'Removed (Mock)' });

            const existingIndex = mockStore.favorites[token].findIndex(f => f.restaurant.id === restaurantId);
            if (existingIndex > -1) {
                mockStore.favorites[token].splice(existingIndex, 1);
            }
            return res.json({ success: true, message: 'Removed (Mock)' });
        }

        await Favorite.findOneAndDelete({
            session: req.session._id,
            restaurant: restaurantId // Changed from restaurantId to match schema usually, or check schema
        });

        res.json({ success: true, message: 'Removed' });
    } catch (error) {
        console.error('Remove Favorite Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/user/favorites
// @desc    Toggle favorite
// @access  Private
router.post('/favorites', protect, async (req, res) => {
    const { restaurantId } = req.body;

    if (mongoose.connection.readyState !== 1) {
        const token = req.session.token;
        if (!mockStore.favorites[token]) mockStore.favorites[token] = [];

        const existingIndex = mockStore.favorites[token].findIndex(f => f.restaurant.id === restaurantId);
        if (existingIndex > -1) {
            mockStore.favorites[token].splice(existingIndex, 1);
            return res.json({ success: true, isFavorite: false });
        } else {
            mockStore.favorites[token].push({ restaurant: { id: restaurantId }, session: 'mock' });
            return res.json({ success: true, isFavorite: true });
        }
    }

    try {
        const existing = await Favorite.findOne({ session: req.session._id, restaurant: restaurantId });

        if (existing) {
            await existing.deleteOne();
            return res.json({ success: true, isFavorite: false });
        } else {
            await Favorite.create({
                session: req.session._id,
                restaurant: restaurantId
            });
            return res.json({ success: true, isFavorite: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==========================================
// CART
// ==========================================

// @route   GET /api/user/cart
// @desc    Get user cart
// @access  Private
router.get('/cart', protect, async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.json({ success: true, data: mockStore.carts[req.session.token] || { items: [] } });
    }
    try {
        let cart = await Cart.findOne({ session: req.session._id });
        if (!cart) {
            return res.json({ success: true, data: { items: [] } });
        }
        res.json({ success: true, data: cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/user/cart
// @desc    Update cart items
// @access  Private
router.post('/cart', protect, async (req, res) => {
    const { items, restaurantId } = req.body;

    if (mongoose.connection.readyState !== 1) {
        mockStore.carts[req.session.token] = { items, restaurant: { id: restaurantId } };
        return res.json({ success: true, data: mockStore.carts[req.session.token] });
    }

    try {
        let cart = await Cart.findOne({ session: req.session._id });

        if (!cart) {
            cart = await Cart.create({
                session: req.session._id,
                restaurant: restaurantId,
                items
            });
        } else {
            cart.items = items;
            cart.restaurant = restaurantId;
            cart.lastUpdated = Date.now();
            await cart.save();
        }

        res.json({ success: true, data: cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==========================================
// ORDERS
// ==========================================

// @route   POST /api/user/order
// @desc    Create new order
// @access  Private
router.post('/order', protect, async (req, res) => {
    const { items, total, restaurantId } = req.body;
    if (mongoose.connection.readyState !== 1) {
        const mockOrder = {
            orderCode: Math.random().toString(36).substring(7).toUpperCase(),
            status: 'active',
            items, total, restaurant: restaurantId,
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000)
        };
        mockStore.orders.push(mockOrder);
        return res.json({ success: true, data: mockOrder });
    }

    try {
        const order = await Order.create({
            session: req.session._id,
            items,
            total,
            restaurant: restaurantId,
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
        });

        // Clear cart
        await Cart.findOneAndDelete({ session: req.session._id });

        res.json({ success: true, data: order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/user/order/active
// @desc    Get active user order
// @access  Private
router.get('/order/active', protect, async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        // Return last active mock order
        const order = mockStore.orders[mockStore.orders.length - 1]; // Simply return last
        return res.json({ success: true, data: order || null });
    }
    try {
        const order = await Order.findOne({
            session: req.session._id,
            status: 'active',
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        res.json({ success: true, data: order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// ==========================================
// STATS
// ==========================================

// @route   GET /api/user/stats
// @desc    Get user stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.json({ success: true, data: mockStore.stats[req.session.token] || {} });
    }

    try {
        const stats = await Stats.findOne({ session: req.session._id });
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/user/stats
// @desc    Update user stats
// @access  Private
router.post('/stats', protect, async (req, res) => {
    const { bagsRescued, moneySaved, carbonOffset, foodSaved, ordersCount } = req.body;

    if (mongoose.connection.readyState !== 1) {
        mockStore.stats[req.session.token] = {
            bagsRescued, moneySaved, carbonOffset, foodSaved, ordersCount,
            lastUpdated: Date.now()
        };
        return res.json({ success: true, data: mockStore.stats[req.session.token] });
    }

    try {
        let stats = await Stats.findOne({ session: req.session._id });

        if (stats) {
            stats.bagsRescued = bagsRescued;
            stats.moneySaved = moneySaved;
            stats.carbonOffset = carbonOffset;
            stats.foodSaved = foodSaved;
            stats.ordersCount = ordersCount;
            stats.lastUpdated = Date.now();
            await stats.save();
        } else {
            stats = await Stats.create({
                session: req.session._id,
                bagsRescued,
                moneySaved,
                carbonOffset,
                foodSaved,
                ordersCount
            });
        }

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
