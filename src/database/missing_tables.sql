-- Tablas y columnas faltantes

-- Agregar columnas faltantes en tablas existentes
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50) DEFAULT 'Efectivo';
ALTER TABLE detalle_ventas ADD COLUMN IF NOT EXISTS descuento DECIMAL(10,2) DEFAULT 0;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

-- Tabla de Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id SERIAL PRIMARY KEY,
    ruc VARCHAR(20) UNIQUE,
    nombre_empresa VARCHAR(100) NOT NULL,
    nombre_contacto VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Compras (Cabecera)
CREATE TABLE IF NOT EXISTS compras (
    id SERIAL PRIMARY KEY,
    proveedor_id INTEGER REFERENCES proveedores(id),
    usuario_id INTEGER REFERENCES usuarios(id),
    tipo_comprobante VARCHAR(30) DEFAULT 'factura',
    numero_comprobante VARCHAR(50),
    total DECIMAL(10,2) NOT NULL,
    observaciones TEXT,
    estado VARCHAR(20) DEFAULT 'completado',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Detalle de Compras
CREATE TABLE IF NOT EXISTS detalle_compras (
    id SERIAL PRIMARY KEY,
    compra_id INTEGER REFERENCES compras(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    costo_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- Tabla de Sesiones de Caja
CREATE TABLE IF NOT EXISTS caja_sesiones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    monto_inicial DECIMAL(10,2) NOT NULL,
    monto_final DECIMAL(10,2),
    monto_sistema DECIMAL(10,2),
    estado VARCHAR(20) DEFAULT 'abierta',
    fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP
);

-- Tabla de Gastos
CREATE TABLE IF NOT EXISTS gastos (
    id SERIAL PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Configuracion del negocio
CREATE TABLE IF NOT EXISTS configuracion (
    id SERIAL PRIMARY KEY,
    nombre_negocio VARCHAR(100) DEFAULT 'Mi Boutique',
    direccion TEXT,
    telefono VARCHAR(20),
    mensaje_ticket TEXT,
    logo_url VARCHAR(255),
    moneda VARCHAR(10) DEFAULT 'S/',
    zona_horaria VARCHAR(50) DEFAULT 'America/Lima',
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuracion por defecto
INSERT INTO configuracion (nombre_negocio, moneda, zona_horaria)
SELECT 'Mi Boutique', 'S/', 'America/Lima'
WHERE NOT EXISTS (SELECT 1 FROM configuracion);
