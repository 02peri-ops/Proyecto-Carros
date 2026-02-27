const express = require('express');
const Car = require('../models/cars');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const validateCar = require('../middlewares/validateCars');

const router = express.Router();

// Seed route - temporary for testing
router.post('/seed', async (req, res, next) => {
    try {
        // Delete existing cars first
        await Car.deleteMany({});
        const sampleCars = [
            {
                Marca: 'Toyota',
                Modelo: 'Camry',
                Año: 2024,
                Precio: 450000,
                Kilometraje: 0,
                Transmision: 'Automático',
                Combustible: 'Gasolina',
                Cilindraje: 4,
                Disposición: 'Inline',
                Tracción: 'Delantera',
                Imagen: 'https://www.toyota.mx/adobe/dynamicmedia/deliver/dm-aid--06717bb4-7d22-4c25-bef4-8880c49aade7/camry-xse-hev-version.png?preferwebp=true&quality=85'
            },
            {
                Marca: 'Honda',
                Modelo: 'Civic',
                Año: 2023,
                Precio: 380000,
                Kilometraje: 15000,
                Transmision: 'Automático',
                Combustible: 'Gasolina',
                Cilindraje: 4,
                Disposición: 'Inline',
                Tracción: 'Delantera',
                Imagen: 'https://www.honda.mx/web/img/cars/models/civic-hibrido/2026/colors/blanco.png'
            },
            {
                Marca: 'BMW',
                Modelo: 'X5',
                Año: 2024,
                Precio: 1500000,
                Kilometraje: 0,
                Transmision: 'Automático',
                Combustible: 'Gasolina',
                Cilindraje: 6,
                Disposición: 'Inline',
                Tracción: 'Integral',
                Imagen: 'https://mediapool.bmwgroup.com/cache/P9/202308/P90520309/P90520309-the-new-bmw-x5-protection-vr6-08-23-599px.jpg'
            },
            {
                Marca: 'Mercedes',
                Modelo: 'C-Class',
                Año: 2023,
                Precio: 980000,
                Kilometraje: 25000,
                Transmision: 'Automático',
                Combustible: 'Gasolina',
                Cilindraje: 4,
                Disposición: 'Inline',
                Tracción: 'Delantera',
                Imagen: 'https://stimg.cardekho.com/images/carexteriorimages/930x620/Mercedes-Benz/C-Class/10858/1755843786675/front-left-side-47.jpg'
            },
            {
                Marca: 'Ford',
                Modelo: 'Mustang',
                Año: 2024,
                Precio: 850000,
                Kilometraje: 0,
                Transmision: 'Manual',
                Combustible: 'Gasolina',
                Cilindraje: 8,
                Disposición: 'V8',
                Tracción: 'Trasera',
                Imagen: 'https://www.gpas-cache.ford.com/guid/757644d0-2cd5-39f9-b878-e856a6445a00.jpg?catalogId=WAEEX-CZJ-2026-MustangESP202600'
            },
            {
                Marca: 'Audi',
                Modelo: 'A4',
                Año: 2023,
                Precio: 720000,
                Kilometraje: 30000,
                Transmision: 'Automático',
                Combustible: 'Gasolina',
                Cilindraje: 4,
                Disposición: 'Inline',
                Tracción: 'Delantera',
                Imagen: 'https://stimg.cardekho.com/images/carexteriorimages/630x420/Audi/A4/10548/1757137106350/front-left-side-47.jpg?imwidth=420&impolicy=resize'
            }
        ];
        
        await Car.insertMany(sampleCars);
        res.json({ message: 'Cars seeded successfully', count: sampleCars.length });
    } catch (error) {
        next(error);
    }
});

// Get single car by ID
router.get('/:id', async (req, res, next) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) return res.status(404).json({ message: 'Car not found' });
        res.json(car);
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const { page = 1, limit = 10, marca, modelo, año } = req.query;
        const query = {};
        
        if (marca) query.Marca = marca;
        if (modelo) query.Modelo = modelo;
        if (año) query.Año = Number(año);
        
        const cars = await Car.find(query)
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        
        const total = await Car.countDocuments(query);
        
        res.json({
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: cars
        });
    } catch (error) {
        next(error);
    }
});

router.post('/', auth, role('admin'), validateCar, async (req, res, next) => {
    try {
        const car = new Car(req.body);
        await car.save();
        res.json({ message: 'Carro agregado exitosamente' });
    } catch (error) {
        next(error);
    }
});

router.put('/:id', auth, role('admin'), async (req, res, next) => {
    try {
        await Car.findByIdAndUpdate(req.params.id, req.body);
        res.json({ message: 'Carro actualizado exitosamente' });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', auth, role('admin'), async (req, res, next) => {
    try {
        await Car.findByIdAndDelete(req.params.id);
        res.json({ message: 'Carro eliminado exitosamente' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;