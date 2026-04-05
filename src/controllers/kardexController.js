// src/controllers/kardexController.js
const Kardex = require('../models/Kardex');
const Product = require('../models/Product');

const controller = {
    show: async (req, res) => {
        try {
            const { id } = req.params;
            
            // 1. Buscamos datos del producto (para mostrar nombre y stock actual)
            const producto = await Product.findById(id);
            if (!producto) {
                req.flash('error', 'Producto no encontrado');
                return res.redirect('/productos');
            }

            // 2. Buscamos el historial de movimientos
            const movimientos = await Kardex.getHistoryByProduct(id);

            res.render('products/kardex', { producto, movimientos });

        } catch (error) {
            console.error(error);
            req.flash('error', 'Error al cargar el Kardex');
            res.redirect('/productos');
        }
    }
};

module.exports = controller;