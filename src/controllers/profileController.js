// src/controllers/profileController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const controller = {
    // Mostrar pantalla de perfil
    index: async (req, res) => {
        try {
            const userId = req.session.userId;
            const usuario = await User.findById(userId);
            res.render('profile/index', { usuario });
        } catch (error) {
            console.error(error);
            res.redirect('/');
        }
    },

    // Procesar cambio de contraseña
    updatePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;
            const userId = req.session.userId;

            // 1. Validaciones básicas
            if (!currentPassword || !newPassword || !confirmPassword) {
                req.flash('error', 'Todos los campos son obligatorios');
                return res.redirect('/perfil');
            }

            if (newPassword !== confirmPassword) {
                req.flash('error', 'Las contraseñas nuevas no coinciden');
                return res.redirect('/perfil');
            }

            if (newPassword.length < 4) {
                req.flash('error', 'La nueva contraseña debe tener al menos 4 caracteres');
                return res.redirect('/perfil');
            }

            // 2. Obtener la contraseña actual de la BD
            const userRecord = await User.findPasswordById(userId);
            
            // 3. Verificar que la contraseña actual sea correcta
            const isMatch = await bcrypt.compare(currentPassword, userRecord.password);
            
            if (!isMatch) {
                req.flash('error', 'La contraseña actual es incorrecta');
                return res.redirect('/perfil');
            }

            // 4. Encriptar la nueva contraseña
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newPassword, salt);

            // 5. Guardar
            await User.updatePassword(userId, hash);

            req.flash('success', 'Contraseña actualizada correctamente. Inicia sesión de nuevo por seguridad.');
            // Opcional: Cerrar sesión para obligar a entrar con la nueva
            // res.redirect('/logout'); 
            // O simplemente redirigir al perfil:
            res.redirect('/perfil');

        } catch (error) {
            console.error(error);
            req.flash('error', 'Error al actualizar contraseña');
            res.redirect('/perfil');
        }
    }
};

module.exports = controller;