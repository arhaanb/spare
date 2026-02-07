const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    deviceId: { type: String }, // Optional: to track unique devices if needed
    createdAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', SessionSchema);
