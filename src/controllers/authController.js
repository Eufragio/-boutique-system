// src/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const controller = {
    showLogin: (req, res) => {
        // Enviamos error: null para que la vista no falle
        res.render('auth/login', { layout: false, error: null });
    },

    login: async (req, res) => {
        try {
            // El formulario envía 'usuario', pero en la BD es 'email'.
            // Capturamos lo que el usuario escribió.
            const inputLogin = req.body.usuario || req.body.email; 
            const passwordInput = req.body.password;

            if (!inputLogin || !passwordInput) {
                return res.render('auth/login', { 
                    layout: false, 
                    error: 'Por favor ingrese correo y contraseña' 
                });
            }

            // 1. Buscar en la BD (ahora buscará en la columna email)
            const user = await User.findByUsername(inputLogin);

            if (!user) {
                return res.render('auth/login', { 
                    layout: false, 
                    error: 'Usuario/Correo no encontrado.' 
                });
            }

            // 2. Verificar si está activo (Ahora que agregamos la columna, esto funcionará)
            if (!user.activo) {
                return res.render('auth/login', { 
                    layout: false, 
                    error: 'Usuario desactivado. Contacte al admin.' 
                });
            }

            // 3. Verificar contraseña
            const isMatch = await bcrypt.compare(passwordInput, user.password);

            if (!isMatch) {
                return res.render('auth/login', { 
                    layout: false, 
                    error: 'Contraseña incorrecta.' 
                });
            }

            // 4. Crear sesión
            req.session.userId = user.id;
            req.session.userName = user.nombre;
            req.session.userRol = user.rol;
            
            res.redirect('/');

        } catch (err) {
            console.error('Error Login:', err);
            res.render('auth/login', { 
                layout: false, 
                error: 'Error de servidor. Revisa la consola.' 
            });
        }
    },

    logout: (req, res) => {
        req.session.destroy(() => {
            res.redirect('/login');
        });
    }
};

module.exports = controller;