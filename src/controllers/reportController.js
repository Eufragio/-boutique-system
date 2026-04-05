// src/controllers/reportController.js
const pool = require('../config/database');
const ExcelJS = require('exceljs');

const controller = {
    // Pantalla principal de reportes
    index: (req, res) => {
        res.render('reports/index');
    },

    // 1. REPORTE DE VENTAS
    exportSales: async (req, res) => {
        try {
            const { fecha_inicio, fecha_fin } = req.query;
            
            // Validar fechas
            if(!fecha_inicio || !fecha_fin) {
                req.flash('error', 'Seleccione un rango de fechas');
                return res.redirect('/reportes');
            }

            const query = `
                SELECT v.id, v.fecha, c.nombre as cliente, v.tipo_comprobante, v.metodo_pago, v.total, u.nombre as vendedor
                FROM ventas v
                LEFT JOIN clientes c ON v.cliente_id = c.id
                LEFT JOIN usuarios u ON v.usuario_id = u.id
                WHERE date(v.fecha) BETWEEN $1 AND $2 AND v.estado = 'completado'
                ORDER BY v.fecha DESC
            `;
            const { rows } = await pool.query(query, [fecha_inicio, fecha_fin]);

            // Crear Excel
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Ventas');

            // Definir Columnas
            worksheet.columns = [
                { header: 'ID Venta', key: 'id', width: 10 },
                { header: 'Fecha y Hora', key: 'fecha', width: 20 },
                { header: 'Cliente', key: 'cliente', width: 30 },
                { header: 'Comprobante', key: 'tipo', width: 15 },
                { header: 'Pago', key: 'metodo', width: 15 },
                { header: 'Vendedor', key: 'vendedor', width: 20 },
                { header: 'Total', key: 'total', width: 15 }
            ];

            // Estilar Cabecera
            worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };

            // Agregar Datos
            let totalPeriodo = 0;
            rows.forEach(venta => {
                totalPeriodo += parseFloat(venta.total);
                worksheet.addRow({
                    id: venta.id,
                    fecha: venta.fecha.toLocaleString(),
                    cliente: venta.cliente || 'Público General',
                    tipo: venta.tipo_comprobante,
                    metodo: venta.metodo_pago,
                    vendedor: venta.vendedor,
                    total: parseFloat(venta.total)
                });
            });

            // Agregar Total Final
            worksheet.addRow({});
            const totalRow = worksheet.addRow({ vendedor: 'TOTAL PERIODO:', total: totalPeriodo });
            totalRow.font = { bold: true };

            // Enviar archivo al navegador
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=Ventas_${fecha_inicio}_al_${fecha_fin}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.error(error);
            req.flash('error', 'Error generando reporte');
            res.redirect('/reportes');
        }
    },

    // 2. REPORTE DE INVENTARIO VALORIZADO
    exportInventory: async (req, res) => {
        try {
            const query = `
                SELECT p.codigo_barras, p.nombre, c.nombre as categoria, p.stock_actual, p.precio_compra, p.precio_venta
                FROM productos p
                LEFT JOIN categorias c ON p.categoria_id = c.id
                WHERE p.activo = true
                ORDER BY p.nombre ASC
            `;
            const { rows } = await pool.query(query);

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Inventario');

            worksheet.columns = [
                { header: 'Código', key: 'codigo', width: 15 },
                { header: 'Producto', key: 'nombre', width: 40 },
                { header: 'Categoría', key: 'categoria', width: 20 },
                { header: 'Stock', key: 'stock', width: 10 },
                { header: 'Costo Unit.', key: 'costo', width: 15 },
                { header: 'Precio Venta', key: 'precio', width: 15 },
                { header: 'Valor Inversión', key: 'valor_costo', width: 20 },
                { header: 'Valor Venta Est.', key: 'valor_venta', width: 20 }
            ];

            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF198754' } }; // Verde

            let inversionTotal = 0;
            let ventaTotal = 0;

            rows.forEach(p => {
                const costo = parseFloat(p.precio_compra || 0);
                const precio = parseFloat(p.precio_venta || 0);
                const stock = parseInt(p.stock_actual || 0);
                const valCosto = costo * stock;
                const valVenta = precio * stock;

                inversionTotal += valCosto;
                ventaTotal += valVenta;

                worksheet.addRow({
                    codigo: p.codigo_barras,
                    nombre: p.nombre,
                    categoria: p.categoria || 'General',
                    stock: stock,
                    costo: costo,
                    precio: precio,
                    valor_costo: valCosto,
                    valor_venta: valVenta
                });
            });

            worksheet.addRow({});
            const rowResumen = worksheet.addRow({ precio: 'TOTALES:', valor_costo: inversionTotal, valor_venta: ventaTotal });
            rowResumen.font = { bold: true };

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=Inventario_Valorizado.xlsx');

            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.error(error);
            req.flash('error', 'Error generando inventario');
            res.redirect('/reportes');
        }
    }
};

module.exports = controller;