// Importar las dependencias
const express = require('express');
const cors = require('cors');
require('dotenv').config();

//Se crea la app 
const app = express();

//Configuración Midelleware
app.use(cors());
app.use(express.json());

//Ruta de prueba
app.get('/', (req, res) => { 
    res.send('¡Hola, mundo! La aplicación está funcionando correctamente.');
});

//Conexión a MongoDB
moongose.conect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch((error) => console.error('Error al conectar a MongoDB:', error));

//Puerto desde variables de entorno
const PORT = process.env.PORT || 3000;

//Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
