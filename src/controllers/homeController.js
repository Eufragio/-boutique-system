// src/controllers/homeController.js
const Dashboard = require('../models/Dashboard');

const controller = {
    index: async (req, res) => {
        try {
            // 1. Obtener KPIs Generales
            const kpi = await Dashboard.getKpis();
            
            // 2. Obtener Alertas de Stock
            kpi.alertas = await Dashboard.getStockAlerts();

            // 3. Obtener Datos para Gráficos
            const ventasSemana = await Dashboard.getSalesLastWeek();
            const topProductos = await Dashboard.getTopProducts();

            // Renderizar la vista pasando todos los datos
            res.render('index', { 
                kpi,
                charts: {
                    ventasSemana,
                    topProductos
                }
            });

        } catch (error) {
            console.error('Error en Dashboard:', error);
            // Si falla, mostramos datos en cero para no romper la página
            res.render('index', { 
                kpi: { ventas: 0, ganancias: 0, productos: 0, clientes: 0, alertas: 0 },
                charts: { ventasSemana: [], topProductos: [] },
                error_msg: 'Error cargando el panel de control.'
            });
        }
    }
};

module.exports = controller;