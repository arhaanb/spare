const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const Restaurant = require('../models/Restaurant');
const fs = require('fs');
const path = require('path');

// Helper to get mock data
const getMockData = () => {
    try {
        // Try to read from mobile mockData if accessible, or just return empty/basic
        // For simplicity and speed, let's try to read the same way seed.js does, or just return an empty list 
        // and let the client fall back to its own mock data (since we implemented client fallback).
        // Actually, client fallback works if data.data is empty.
        // So returning [] is fine.
        return [];
    } catch (e) {
        return [];
    }
}

// @route   GET /api/data/home
// @desc    Get all restaurant data for the home screen
// @access  Private
router.get('/home', protect, async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json({
                success: true,
                count: 0,
                data: [],
                isMock: true
            });
        }

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
