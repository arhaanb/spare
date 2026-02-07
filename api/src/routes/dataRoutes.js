const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Restaurant = require('../models/Restaurant');

// @route   GET /api/data/home
// @desc    Get all restaurant data for the home screen
// @access  Private
router.get('/home', protect, async (req, res) => {
    try {
        // Fetch all restaurants
        // The user wants "load once, filter local", so we send everything.
        const restaurants = await Restaurant.find({});

        res.json({
            success: true,
            count: restaurants.length,
            data: restaurants
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
