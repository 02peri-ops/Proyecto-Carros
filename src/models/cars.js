const mongoose = require('mongoose');
const carSchema = new mongoose.Schema({
    marca: String,
    modelo: String,
    año: Number,
    precio: Number,
    estado: String,
    kilometraje: Number,
    combustible: String,
    cilindrada: Number,
    disposición: String,
    transmisión: String,
    tracción: String,
});
module.exports = mongoose.model('Car', carSchema);
