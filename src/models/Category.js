// src/models/Category.js
const pool = require('../config/database');

const Category = {
    // Listar todas (incluidas inactivas para gestión)
    findAll: async () => {
        const query = 'SELECT * FROM categorias ORDER BY id ASC';
        const { rows } = await pool.query(query);
        return rows;
    },

    // Buscar por ID
    findById: async (id) => {
        const query = 'SELECT * FROM categorias WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // Crear
    create: async (data) => {
        const query = 'INSERT INTO categorias (nombre, activo) VALUES ($1, true) RETURNING *';
        const { rows } = await pool.query(query, [data.nombre]);
        return rows[0];
    },

    // Editar
    update: async (id, data) => {
        const query = 'UPDATE categorias SET nombre = $1 WHERE id = $2 RETURNING *';
        const { rows } = await pool.query(query, [data.nombre, id]);
        return rows[0];
    },

    // Cambiar Estado (Activar/Desactivar)
    toggleStatus: async (id) => {
        const query = 'UPDATE categorias SET activo = NOT activo WHERE id = $1';
        await pool.query(query, [id]);
        return true;
    }
};

module.exports = Category;