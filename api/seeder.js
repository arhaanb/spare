require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Restaurant = require('./src/models/Restaurant');
const connectDB = require('./src/config/db');

connectDB();

const importData = async () => {
    try {
        const dataPath = path.join(__dirname, 'src/data/restaurants.json');
        const restaurants = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

        await Restaurant.deleteMany(); // Clear existing data
        console.log('Data Destroyed...');

        await Restaurant.insertMany(restaurants);
        console.log('Data Imported!');

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Restaurant.deleteMany();
        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
