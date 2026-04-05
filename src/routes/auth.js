// src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Mostrar Login
router.get('/login', authController.showLogin);

// Procesar Login (POST)
router.post('/login', authController.login);

// Cerrar Sesión
router.get('/logout', authController.logout);

module.exports = router;