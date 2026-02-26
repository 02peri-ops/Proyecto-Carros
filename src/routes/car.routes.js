const express = require('express');
const Car = require('../models/cars');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

const router = express.Router();

router.get('/', async (req, res, next) => {
    const cars = await Car.find();
    res.json(cars);
});

router.get('/:id', async (req, res, next) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: 'Carro no encontrado' });
        }
        res.json(car);
    } catch (error) {
        next(error);
    }
});

router.post('/', auth, role('admin'), async (req, res, next) => {
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
