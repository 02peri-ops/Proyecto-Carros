const express = require('express');
const Car = require('../models/cars');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const validateCar = require('../middlewares/validateCars');

const router = express.Router();

router.get('/', async (req, res, next) => {
    const cars = await Car.find();
    res.json(cars);
});

router.get('/',async (req, res, next) => {
    try{
        const { page = 1, limit = 10 } = req.query;
        const query = {};
        if (marca) query.marca = marca;
        const cars = await Car.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit);
        const total = await Car.countDocuments(query);
        res.json({
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: cars
        });
    }
    catch(error){
        next(error);
    }
});

router.post('/', auth, role('admin'), async (req, res, next) => {
    const car = new Car(req.body);
    await car.save();
    res.json({message: 'Carro agregado exitosamente'});
});

router.post('/', auth, validateCar, async (req, res, next) => {
    const car = new Car(req.body);
    await car.save();
    res.json({message: 'Carro agregado exitosamente'});
});

router.put('/:id', auth, role('admin'), async (req, res, next) => {
    try {
        await Car.findByIdAndUpdate(req.params.id, req.body);
        res.json({message: 'Carro actualizado exitosamente'});
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', auth, role('admin'), async (req, res) => {
    await Car.findByIdAndDelete(req.params.id);
    res.json({message: 'Carro eliminado exitosamente'});
});
module.exports = router;
