// src/controllers/productController.js
const Product = require('../models/Product');
const Category = require('../models/Category');

const controller = {
    index: async (req, res) => {
        try {
            const search = req.query.search;
            let productos = await Product.findAll();

            if (search) {
                productos = productos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));
            }

            res.render('products/index', { productos });
        } catch (error) {
            console.error(error);
            res.redirect('/');
        }
    },

    create: async (req, res) => {
        const categorias = await Category.findAll();
        res.render('products/create', { categorias });
    },

    store: async (req, res) => {
        try {
            let { nombre, codigo_barras, categoria_id, precio_compra, precio_venta, stock_actual, stock_minimo } = req.body;

            // --- VALIDACIÓN Y LIMPIEZA DE DATOS ---
            
            // 1. Manejo de Nulos (Texto)
            if (categoria_id === '' || categoria_id === 'null') categoria_id = null;
            if (codigo_barras === '') codigo_barras = null;

            // 2. Manejo de Números (Evitar error por string vacío)
            precio_compra = parseFloat(precio_compra) || 0;
            precio_venta = parseFloat(precio_venta) || 0;
            stock_actual = parseInt(stock_actual) || 0;
            stock_minimo = parseInt(stock_minimo) || 5; // Por defecto 5 si no ponen nada

            // 3. Imagen
            let imagen_url = null;
            if (req.file) imagen_url = '/uploads/' + req.file.filename;

            await Product.create({
                nombre, 
                codigo_barras, 
                categoria_id, 
                precio_compra, 
                precio_venta, 
                stock_actual, 
                stock_minimo, // <--- Ahora sí lo pasamos
                imagen_url
            });

            req.flash('success', 'Producto creado correctamente');
            res.redirect('/productos');
        } catch (error) {
            console.error('Error detallado al crear producto:', error); // Mira la consola para ver el error real
            req.flash('error', 'Error al crear producto: ' + error.message);
            res.redirect('/productos/crear');
        }
    },

    edit: async (req, res) => {
        try {
            const producto = await Product.findById(req.params.id);
            const categorias = await Category.findAll();
            res.render('products/edit', { producto, categorias });
        } catch (error) {
            res.redirect('/productos');
        }
    },

    update: async (req, res) => {
        try {
            let { nombre, codigo_barras, categoria_id, precio_compra, precio_venta, stock_actual, stock_minimo } = req.body;

            // --- VALIDACIÓN ---
            if (categoria_id === '' || categoria_id === 'null') categoria_id = null;
            if (codigo_barras === '') codigo_barras = null;

            precio_compra = parseFloat(precio_compra) || 0;
            precio_venta = parseFloat(precio_venta) || 0;
            stock_actual = parseInt(stock_actual) || 0;
            stock_minimo = parseInt(stock_minimo) || 5;

            let imagen_url = null;
            if (req.file) imagen_url = '/uploads/' + req.file.filename;

            await Product.update(req.params.id, {
                nombre, 
                codigo_barras, 
                categoria_id, 
                precio_compra, 
                precio_venta, 
                stock_actual, 
                stock_minimo,
                imagen_url
            });

            req.flash('success', 'Producto actualizado');
            res.redirect('/productos');
        } catch (error) {
            console.error('Error al actualizar:', error);
            req.flash('error', 'Error al actualizar: ' + error.message);
            res.redirect('/productos/editar/' + req.params.id);
        }
    },

    toggle: async (req, res) => {
        try {
            const { id } = req.params;
            await Product.toggleStatus(id);
            req.flash('success', 'Estado del producto actualizado');
            res.redirect('/productos');
        } catch (error) {
            console.error(error);
            req.flash('error', 'No se pudo cambiar el estado');
            res.redirect('/productos');
        }
    },

    printBarcodes: async (req, res) => {
        try {
            const { id } = req.params;
            const producto = await Product.findById(id);
            
            if (!producto) {
                req.flash('error', 'Producto no encontrado');
                return res.redirect('/productos');
            }

            res.render('products/barcodes', { producto });
        } catch (error) {
            console.error(error);
            res.redirect('/productos');
        }
    }
};

module.exports = controller;