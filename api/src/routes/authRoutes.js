const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

// @route   POST /api/auth/login
// @desc    Register a new session/token
// @access  Public
router.post('/login', async (req, res) => {
    const { token, deviceId } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    try {
        // Check if session already exists
        let session = await Session.findOne({ token });

        if (session) {
            // Update last active
            session.lastActive = Date.now();
            await session.save();
            return res.status(200).json({ message: 'Session refreshed', session });
        }

        // Create new session
        session = await Session.create({
            token,
            deviceId
        });

        res.status(201).json({ message: 'Session created', session });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
