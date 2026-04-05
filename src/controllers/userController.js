// src/controllers/userController.js
const User = require('../models/User');

const controller = {
    // Listar
    index: async (req, res) => {
        try {
            const usuarios = await User.findAll();
            res.render('users/index', { usuarios });
        } catch (error) {
            console.error(error);
            req.flash('error', 'Error al listar usuarios');
            res.redirect('/');
        }
    },

    // Formulario Crear
    create: (req, res) => {
        res.render('users/create');
    },

    // Guardar
    store: async (req, res) => {
        try {
            await User.create(req.body);
            req.flash('success', 'Usuario creado correctamente');
            res.redirect('/usuarios');
        } catch (error) {
            console.error(error);
            req.flash('error', 'Error: El email ya podría estar registrado');
            res.redirect('/usuarios/crear');
        }
    },

    // Formulario Editar
    edit: async (req, res) => {
        try {
            const { id } = req.params;
            const usuario = await User.findById(id);
            if (!usuario) return res.redirect('/usuarios');
            res.render('users/edit', { usuario });
        } catch (error) {
            console.error(error);
            res.redirect('/usuarios');
        }
    },

    // Actualizar
    update: async (req, res) => {
        try {
            const { id } = req.params;
            await User.update(id, req.body);
            req.flash('success', 'Usuario actualizado');
            res.redirect('/usuarios');
        } catch (error) {
            console.error(error);
            req.flash('error', 'Error al actualizar');
            res.redirect('/usuarios');
        }
    },

    // Eliminar
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Protección: No te puedes borrar a ti mismo mientras estás logueado
            if (parseInt(id) === req.session.userId) {
                req.flash('error', 'No puedes eliminar tu propia cuenta mientras la usas.');
                return res.redirect('/usuarios');
            }

            await User.delete(id);
            req.flash('success', 'Usuario eliminado');
            res.redirect('/usuarios');
        } catch (error) {
            console.error(error);
            req.flash('error', 'Error al eliminar');
            res.redirect('/usuarios');
        }
    }
};

module.exports = controller;