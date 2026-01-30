//Autenticación JWT
const express = require('express');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();
//Registro de usuario
router.post('/register', async (req, res,next) => {
    try{
        const {username, password} = req.body;
        const hashedPassword = await bycrypt.hash(password, 10);
        const user = new User({username, password: hashedPassword});
        await user.save();
        res.json({message: 'Usuario registrado exitosamente'});
    } catch (error) {
        next(error);
    }
});
//Login de usuario
router.post('/login', async (req, res,next) => {
    try{
        const {username, password} = req.body;
        const user = await User.findOne({username});
        if(!user) return res.status(400).json({message: 'Usuario no encontrado'});

        const valid = await bycrypt.compare(password, user.password);
        if(!valid) return res.status(400).json({message: 'Contraseña incorrecta'});

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});
        
        res.json({token});
    } catch (error) {
        next(error);
    }
});
module.exports = router;
