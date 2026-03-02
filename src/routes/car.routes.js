const express = require('express');
const fs = require('fs');
const path = require('path');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const validateCar = require('../middlewares/validateCars');

const router = express.Router();

// Load cars from local JSON file
let carsData = [];

const loadCarsFromJSON = () => {
    try {
        const jsonPath = path.join(__dirname, '../../data/Cars_Stock.Cars.json');
        const fileData = fs.readFileSync(jsonPath, 'utf8');
        const cars = JSON.parse(fileData);
        
        // Default car image from Unsplash
        const defaultImage = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=250&fit=crop';
        
        // Map JSON fields to match frontend expectations
        carsData = cars.map((car, index) => ({
            _id: car._id?.$oid || `car-${index}`,
            Marca: car.Marca,
            Modelo: car.Modelo,
            Año: car.Año,
            Precio: car.Precio,
            Kilometraje: car.Kilometraje || 0,
            Transmision: car['Transmisión'] || car.Transmision || 'Automático',
            Combustible: car.Combustible,
            Cilindraje: car.Cilindraje,
            Disposición: car['Disposición'] || car.Disposicion,
            Tracción: car['Tracción'] || car.Traccion,
            Estado: car.Estado,
            Imagen: car.Imagen || defaultImage
        }));
        
        console.log(`Loaded ${carsData.length} cars from local JSON`);
    } catch (error) {
        console.error('Error loading cars from JSON:', error.message);
        carsData = [];
    }
};

// Load cars on startup
loadCarsFromJSON();

// Seed route - reload from JSON
router.post('/seed', async (req, res, next) => {
    try {
        loadCarsFromJSON();
        res.json({ message: 'Cars loaded from JSON successfully', count: carsData.length });
    } catch (error) {
        next(error);
    }
});

// Get single car by ID
router.get('/:id', async (req, res, next) => {
    try {
        const car = carsData.find(c => c._id === req.params.id);
        if (!car) return res.status(404).json({ message: 'Car not found' });
        res.json(car);
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const { page = 1, limit = 10, marca, modelo, año } = req.query;
        let filteredCars = [...carsData];
        
        if (marca) {
            filteredCars = filteredCars.filter(c => c.Marca.toLowerCase().includes(marca.toLowerCase()));
        }
        if (modelo) {
            filteredCars = filteredCars.filter(c => c.Modelo.toLowerCase().includes(modelo.toLowerCase()));
        }
        if (año) {
            filteredCars = filteredCars.filter(c => c.Año === Number(año));
        }
        
        const total = filteredCars.length;
        const startIndex = (Number(page) - 1) * Number(limit);
        const paginatedCars = filteredCars.slice(startIndex, startIndex + Number(limit));
        
        res.json({
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: paginatedCars
        });
    } catch (error) {
        next(error);
    }
});

router.post('/', auth, role('admin'), validateCar, async (req, res, next) => {
    try {
        const newCar = {
            _id: `car-${Date.now()}`,
            ...req.body
        };
        carsData.push(newCar);
        res.json({ message: 'Carro agregado exitosamente', car: newCar });
    } catch (error) {
        next(error);
    }
});

router.put('/:id', auth, role('admin'), async (req, res, next) => {
    try {
        const index = carsData.findIndex(c => c._id === req.params.id);
        if (index === -1) return res.status(404).json({ message: 'Car not found' });
        carsData[index] = { ...carsData[index], ...req.body };
        res.json({ message: 'Carro actualizado exitosamente', car: carsData[index] });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', auth, role('admin'), async (req, res, next) => {
    try {
        const index = carsData.findIndex(c => c._id === req.params.id);
        if (index === -1) return res.status(404).json({ message: 'Car not found' });
        carsData.splice(index, 1);
        res.json({ message: 'Carro eliminado exitosamente' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;