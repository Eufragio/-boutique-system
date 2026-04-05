-- src/database/schema.sql

-- 1. Tabla de Usuarios (Para el acceso al sistema)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Aquí guardaremos contraseñas encriptadas
    rol VARCHAR(20) DEFAULT 'vendedor', -- 'admin' o 'vendedor'
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Categorías (Ej: Vestidos, Blusas, Accesorios)
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- 3. Tabla de Productos
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    codigo_barras VARCHAR(50) UNIQUE, -- SKU
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria_id INTEGER REFERENCES categorias(id),
    precio_compra DECIMAL(10, 2) NOT NULL, -- Para calcular ganancias
    precio_venta DECIMAL(10, 2) NOT NULL,
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 5, -- Para alertas
    talla VARCHAR(10), -- S, M, L, XL, etc.
    imagen_url VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    documento VARCHAR(20) UNIQUE, -- DNI o RUC
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Ventas (Cabecera)
CREATE TABLE IF NOT EXISTS ventas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    cliente_id INTEGER REFERENCES clientes(id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_comprobante VARCHAR(20) DEFAULT 'boleta', -- Boleta, Factura, Ticket
    total DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'completado' -- completado, anulado
);

-- 6. Tabla de Detalle de Venta (Los items de la venta)
CREATE TABLE IF NOT EXISTS detalle_ventas (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);