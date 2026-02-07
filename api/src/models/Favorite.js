const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    restaurantId: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure unique favorita per session/restaurant
FavoriteSchema.index({ session: 1, restaurantId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
