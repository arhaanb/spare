const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Restaurant = require('./src/models/Restaurant');

// 1. READ MOCK DATA
// We'll trust extractData.js logic but verify it works or just manually copy pasta a robust extraction.
// Actually, let's use the file we already have `src/data/restaurants.json` if it exists, or run extractData logic.

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB Connected');

        // Read from existing restaurants.json file
        const jsonPath = path.join(__dirname, 'src/data/restaurants.json');
        const restaurants = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        console.log(`Found ${restaurants.length} restaurants in JSON data`);

        // Clear existing
        await Restaurant.deleteMany({});
        console.log('Cleared existing restaurants');

        // Insert
        await Restaurant.insertMany(restaurants);
        console.log('Seeded restaurants');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
