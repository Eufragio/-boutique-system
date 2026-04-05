// src/models/Sale.js
const pool = require('../config/database');

const Sale = {
    // Listar (Historial)
    findAll: async (fechaInicio, fechaFin) => {
        let query = `
            SELECT v.id, v.fecha, v.total, v.tipo_comprobante, v.metodo_pago, v.estado, c.nombre as cliente_nombre 
            FROM ventas v
            JOIN clientes c ON v.cliente_id = c.id
        `;
        const params = [];
        
        if (fechaInicio && fechaFin) {
            query += ` WHERE v.fecha >= $1 AND v.fecha <= $2`;
            params.push(`${fechaInicio} 00:00:00`, `${fechaFin} 23:59:59`);
        }
        
        query += ` ORDER BY v.fecha DESC`;
        
        const { rows } = await pool.query(query, params);
        return rows;
    },

    findById: async (id) => {
        const headerQuery = `
            SELECT v.*, 
                   c.nombre as cliente_nombre, 
                   c.documento as cliente_documento, 
                   c.direccion as cliente_direccion,
                   c.email as cliente_email
            FROM ventas v
            JOIN clientes c ON v.cliente_id = c.id
            WHERE v.id = $1
        `;
        const headerResult = await pool.query(headerQuery, [id]);
        if (headerResult.rows.length === 0) return null;

        const venta = headerResult.rows[0];

        // ACTUALIZADO: Traemos el descuento también
        const itemsQuery = `
            SELECT dv.cantidad, dv.precio_unitario, dv.descuento, dv.subtotal, 
                   p.nombre as producto_nombre, p.codigo_barras
            FROM detalle_ventas dv
            JOIN productos p ON dv.producto_id = p.id
            WHERE dv.venta_id = $1
        `;
        const itemsResult = await pool.query(itemsQuery, [id]);

        venta.items = itemsResult.rows;
        return venta;
    },

    // CREAR VENTA (Con Descuentos)
    create: async (saleData) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const saleQuery = `
                INSERT INTO ventas (cliente_id, total, tipo_comprobante, metodo_pago, estado)
                VALUES ($1, $2, $3, $4, 'completado')
                RETURNING id
            `;
            const saleResult = await client.query(saleQuery, [
                saleData.cliente_id,
                saleData.total,
                saleData.tipo_comprobante,
                saleData.metodo_pago || 'Efectivo'
            ]);
            const ventaId = saleResult.rows[0].id;

            for (const item of saleData.items) {
                // Insertamos con descuento
                const detailQuery = `
                    INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, descuento, subtotal)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `;
                await client.query(detailQuery, [
                    ventaId,
                    item.producto_id,
                    item.cantidad,
                    item.precio,
                    item.descuento || 0, // Nuevo campo
                    item.subtotal
                ]);

                const stockQuery = `
                    UPDATE productos 
                    SET stock_actual = stock_actual - $1
                    WHERE id = $2
                `;
                await client.query(stockQuery, [item.cantidad, item.producto_id]);
            }

            await client.query('COMMIT');
            return ventaId;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    cancel: async (id) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const checkQuery = "SELECT estado FROM ventas WHERE id = $1";
            const checkResult = await client.query(checkQuery, [id]);
            
            if (checkResult.rows.length === 0) throw new Error('Venta no encontrada');
            if (checkResult.rows[0].estado === 'anulado') throw new Error('La venta ya está anulada');

            const itemsQuery = "SELECT producto_id, cantidad FROM detalle_ventas WHERE venta_id = $1";
            const itemsResult = await client.query(itemsQuery, [id]);

            for (const item of itemsResult.rows) {
                await client.query(
                    "UPDATE productos SET stock_actual = stock_actual + $1 WHERE id = $2",
                    [item.cantidad, item.producto_id]
                );
            }

            await client.query("UPDATE ventas SET estado = 'anulado' WHERE id = $1", [id]);

            await client.query('COMMIT');
            return true;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    getDashboardStats: async () => {
        const query = `
            SELECT 
                COALESCE(SUM(v.total), 0) as ventas_hoy,
                COALESCE(SUM(
                    (SELECT SUM(dv.cantidad * (dv.precio_unitario - p.precio_compra) - dv.descuento)
                     FROM detalle_ventas dv
                     JOIN productos p ON dv.producto_id = p.id
                     WHERE dv.venta_id = v.id)
                ), 0) as ganancia_hoy
            FROM ventas v
            WHERE v.fecha >= CURRENT_DATE AND v.estado = 'completado'
        `;
        const { rows } = await pool.query(query);
        return rows[0];
    },

    getChartData: async () => {
        const salesQuery = `
            SELECT TO_CHAR(fecha, 'DD/MM') as fecha_dia, SUM(total) as total 
            FROM ventas 
            WHERE fecha >= NOW() - INTERVAL '7 days' AND estado = 'completado'
            GROUP BY TO_CHAR(fecha, 'DD/MM'), DATE(fecha)
            ORDER BY DATE(fecha) ASC
        `;
        
        const topQuery = `
            SELECT p.nombre, SUM(dv.cantidad) as cantidad_vendida
            FROM detalle_ventas dv
            JOIN ventas v ON dv.venta_id = v.id
            JOIN productos p ON dv.producto_id = p.id
            WHERE v.estado = 'completado'
            GROUP BY p.id, p.nombre
            ORDER BY cantidad_vendida DESC
            LIMIT 5
        `;

        const [salesRes, topRes] = await Promise.all([
            pool.query(salesQuery),
            pool.query(topQuery)
        ]);

        return {
            ventasSemana: salesRes.rows,
            topProductos: topRes.rows
        };
    }
};

module.exports = Sale;