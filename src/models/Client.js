// src/models/Client.js
const pool = require('../config/database');

const Client = {
    // Listar todos
    findAll: async () => {
        const query = 'SELECT * FROM clientes ORDER BY nombre ASC';
        const { rows } = await pool.query(query);
        return rows;
    },

    // Obtener cliente con estadísticas (CRM)
    findByIdWithStats: async (id) => {
        const query = `
            SELECT 
                c.*,
                (SELECT COUNT(*) FROM ventas v WHERE v.cliente_id = c.id AND v.estado = 'completado') as compras_realizadas,
                (SELECT COALESCE(SUM(total), 0) FROM ventas v WHERE v.cliente_id = c.id AND v.estado = 'completado') as total_gastado,
                (SELECT MAX(fecha) FROM ventas v WHERE v.cliente_id = c.id AND v.estado = 'completado') as ultima_compra
            FROM clientes c 
            WHERE c.id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // Obtener historial de compras de un cliente
    findSalesByClient: async (id) => {
        const query = `
            SELECT v.* FROM ventas v 
            WHERE v.cliente_id = $1 
            ORDER BY v.fecha DESC
        `;
        const { rows } = await pool.query(query, [id]);
        return rows;
    },

    create: async (data) => {
        const query = `
            INSERT INTO clientes (nombre, documento, telefono, email, direccion)
            VALUES ($1, $2, $3, $4, $5) RETURNING *
        `;
        const values = [data.nombre, data.documento, data.telefono, data.email, data.direccion];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    update: async (id, data) => {
        const query = `
            UPDATE clientes 
            SET nombre=$1, documento=$2, telefono=$3, email=$4, direccion=$5
            WHERE id=$6 RETURNING *
        `;
        const values = [data.nombre, data.documento, data.telefono, data.email, data.direccion, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    delete: async (id) => {
        const query = 'DELETE FROM clientes WHERE id = $1';
        await pool.query(query, [id]);
        return true;
    }
};

module.exports = Client;