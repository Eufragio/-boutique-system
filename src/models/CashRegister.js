// src/models/CashRegister.js
const pool = require('../config/database');

const CashRegister = {
    // 1. Abrir caja
    open: async (usuario_id, monto_inicial) => {
        const query = `
            INSERT INTO caja_sesiones (usuario_id, monto_inicial, estado, fecha_apertura)
            VALUES ($1, $2, 'abierta', NOW())
            RETURNING *
        `;
        const { rows } = await pool.query(query, [usuario_id, monto_inicial]);
        return rows[0];
    },

    // 2. Buscar caja abierta
    findOpenByUserId: async (usuario_id) => {
        const query = `
            SELECT * FROM caja_sesiones 
            WHERE usuario_id = $1 AND estado = 'abierta' 
            ORDER BY id DESC LIMIT 1
        `;
        const { rows } = await pool.query(query, [usuario_id]);
        return rows[0];
    },

    // 3. NUEVO: Obtener Resumen de Ventas DESGLOSADO (Efectivo vs Digital)
    getSalesSummary: async (fecha_apertura) => {
        const query = `
            SELECT 
                SUM(CASE WHEN metodo_pago = 'Efectivo' THEN total ELSE 0 END) as total_efectivo,
                SUM(CASE WHEN metodo_pago != 'Efectivo' THEN total ELSE 0 END) as total_digital
            FROM ventas 
            WHERE fecha >= $1 AND estado = 'completado'
        `;
        // Nota: metodo_pago != 'Efectivo' incluye 'Yape/Plin' y 'Tarjeta'
        
        const { rows } = await pool.query(query, [fecha_apertura]);
        
        return {
            efectivo: parseFloat(rows[0].total_efectivo || 0),
            digital: parseFloat(rows[0].total_digital || 0)
        };
    },

    // 4. Cerrar Caja
    close: async (id, monto_final, monto_sistema) => {
        const query = `
            UPDATE caja_sesiones 
            SET fecha_cierre = NOW(), monto_final = $1, monto_sistema = $2, estado = 'cerrada'
            WHERE id = $3
            RETURNING *
        `;
        const { rows } = await pool.query(query, [monto_final, monto_sistema, id]);
        return rows[0];
    },
    
    // 5. Historial
    findAll: async () => {
        const query = `
            SELECT c.*, u.nombre as usuario_nombre 
            FROM caja_sesiones c
            JOIN usuarios u ON c.usuario_id = u.id
            ORDER BY c.fecha_apertura DESC
            LIMIT 20
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Deprecado (usar getSalesSummary) pero mantenido por compatibilidad si es necesario
    calculateSales: async (usuario_id, fecha_apertura) => { 
        return 0; 
    } 
};

module.exports = CashRegister;