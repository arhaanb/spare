const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
    id: String, // Composite ID from frontend
    bagOption: { type: mongoose.Schema.Types.Mixed }, // Store full object for simplicity or ref
    quantity: Number,
    preference: String,
    addedAt: Date
});

const CartSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true,
        unique: true // One cart per session
    },
    items: [CartItemSchema],
    restaurantId: Number, // Enforce single restaurant rule
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Cart', CartSchema);
