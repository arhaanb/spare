const mongoose = require('mongoose');

const BagOptionSchema = new mongoose.Schema({
    id: { type: Number, required: true }, // Keeping ID from mock data
    type: { type: String, required: true },
    description: { type: String },
    price: number = { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    pickupStart: { type: String },
    pickupEnd: { type: String },
    // Available can be a number (total) or an object breakdown. Using Mixed to support both legacy/migrated data.
    // Ideally we should standardize, but enabling Mixed for flexibility with current mock structure.
    available: { type: mongoose.Schema.Types.Mixed },
    unavailableFor: [{ type: String }] // Array of strings like ['veg', 'jain']
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
    id: { type: Number, required: true, unique: true }, // External ID from mock
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
    dateAdded: String, // YYYY-MM-DD
    image: String,
    bagOptions: [BagOptionSchema],
    possibleIngredients: [String],
    rescueItems: RescueItemsSchema,
    reviews: {
        fairPortion: Number,
        overallHygiene: Number,
        freshness: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', RestaurantSchema);
