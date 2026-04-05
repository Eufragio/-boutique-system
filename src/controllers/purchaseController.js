// src/controllers/purchaseController.js
const Purchase = require('../models/Purchase');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');

const controller = {
    // Listado de compras
    index: async (req, res) => {
        try {
            const compras = await Purchase.findAll();
            res.render('purchases/index', { compras });
        } catch (error) {
            console.error(error);
            req.flash('error', 'Error al cargar historial de compras');
            res.redirect('/');
        }
    },

    // Formulario de Nueva Compra
    create: async (req, res) => {
        try {
            const proveedores = await Supplier.findAllActive();
            // Traemos todos los productos (activos e inactivos) para poder comprar stock
            const productos = await Product.findAll(); 
            res.render('purchases/create', { proveedores, productos });
        } catch (error) {
            console.error(error);
            res.redirect('/compras');
        }
    },

    // Guardar Compra (API JSON)
    store: async (req, res) => {
        try {
            const { proveedor_id, tipo_comprobante, numero_comprobante, items, total, observaciones } = req.body;
            
            if (!items || items.length === 0) {
                return res.json({ success: false, message: 'No hay productos en la compra' });
            }

            const compraId = await Purchase.create({
                proveedor_id,
                usuario_id: req.session.userId, // Usuario logueado
                tipo_comprobante,
                numero_comprobante,
                items,
                total,
                observaciones
            });

            res.json({ success: true, id: compraId });

        } catch (error) {
            console.error('Error guardando compra:', error);
            res.json({ success: false, message: error.message });
        }
    },

    // Ver detalle
    show: async (req, res) => {
        try {
            const compra = await Purchase.findById(req.params.id);
            if (!compra) return res.redirect('/compras');
            res.render('purchases/show', { compra });
        } catch (error) {
            console.error(error);
            res.redirect('/compras');
        }
    }
};

module.exports = controller;