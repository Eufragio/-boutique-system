// src/routes/home.js
const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Ruta principal del sistema
router.get('/', homeController.index);

module.exports = router;