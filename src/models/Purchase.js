// src/models/Purchase.js
const pool = require('../config/database');

const Purchase = {
    // Listar historial de compras
    findAll: async () => {
        const query = `
            SELECT c.*, p.nombre_empresa as proveedor_nombre 
            FROM compras c
            LEFT JOIN proveedores p ON c.proveedor_id = p.id
            ORDER BY c.fecha DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Obtener detalles de una compra
    findById: async (id) => {
        const headerQuery = `
            SELECT c.*, p.nombre_empresa as proveedor_nombre, p.ruc as proveedor_ruc
            FROM compras c
            LEFT JOIN proveedores p ON c.proveedor_id = p.id
            WHERE c.id = $1
        `;
        const itemsQuery = `
            SELECT dc.*, prod.nombre as producto_nombre, prod.codigo_barras
            FROM detalle_compras dc
            JOIN productos prod ON dc.producto_id = prod.id
            WHERE dc.compra_id = $1
        `;
        
        const header = await pool.query(headerQuery, [id]);
        if (header.rows.length === 0) return null;
        
        const items = await pool.query(itemsQuery, [id]);
        
        const compra = header.rows[0];
        compra.items = items.rows;
        return compra;
    },

    // REGISTRAR COMPRA (Transacción Compleja)
    create: async (data) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN'); // Iniciar transacción

            // 1. Insertar Cabecera
            const purchaseQuery = `
                INSERT INTO compras (proveedor_id, usuario_id, tipo_comprobante, numero_comprobante, total, observaciones)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `;
            const purchaseRes = await client.query(purchaseQuery, [
                data.proveedor_id,
                data.usuario_id,
                data.tipo_comprobante,
                data.numero_comprobante,
                data.total,
                data.observaciones
            ]);
            const compraId = purchaseRes.rows[0].id;

            // 2. Insertar Detalles y Actualizar Inventario
            for (const item of data.items) {
                // a. Guardar detalle
                await client.query(`
                    INSERT INTO detalle_compras (compra_id, producto_id, cantidad, costo_unitario, subtotal)
                    VALUES ($1, $2, $3, $4, $5)
                `, [compraId, item.producto_id, item.cantidad, item.costo, item.subtotal]);

                // b. ACTUALIZAR PRODUCTO (Subir Stock y Actualizar Costo)
                // Nota: Actualizamos el 'precio_compra' al último costo registrado para mantener márgenes reales.
                await client.query(`
                    UPDATE productos 
                    SET stock_actual = stock_actual + $1, 
                        precio_compra = $2 
                    WHERE id = $3
                `, [item.cantidad, item.costo, item.producto_id]);
            }

            await client.query('COMMIT'); // Confirmar cambios
            return compraId;

        } catch (error) {
            await client.query('ROLLBACK'); // Deshacer si falla
            throw error;
        } finally {
            client.release();
        }
    }
};

module.exports = Purchase;