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
  // En producción, resolver desde la raíz del proyecto
  const projectRoot = path.resolve(__dirname, '..');
  const frontendDistPath = path.join(projectRoot, 'frontend/dist');
  console.log('Serving frontend from:', frontendDistPath);
  
  // Verificar si la carpeta existe
  const fs = require('fs');
  if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    
    // Manejar rutas del frontend - servir index.html
    app.get('/:slug', (req, res) => {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
    app.get('/', (req, res) => {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
  } else {
    console.log('Frontend dist not found, serving API only');
    // Ruta de fallback
    app.get('/', (req, res) => { 
      res.send('API running. Frontend not built.');
    });
  }
} else {
  //Ruta de prueba
  app.get('/', (req, res) => { 
      res.send('¡Hola, mundo! La aplicación está funcionando correctamente.');
  });
}

//Puerto desde variables de entorno
const PORT = process.env.PORT || 3000;

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

//Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
