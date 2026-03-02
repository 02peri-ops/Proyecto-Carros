const {body, validationResult} = require('express-validator');
const validateCar = [
    body('Marca').notEmpty().withMessage('La marca es obligatoria'),
    body('Modelo').notEmpty().withMessage('El modelo es obligatorio'),
    body('Año').isInt().withMessage('El año debe ser un número entero'),
    body('Precio').isNumeric().withMessage('El precio debe ser un número'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = validateCar;