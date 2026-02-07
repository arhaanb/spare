const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    orderCode: String,
    restaurantId: Number,
    restaurantName: String, // Snapshot name in case it changes
    items: [mongoose.Schema.Types.Mixed], // Array of items snapshot
    total: Number,
    itemCount: Number,
    status: {
        type: String,
        enum: ['active', 'completed', 'expired', 'cancelled'],
        default: 'active'
    },
    expiresAt: Date, // For pickup window
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', OrderSchema);
