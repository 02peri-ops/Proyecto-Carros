const express = require('express');
const Car = require('../models/cars');
const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/', auth, async (req, res, next) => {
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

router.post('/', auth, async (req, res, next) => {
    const car = new Car(req.body);
    await car.save();
    res.json({message: 'Carro agregado exitosamente'});
});

router.put('/:id', auth, async (req, res) => {
    await Car.findByIdAndUpdate(req.params.id, req.body);
    res.json({message: 'Carro actualizado exitosamente'});
});

router.delete('/:id', auth, async (req, res) => {
    await Car.findByIdAndDelete(req.params.id);
    res.json({message: 'Carro eliminado exitosamente'});
});
module.exports = router;
