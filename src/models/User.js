// src/models/User.js
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
    // Buscar usuario para el Login (Busca por email)
    findByUsername: async (emailInput) => {
        // CORRECCIÓN: Usamos 'email' en lugar de 'usuario'
        const query = 'SELECT * FROM usuarios WHERE email = $1';
        const { rows } = await pool.query(query, [emailInput]);
        return rows[0];
    },

    // Buscar por ID (para el perfil)
    findById: async (id) => {
        // CORRECCIÓN: Seleccionamos 'email'
        const query = 'SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // Obtener contraseña actual
    findPasswordById: async (id) => {
        const query = 'SELECT password FROM usuarios WHERE id = $1';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // Listar todos
    findAll: async () => {
        const query = 'SELECT id, nombre, email, rol, activo FROM usuarios ORDER BY nombre ASC';
        const { rows } = await pool.query(query);
        return rows;
    },

    // Crear nuevo usuario
    create: async (data) => {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const query = 'INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES ($1, $2, $3, $4, true) RETURNING *';
        const values = [data.nombre, data.email, hashedPassword, data.rol];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    update: async (id, data) => {
        const query = `UPDATE usuarios SET nombre=$1, email=$2, rol=$3, activo=$4 WHERE id=$5`;
        const activo = data.activo === 'true' || data.activo === true;
        await pool.query(query, [data.nombre, data.email, data.rol, activo, id]);
        return true;
    },

    updatePassword: async (id, newPasswordHash) => {
        const query = 'UPDATE usuarios SET password = $1 WHERE id = $2';
        await pool.query(query, [newPasswordHash, id]);
        return true;
    },

    delete: async (id) => {
        const query = 'DELETE FROM usuarios WHERE id = $1';
        await pool.query(query, [id]);
        return true;
    }
};

module.exports = User;