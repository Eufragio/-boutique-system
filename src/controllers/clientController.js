// src/controllers/clientController.js
const Client = require('../models/Client');

const controller = {
    index: async (req, res) => {
        try {
            const clientes = await Client.findAll();
            res.render('clients/index', { clientes });
        } catch (error) {
            console.error(error);
            res.redirect('/');
        }
    },

    create: (req, res) => {
        // Detectamos si venimos del POS para redirigir luego correctamente
        const from = req.query.from || 'list';
        res.render('clients/create', { from });
    },

    store: async (req, res) => {
        try {
            const { nombre, documento, telefono, email, direccion, from } = req.body;
            await Client.create({ nombre, documento, telefono, email, direccion });
            
            req.flash('success', 'Cliente registrado exitosamente');
            
            // Si venimos del POS, volvemos al POS
            if (from === 'pos') {
                return res.redirect('/ventas/nueva');
            }
            res.redirect('/clientes');
        } catch (error) {
            console.error(error);
            req.flash('error', 'Error al crear cliente');
            res.redirect('/clientes/crear');
        }
    },

    edit: async (req, res) => {
        try {
            const cliente = await Client.findByIdWithStats(req.params.id); // Usamos la nueva funcion
            if(!cliente) return res.redirect('/clientes');
            res.render('clients/edit', { cliente });
        } catch (error) {
            console.error(error);
            res.redirect('/clientes');
        }
    },

    update: async (req, res) => {
        try {
            await Client.update(req.params.id, req.body);
            req.flash('success', 'Cliente actualizado');
            res.redirect('/clientes');
        } catch (error) {
            console.error(error);
            req.flash('error', 'Error al actualizar');
            res.redirect('/clientes');
        }
    },

    // NUEVO: Ver Perfil CRM
    show: async (req, res) => {
        try {
            const { id } = req.params;
            
            // 1. Datos del cliente + Estadísticas
            const cliente = await Client.findByIdWithStats(id);
            
            if (!cliente) {
                req.flash('error', 'Cliente no encontrado');
                return res.redirect('/clientes');
            }

            // 2. Historial de compras
            const historial = await Client.findSalesByClient(id);

            res.render('clients/show', { cliente, historial });

        } catch (error) {
            console.error(error);
            res.redirect('/clientes');
        }
    },

    delete: async (req, res) => {
        try {
            await Client.delete(req.params.id);
            req.flash('success', 'Cliente eliminado');
            res.redirect('/clientes');
        } catch (error) {
            console.error(error);
            req.flash('error', 'No se puede eliminar (tiene ventas asociadas)');
            res.redirect('/clientes');
        }
    }
};

module.exports = controller;