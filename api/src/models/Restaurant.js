const mongoose = require('mongoose');

const BagOptionSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    type: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    pickupStart: { type: String },
    pickupEnd: { type: String },
    available: { type: mongoose.Schema.Types.Mixed },
    unavailableFor: [{ type: String }]
});

const ItemSchema = new mongoose.Schema({
    id: String,
    name: String,
    category: String,
    price: Number
});

const RescueItemsSchema = new mongoose.Schema({
    veg: [ItemSchema],
    nonveg: [ItemSchema],
    jain: [ItemSchema]
});

const RestaurantSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    distance: Number,
    timeToReach: Number,
    rating: Number,
    reviewCount: Number,
    category: String,
    vegOnly: Boolean,
    isAvailable: Boolean,
    popularityScore: Number,
    dateAdded: String,
    image: String,
    bagOptions: [BagOptionSchema],
    possibleIngredients: [String],
    tags: [String],
    rescueItems: RescueItemsSchema,
    reviews: {
        fairPortion: Number,
        overallHygiene: Number,
        freshness: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', RestaurantSchema);
