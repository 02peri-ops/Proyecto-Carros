// JSON-based local storage - no MongoDB connection needed
// Cars are loaded from local JSON files in the routes

const connectDB = async () => {
    console.log('Using local JSON files for data storage (MongoDB not required)');
    // No MongoDB connection needed - data is loaded from JSON files
    return true;
};

module.exports = connectDB;