//Autenticación JWT
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const router = express.Router();
//Registro de usuario
router.post('/register', async (req, res,next) => {
    try{
        const {username, password} = req.body;
        const user = await userService.createUser({username, password});
        res.status(201).json({message: 'Usuario registrado exitosamente'});
    } catch (error) {
        next(error);
    }
});
//Login de usuario
router.post('/login', async (req, res,next) => {
    try{
        const {username, password} = req.body;
        const user = await userService.findUserByUsername(username);
        if(!user) return res.status(400).json({message: 'Usuario no encontrado'});

        const valid = await userService.validatePassword(password, user.password);
        if(!valid) return res.status(400).json({message: 'Contraseña incorrecta'});

        const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '1h'});
        
        res.json({token});
    } catch (error) {
        next(error);
    }
});
module.exports = router;
