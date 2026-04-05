// src/models/Product.js
const pool = require('../config/database');

const Product = {
    findAll: async () => {
        const query = `
            SELECT p.*, c.nombre as categoria_nombre 
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            ORDER BY p.activo DESC, p.nombre ASC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    findAllActive: async () => {
        const query = `SELECT * FROM productos WHERE activo = true ORDER BY nombre ASC`;
        const { rows } = await pool.query(query);
        return rows;
    },

    findById: async (id) => {
        const query = 'SELECT * FROM productos WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // CREAR (Actualizado con stock_minimo)
    create: async (data) => {
        const query = `
            INSERT INTO productos (
                nombre, codigo_barras, categoria_id, precio_compra, precio_venta, stock_actual, stock_minimo, imagen_url
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [
            data.nombre, 
            data.codigo_barras, 
            data.categoria_id, 
            data.precio_compra, 
            data.precio_venta, 
            data.stock_actual, 
            data.stock_minimo, // Nuevo campo
            data.imagen_url
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // ACTUALIZAR (Actualizado con stock_minimo)
    update: async (id, data) => {
        const query = `
            UPDATE productos 
            SET nombre=$1, codigo_barras=$2, categoria_id=$3, precio_compra=$4, precio_venta=$5, stock_actual=$6, stock_minimo=$7, imagen_url=COALESCE($8, imagen_url)
            WHERE id=$9 RETURNING *
        `;
        const values = [
            data.nombre, 
            data.codigo_barras, 
            data.categoria_id, 
            data.precio_compra, 
            data.precio_venta, 
            data.stock_actual,
            data.stock_minimo, // Nuevo campo
            data.imagen_url || null, 
            id
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    toggleStatus: async (id) => {
        const query = 'UPDATE productos SET activo = NOT activo WHERE id = $1';
        await pool.query(query, [id]);
        return true;
    },

    delete: async (id) => {
        const query = 'DELETE FROM productos WHERE id = $1';
        await pool.query(query, [id]);
        return true;
    }
};

module.exports = Product;