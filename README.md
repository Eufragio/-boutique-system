# Boutique System 🛍️

Sistema web de gestión integral para tiendas boutique, desarrollado con Node.js, Express y PostgreSQL. Permite administrar ventas, inventario, clientes, compras, caja y reportes desde una interfaz moderna y responsiva.

## Tecnologías

- **Backend:** Node.js + Express.js
- **Base de datos:** PostgreSQL
- **Vistas:** EJS (Template Engine)
- **Autenticación:** Sessions + bcryptjs
- **Reportes:** ExcelJS + json2csv
- **Subida de archivos:** Multer

## Funcionalidades

- **Point of Sale (POS):** Interfaz de ventas con búsqueda de productos y múltiples métodos de pago
- **Inventario:** Gestión de productos con control de stock y alertas de stock mínimo
- **Kardex:** Historial completo de movimientos de inventario por producto
- **Compras:** Registro de compras a proveedores con actualización automática de stock
- **Clientes:** Base de datos de clientes con historial de compras
- **Caja:** Apertura y cierre de caja con conciliación de efectivo y pagos digitales
- **Gastos:** Registro de gastos operativos
- **Reportes:** Exportación a Excel y CSV de ventas e inventario
- **Usuarios:** Sistema multiusuario con roles (admin / vendedor)
- **Settings:** Configuración del negocio (nombre, logo, moneda, zona horaria)

## Instalación

### Requisitos

- Node.js v18+
- PostgreSQL v14+

### Pasos

**1. Clonar el repositorio**
```bash
git clone https://github.com/Eufragio/-boutique-system.git
cd boutique-system
```

**2. Instalar dependencias**
```bash
npm install
```

**3. Configurar variables de entorno**
```bash
cp .env.example .env
```
Edita el archivo `.env` con tus credenciales de PostgreSQL.

**4. Crear la base de datos**
```sql
CREATE DATABASE boutique_db;
```

**5. Ejecutar el schema**

Abre `src/database/schema.sql` en tu cliente PostgreSQL y ejecútalo.
Luego ejecuta `src/database/missing_tables.sql` para las tablas adicionales.

**6. Crear usuario administrador**
```bash
npm run init-db
```

**7. Iniciar el servidor**
```bash
npm run dev
```

Abre `http://localhost:3000` en tu navegador.

**Credenciales por defecto:**
- Email: `admin@boutique.com`
- Password: `admin123`

## Estructura del Proyecto

```
boutique-system/
├── app.js                  # Entrada principal
├── src/
│   ├── config/             # Configuración BD y multer
│   ├── controllers/        # Lógica de negocio
│   ├── models/             # Consultas a la base de datos
│   ├── routes/             # Definición de rutas
│   ├── middlewares/        # Autenticación y roles
│   ├── views/              # Templates EJS
│   └── database/           # Schema SQL
└── public/                 # CSS, JS y uploads
```

## Capturas

> Dashboard con KPIs, gráficos de ventas y alertas de stock.

## Licencia

MIT
