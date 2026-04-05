// src/models/Dashboard.js
const pool = require('../config/database');

const Dashboard = {
    getKpis: async () => {
        // Obtenemos la fecha de hoy en formato YYYY-MM-DD según la zona horaria del servidor
        // Nota: Para ser 100% exacto con la zona horaria del usuario, idealmente se maneja en la query,
        // pero por ahora usaremos CURRENT_DATE de la base de datos.
        
        const queries = {
            ventasHoy: `
                SELECT COALESCE(SUM(total), 0) as total 
                FROM ventas 
                WHERE date(fecha) = CURRENT_DATE AND estado = 'completado'
            `,
            // Utilidad = Precio Venta - Costo (de los productos vendidos hoy)
            utilidadHoy: `
                SELECT COALESCE(SUM( (dv.subtotal) - (dv.cantidad * p.precio_compra) ), 0) as total
                FROM detalle_ventas dv
                JOIN ventas v ON dv.venta_id = v.id
                JOIN productos p ON dv.producto_id = p.id
                WHERE date(v.fecha) = CURRENT_DATE AND v.estado = 'completado'
            `,
            productosTotal: `SELECT COUNT(*) as total FROM productos WHERE activo = true`,
            clientesTotal: `SELECT COUNT(*) as total FROM clientes`
        };

        const [ventas, utilidad, productos, clientes] = await Promise.all([
            pool.query(queries.ventasHoy),
            pool.query(queries.utilidadHoy),
            pool.query(queries.productosTotal),
            pool.query(queries.clientesTotal)
        ]);

        return {
            ventas: parseFloat(ventas.rows[0].total),
            ganancias: parseFloat(utilidad.rows[0].total),
            productos: parseInt(productos.rows[0].total),
            clientes: parseInt(clientes.rows[0].total),
            alertas: 0 // Se calculará aparte o puedes integrarlo aquí
        };
    },

    // Contar productos con bajo stock
    getStockAlerts: async () => {
        const query = `SELECT COUNT(*) as total FROM productos WHERE stock_actual <= stock_minimo AND activo = true`;
        const { rows } = await pool.query(query);
        return parseInt(rows[0].total);
    },

    // Gráfico de ventas últimos 7 días
    getSalesLastWeek: async () => {
        const query = `
            SELECT 
                TO_CHAR(date(fecha), 'DD/MM') as fecha_dia, 
                SUM(total) as total 
            FROM ventas 
            WHERE fecha >= CURRENT_DATE - INTERVAL '7 days' AND estado = 'completado'
            GROUP BY date(fecha) 
            ORDER BY date(fecha) ASC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Top 5 Productos más vendidos
    getTopProducts: async () => {
        const query = `
            SELECT p.nombre, SUM(dv.cantidad) as cantidad_vendida
            FROM detalle_ventas dv
            JOIN ventas v ON dv.venta_id = v.id
            JOIN productos p ON dv.producto_id = p.id
            WHERE v.estado = 'completado'
            GROUP BY p.id, p.nombre
            ORDER BY cantidad_vendida DESC
            LIMIT 5
        `;
        const { rows } = await pool.query(query);
        return rows;
    }
};

module.exports = Dashboard;