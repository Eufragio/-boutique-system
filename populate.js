const pool = require('./src/config/database');

const populateDB = async () => {
    try {
        console.log('🔄 Iniciando poblado de base de datos...');

        // 1. Limpiar tablas (excepto usuarios y configuración)
        await pool.query(`
            TRUNCATE TABLE 
                gastos, detalle_ventas, ventas, detalle_compras, compras,
                productos, proveedores, clientes, categorias
            RESTART IDENTITY CASCADE;
        `);
        console.log('✅ Tablas limpiadas correctamente.');

        // Obtener el ID del administrador para asociar registros
        const adminRes = await pool.query("SELECT id FROM usuarios WHERE email = 'admin@boutique.com' LIMIT 1");
        const adminId = adminRes.rows.length > 0 ? adminRes.rows[0].id : 1;

        // 2. Insertar Categorías
        let categoriasIds = [];
        for (let i = 1; i <= 10; i++) {
            const res = await pool.query(
                'INSERT INTO categorias (nombre, activo) VALUES ($1, true) RETURNING id',
                [`Categoría ${i}`]
            );
            categoriasIds.push(res.rows[0].id);
        }
        console.log('✅ 10 Categorías insertadas.');

        // 3. Insertar Proveedores
        let proveedoresIds = [];
        for (let i = 1; i <= 10; i++) {
            const res = await pool.query(
                'INSERT INTO proveedores (ruc, nombre_empresa, nombre_contacto, telefono, email, direccion) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [`200000000${i < 10 ? '0'+i : i}`, `Empresa Proveedora ${i} SAC`, `Contacto ${i}`, `9990000${i < 10 ? '0'+i : i}`, `proveedor${i}@correo.com`, `Av. Proveedor ${i}, Lima`]
            );
            proveedoresIds.push(res.rows[0].id);
        }
        console.log('✅ 10 Proveedores insertados.');

        // 4. Insertar Clientes
        let clientesIds = [];
        for (let i = 1; i <= 10; i++) {
            const res = await pool.query(
                'INSERT INTO clientes (nombre, documento, telefono, email, direccion) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [`Cliente Frecuente ${i}`, `1000000${i < 10 ? '0'+i : i}`, `9880000${i < 10 ? '0'+i : i}`, `cliente${i}@correo.com`, `Calle Cliente ${i}, Lima`]
            );
            clientesIds.push(res.rows[0].id);
        }
        console.log('✅ 10 Clientes insertados.');

        // 5. Insertar Productos
        let productosIds = [];
        for (let i = 1; i <= 10; i++) {
            const precioCompra = 20 + i * 5;
            const precioVenta = precioCompra * 1.5;
            const res = await pool.query(
                'INSERT INTO productos (codigo_barras, nombre, categoria_id, precio_compra, precio_venta, stock_actual, stock_minimo, talla) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
                [`PROD-00${i}`, `Producto Boutique ${i}`, categoriasIds[i % categoriasIds.length], precioCompra, precioVenta, 50, 5, i % 2 === 0 ? 'M' : 'L']
            );
            productosIds.push(res.rows[0].id);
        }
        console.log('✅ 10 Productos insertados.');

        // 6. Insertar Compras
        for (let i = 1; i <= 10; i++) {
            const prod = productosIds[i % productosIds.length];
            const prov = proveedoresIds[i % proveedoresIds.length];
            const cantidad = 5;
            const costo = 25.00;
            const total = cantidad * costo;

            const res = await pool.query(
                'INSERT INTO compras (proveedor_id, usuario_id, tipo_comprobante, numero_comprobante, total, observaciones) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [prov, adminId, 'Factura', `F001-${100+i}`, total, `Compra de lote ${i}`]
            );
            const compraId = res.rows[0].id;

            await pool.query(
                'INSERT INTO detalle_compras (compra_id, producto_id, cantidad, costo_unitario, subtotal) VALUES ($1, $2, $3, $4, $5)',
                [compraId, prod, cantidad, costo, total]
            );
        }
        console.log('✅ 10 Compras insertadas.');

        // 7. Insertar Ventas
        for (let i = 1; i <= 10; i++) {
            const cliente = clientesIds[i % clientesIds.length];
            const prod = productosIds[i % productosIds.length];
            const cantidad = 1;
            const precio = 50.00;
            const total = cantidad * precio;

            const resVenta = await pool.query(
                'INSERT INTO ventas (cliente_id, usuario_id, total, tipo_comprobante, metodo_pago, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [cliente, adminId, total, 'Boleta', 'Efectivo', 'completado']
            );
            const ventaId = resVenta.rows[0].id;

            await pool.query(
                'INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, descuento, subtotal) VALUES ($1, $2, $3, $4, $5, $6)',
                [ventaId, prod, cantidad, precio, 0, total]
            );
        }
        console.log('✅ 10 Ventas insertadas.');

        // 8. Insertar Gastos
        for (let i = 1; i <= 10; i++) {
            await pool.query(
                'INSERT INTO gastos (descripcion, monto, usuario_id) VALUES ($1, $2, $3)',
                [`Gasto de operación ${i}`, 15 + i * 2, adminId]
            );
        }
        console.log('✅ 10 Gastos insertados.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error poblando bd:', error);
        process.exit(1);
    }
};

populateDB();
