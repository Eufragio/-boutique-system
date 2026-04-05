// src/routes/profile.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Estas rutas ya estarán protegidas por 'isAuthenticated' en app.js
router.get('/', profileController.index);
router.post('/password', profileController.updatePassword);

module.exports = router;