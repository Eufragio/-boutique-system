// src/models/Expense.js
const pool = require('../config/database');

const Expense = {
    // Listar últimos gastos
    findAll: async () => {
        const query = `
            SELECT g.*, u.nombre as usuario_nombre 
            FROM gastos g
            LEFT JOIN usuarios u ON g.usuario_id = u.id
            ORDER BY g.fecha DESC LIMIT 50
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Registrar nuevo gasto
    create: async (data) => {
        const query = `
            INSERT INTO gastos (descripcion, monto, usuario_id)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const { rows } = await pool.query(query, [data.descripcion, data.monto, data.usuario_id]);
        return rows[0];
    },

    // Eliminar gasto (Solo si hubo error)
    delete: async (id) => {
        const query = 'DELETE FROM gastos WHERE id = $1';
        await pool.query(query, [id]);
        return true;
    },

    // Calcular total de gastos del día (para el cierre de caja)
    sumToday: async (fechaInicio) => {
        // Sumamos gastos desde que se abrió la caja
        const query = `
            SELECT COALESCE(SUM(monto), 0) as total 
            FROM gastos 
            WHERE fecha >= $1
        `;
        const { rows } = await pool.query(query, [fechaInicio]);
        return parseFloat(rows[0].total);
    }
};

module.exports = Expense;