const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
    id: String,
    bagOption: { type: mongoose.Schema.Types.Mixed },
    quantity: Number,
    preference: String,
    addedAt: Date
});

const CartSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true,
        unique: true
    },
    items: [CartItemSchema],
    restaurantId: Number,
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Cart', CartSchema);
