const mongoose = require('mongoose');
const carSchema = new mongoose.Schema({
    marca: String,
    modelo: String,
    año: Number,
    precio: Number
});
module.exports = mongoose.model('Car', carSchema);
