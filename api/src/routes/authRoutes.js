const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Session = require('../models/Session');

// @route   POST /api/auth/login
// @desc    Register a new session/token
// @access  Public
router.post('/login', async (req, res) => {
    const { token, deviceId } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    // DB Fallback
    if (mongoose.connection.readyState !== 1) {
        return res.status(201).json({
            message: 'Session created (Offline Mode)',
            session: { token, deviceId, isMock: true }
        });
    }

    try {
        let session = await Session.findOne({ token });

        if (session) {
            session.lastActive = Date.now();
            await session.save();
            return res.status(200).json({ message: 'Session refreshed', session });
        }

        session = await Session.create({
            token,
            deviceId
        });

        res.status(201).json({ message: 'Session created', session });
    } catch (error) {
        console.error(error);
        if (mongoose.connection.readyState !== 1) {
            return res.status(201).json({
                message: 'Session created (Offline Mode fallback)',
                session: { token, deviceId, isMock: true }
            });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
