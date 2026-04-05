// src/models/Supplier.js
const pool = require('../config/database');

const Supplier = {
    // Listar todos (activos primero)
    findAll: async () => {
        const query = 'SELECT * FROM proveedores ORDER BY activo DESC, nombre_empresa ASC';
        const { rows } = await pool.query(query);
        return rows;
    },

    // Buscar activos (Para selectores en compras)
    findAllActive: async () => {
        const query = 'SELECT * FROM proveedores WHERE activo = true ORDER BY nombre_empresa ASC';
        const { rows } = await pool.query(query);
        return rows;
    },

    findById: async (id) => {
        const query = 'SELECT * FROM proveedores WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    create: async (data) => {
        const query = `
            INSERT INTO proveedores (ruc, nombre_empresa, nombre_contacto, telefono, email, direccion)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            data.ruc, 
            data.nombre_empresa, 
            data.nombre_contacto, 
            data.telefono, 
            data.email, 
            data.direccion
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    update: async (id, data) => {
        const query = `
            UPDATE proveedores 
            SET ruc=$1, nombre_empresa=$2, nombre_contacto=$3, telefono=$4, email=$5, direccion=$6
            WHERE id=$7 RETURNING *
        `;
        const values = [
            data.ruc, 
            data.nombre_empresa, 
            data.nombre_contacto, 
            data.telefono, 
            data.email, 
            data.direccion,
            id
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    toggleStatus: async (id) => {
        const query = 'UPDATE proveedores SET activo = NOT activo WHERE id = $1';
        await pool.query(query, [id]);
        return true;
    },
    
    delete: async (id) => {
        // Solo permitiremos borrar si no tiene compras asociadas (validación futura)
        const query = 'DELETE FROM proveedores WHERE id = $1';
        await pool.query(query, [id]);
        return true;
    }
};

module.exports = Supplier;