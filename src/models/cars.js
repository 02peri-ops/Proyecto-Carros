const mongoose = require('mongoose');
const carSchema = new mongoose.Schema({
    Marca: String,
    Modelo: String,
    Año: Number,
    Estado: String,
    Kilometraje: Number,
    Combustible: String,
    Cilindraje: Number,
    Disposición: String,
    Transmisión: String,
    Tracción: String,
    Precio: Number
});
module.exports = mongoose.model('Car', carSchema);
