const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('DB_URI:', process.env.DB_URI);
        await mongoose.connect(process.env.DB_URI);
        console.log('MongoDB conectado');
    } catch (error) {
        console.error('Error de conexión:', error);
        process.exit(1);
    }
};

module.exports = connectDB;