// src/controllers/categoryController.js
const Category = require('../models/Category');

const controller = {
    // Listar
    index: async (req, res) => {
        try {
            const categorias = await Category.findAll();
            res.render('categories/index', { categorias });
        } catch (error) {
            console.error(error);
            req.flash('error', 'Error al cargar categorías');
            res.redirect('/');
        }
    },

    // Guardar (Crear)
    store: async (req, res) => {
        try {
            await Category.create(req.body);
            req.flash('success', 'Categoría creada correctamente');
            res.redirect('/categorias');
        } catch (error) {
            console.error(error);
            req.flash('error', 'Error al crear categoría');
            res.redirect('/categorias');
        }
    },

    // Formulario Editar
    edit: async (req, res) => {
        try {
            const { id } = req.params;
            const categoria = await Category.findById(id);
            if(!categoria) return res.redirect('/categorias');
            res.render('categories/edit', { categoria });
        } catch (error) {
            console.error(error);
            res.redirect('/categorias');
        }
    },

    // Actualizar
    update: async (req, res) => {
        try {
            const { id } = req.params;
            await Category.update(id, req.body);
            req.flash('success', 'Categoría actualizada');
            res.redirect('/categorias');
        } catch (error) {
            console.error(error);
            req.flash('error', 'Error al actualizar');
            res.redirect('/categorias');
        }
    },

    // Cambiar Estado
    toggleStatus: async (req, res) => {
        try {
            const { id } = req.params;
            await Category.toggleStatus(id);
            req.flash('success', 'Estado de categoría cambiado');
            res.redirect('/categorias');
        } catch (error) {
            console.error(error);
            req.flash('error', 'Error al cambiar estado');
            res.redirect('/categorias');
        }
    }
};

module.exports = controller;