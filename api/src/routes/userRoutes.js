const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Favorite = require('../models/Favorite');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

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

        await Favorite.findOneAndDelete({
            session: req.session._id,
            restaurantId
        });

        res.json({ success: true, message: 'Removed' });
    } catch (error) {
        console.error('Remove Favorite Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});


// ==========================================
// CART
// ==========================================

// @route   GET /api/user/cart
// @desc    Get user cart
// @access  Private
router.get('/cart', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ session: req.session._id });
        res.json({ success: true, data: cart || { items: [] } });
    } catch (error) {
        console.error('Get Cart Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/user/cart
// @desc    Sync/Update cart
// @access  Private
router.post('/cart', protect, async (req, res) => {
    try {
        const { items, restaurantId } = req.body;

        let cart = await Cart.findOne({ session: req.session._id });

        if (cart) {
            cart.items = items;
            cart.restaurantId = restaurantId;
            cart.lastUpdated = Date.now();
            await cart.save();
        } else {
            cart = await Cart.create({
                session: req.session._id,
                items,
                restaurantId
            });
        }

        res.json({ success: true, data: cart });
    } catch (error) {
        console.error('Update Cart Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ==========================================
// ORDERS
// ==========================================

// @route   GET /api/user/orders
// @desc    Get user orders (history)
// @access  Private
router.get('/orders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ session: req.session._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Get Orders Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/user/orders
// @desc    Create new order
// @access  Private
router.post('/orders', protect, async (req, res) => {
    try {
        const { orderCode, restaurantId, restaurantName, items, total, itemCount, expiresAt } = req.body;

        const order = await Order.create({
            session: req.session._id,
            orderCode,
            restaurantId,
            restaurantName,
            items,
            total,
            itemCount,
            expiresAt: new Date(expiresAt)
        });

        // Optionally clear cart? Usually yes.
        await Cart.findOneAndDelete({ session: req.session._id });

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
