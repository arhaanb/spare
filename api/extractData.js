const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Satisfy user request, though not strictly needed for this script unless we connect DB here (we don't)

const mockDataPath = '/Users/arhaanb/projects/spare-admin/mobile/src/data/mockData.js';
const outputPath = path.join(__dirname, 'src/data/restaurants.json');

try {
    let content = fs.readFileSync(mockDataPath, 'utf8');

    // Remove lines starting with import
    content = content.replace(/^import .*?$/gm, '');

    // Replace export const VAR = ... with global.VAR = ...
    // This handles the space correctly: export const restaurants -> global.restaurants
    content = content.replace(/export\s+const\s+(\w+)/g, 'global.$1');

    // Comment out export default
    content = content.replace(/export\s+default/g, '// export default');

    // Mock the icons that were imported
    global.BreakfastIcon = "BreakfastIcon";
    global.BreakfastIconDark = "BreakfastIconDark";
    global.DinnerIcon = "DinnerIcon";
    global.DinnerIconDark = "DinnerIconDark";
    global.GroceryIcon = "GroceryIcon";
    global.GroceryIconDark = "GroceryIconDark";
    global.DessertIcon = "DessertIcon";
    global.DessertIconDark = "DessertIconDark";

    // Eval the modified code
    eval(content);

    if (global.restaurants) {
        // Ensure dir exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(global.restaurants, null, 2));
        console.log(`Successfully extracted ${global.restaurants.length} restaurants to ${outputPath}`);
    } else {
        console.error('Error: global.restaurants is undefined after eval');
        // Debug: print start of content
        console.log('--- Content Preview ---');
        console.log(content.substring(0, 500));
    }

} catch (error) {
    console.error('Error extracting data:', error);
}
