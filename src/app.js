// Importar las dependencias
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Cargar .env solo si no estamos en producción (Render proporciona las variables)
if (!process.env.DB_URI) {
  const envPath = path.resolve(__dirname, '../.env');
  require('dotenv').config({ path: envPath });
}

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const carRoutes = require('./routes/car.routes');
const errorHandler = require('./middlewares/errorHandler');
const exchangeRoutes = require('./routes/exchange.routes');

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
app.use('/api/exchange', exchangeRoutes);

// Servir archivos estáticos del frontend en producción
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // Manejar rutas del frontend - servir index.html para cualquier ruta
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
} else {
  //Ruta de prueba
  app.get('/', (req, res) => { 
      res.send('¡Hola, mundo! La aplicación está funcionando correctamente.');
  });
}

//Puerto desde variables de entorno
const PORT = process.env.PORT || 3000;

//Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
