// src/database/setup.js
const fs = require('fs');
const path = require('path');
const pool = require('../config/database'); // Usamos la conexión que ya creamos antes

const setupDatabase = async () => {
    try {
        // Leer el archivo SQL
        const sqlPath = path.join(__dirname, 'schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🔄 Iniciando configuración de base de datos...');
        
        // Ejecutar las consultas
        await pool.query(sql);

        console.log('✅ Tablas creadas correctamente en PostgreSQL.');
        
        // (Opcional) Insertar un usuario administrador por defecto si no existe
        // Esto es útil para poder loguearse la primera vez
        // Nota: En producción la contraseña debe ser hasheada (bcrypt), aquí es texto plano por simplicidad inicial
        const adminCheck = await pool.query("SELECT * FROM usuarios WHERE email = 'admin@boutique.com'");
        if (adminCheck.rows.length === 0) {
            await pool.query(`
                INSERT INTO usuarios (nombre, email, password, rol) 
                VALUES ('Administrador', 'admin@boutique.com', 'admin123', 'admin')
            `);
            console.log('👤 Usuario Admin creado: admin@boutique.com / admin123');
        }

        process.exit(0); // Terminar el proceso con éxito
    } catch (error) {
        console.error('❌ Error configurando la base de datos:', error);
        process.exit(1); // Terminar con error
    }
};

setupDatabase();