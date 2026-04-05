// src/controllers/supplierController.js
const Supplier = require('../models/Supplier');

const controller = {
    index: async (req, res) => {
        try {
            const proveedores = await Supplier.findAll();
            res.render('suppliers/index', { proveedores });
        } catch (error) {
            console.error(error);
            req.flash('error', 'Error al cargar proveedores');
            res.redirect('/');
        }
    },

    create: (req, res) => {
        res.render('suppliers/create');
    },

    store: async (req, res) => {
        try {
            await Supplier.create(req.body);
            req.flash('success', 'Proveedor registrado exitosamente');
            res.redirect('/proveedores');
        } catch (error) {
            console.error(error);
            req.flash('error', 'Error al guardar proveedor');
            res.redirect('/proveedores/crear');
        }
    },

    edit: async (req, res) => {
        try {
            const proveedor = await Supplier.findById(req.params.id);
            if (!proveedor) {
                req.flash('error', 'Proveedor no encontrado');
                return res.redirect('/proveedores');
            }
            res.render('suppliers/edit', { proveedor });
        } catch (error) {
            console.error(error);
            res.redirect('/proveedores');
        }
    },

    update: async (req, res) => {
        try {
            await Supplier.update(req.params.id, req.body);
            req.flash('success', 'Proveedor actualizado');
            res.redirect('/proveedores');
        } catch (error) {
            console.error(error);
            req.flash('error', 'Error al actualizar');
            res.redirect('/proveedores');
        }
    },

    toggle: async (req, res) => {
        try {
            await Supplier.toggleStatus(req.params.id);
            req.flash('success', 'Estado del proveedor cambiado');
            res.redirect('/proveedores');
        } catch (error) {
            console.error(error);
            res.redirect('/proveedores');
        }
    }
};

module.exports = controller;