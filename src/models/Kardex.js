// src/models/Kardex.js
const pool = require('../config/database');

const Kardex = {
    // Obtener historial unificado de un producto
    getHistoryByProduct: async (productoId) => {
        // Esta consulta une (UNION) las Compras (Entradas) y las Ventas (Salidas)
        const query = `
            SELECT 
                'COMPRA' as tipo_movimiento,
                c.fecha,
                p.nombre_empresa as entidad,
                c.tipo_comprobante || ' ' || COALESCE(c.numero_comprobante, '') as documento,
                dc.cantidad as entrada,
                0 as salida,
                c.id as referencia_id
            FROM detalle_compras dc
            JOIN compras c ON dc.compra_id = c.id
            JOIN proveedores p ON c.proveedor_id = p.id
            WHERE dc.producto_id = $1 AND c.estado = 'completado'

            UNION ALL

            SELECT 
                'VENTA' as tipo_movimiento,
                v.fecha,
                COALESCE(cl.nombre, 'Público General') as entidad,
                v.tipo_comprobante || ' #' || v.id as documento,
                0 as entrada,
                dv.cantidad as salida,
                v.id as referencia_id
            FROM detalle_ventas dv
            JOIN ventas v ON dv.venta_id = v.id
            LEFT JOIN clientes cl ON v.cliente_id = cl.id
            WHERE dv.producto_id = $1 AND v.estado = 'completado'

            ORDER BY fecha DESC
        `;
        
        const { rows } = await pool.query(query, [productoId]);
        return rows;
    }
};

module.exports = Kardex;