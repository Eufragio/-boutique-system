// src/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const isAdmin = require('../middlewares/roleAuth'); // Protección TOTAL

router.use(isAdmin); // Aplica a todas las rutas de abajo

router.get('/', userController.index);
router.get('/crear', userController.create);
router.post('/', userController.store);
router.get('/editar/:id', userController.edit);
router.post('/editar/:id', userController.update);
router.post('/eliminar/:id', userController.delete);

module.exports = router;