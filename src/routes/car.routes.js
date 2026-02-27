const express = require('express');
const Car = require('../models/cars');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const validateCar = require('../middlewares/validateCars');

const router = express.Router();

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