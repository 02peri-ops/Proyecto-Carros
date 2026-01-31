// Importar las dependencias
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const carRoutes = require('./routes/car.routes');
const errorHandler = require('./middlewares/errorHandler');

//Se crea la app 
const app = express();

//Conectar a la base de datos
connectDB();

//Configuración Midelleware
app.use(cors());
app.use(express.json());

//Rutas
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);

//Manejo de errores
app.use(errorHandler);

//Ruta de prueba
app.get('/', (req, res) => { 
    res.send('¡Hola, mundo! La aplicación está funcionando correctamente.');
});

//Puerto desde variables de entorno
const PORT = process.env.PORT || 3000;

//Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
