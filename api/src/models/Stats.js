const mongoose = require('mongoose');

const StatsSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true,
        unique: true
    },
    bagsRescued: { type: Number, default: 0 },
    moneySaved: { type: Number, default: 0 },
    carbonOffset: { type: Number, default: 0 },
    foodSaved: { type: Number, default: 0 },
    ordersCount: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Stats', StatsSchema);
