// src/controllers/cashController.js
const CashRegister = require('../models/CashRegister');
const Expense = require('../models/Expense'); // Importante para restar gastos

const controller = {
    // Pantalla Apertura
    showOpen: (req, res) => {
        if (req.session.cajaId) {
            req.flash('error', 'Ya tienes una caja abierta.');
            return res.redirect('/ventas/nueva');
        }
        res.render('cash/open');
    },

    // Procesar Apertura
    processOpen: async (req, res) => {
        try {
            const { monto_inicial } = req.body;
            const caja = await CashRegister.open(req.session.userId, monto_inicial || 0);
            
            req.session.cajaId = caja.id;
            req.session.fechaApertura = caja.fecha_apertura;

            req.flash('success', '✅ Caja abierta correctamente.');
            res.redirect('/ventas/nueva');
        } catch (error) {
            console.error(error);
            req.flash('error', 'Error al abrir caja');
            res.redirect('/caja/apertura');
        }
    },

    // PANTALLA DE CIERRE (Lógica de Arqueo Desglosado)
    showClose: async (req, res) => {
        if (!req.session.cajaId) {
            req.flash('error', 'No hay caja abierta para cerrar.');
            return res.redirect('/');
        }

        try {
            const caja = await CashRegister.findOpenByUserId(req.session.userId);
            
            // 1. Obtener resumen de ventas separado (Efectivo vs Digital)
            const resumenVentas = await CashRegister.getSalesSummary(caja.fecha_apertura);
            
            // 2. Total Gastos (Salidas de Dinero)
            const gastosTotal = await Expense.sumToday(caja.fecha_apertura);
            
            // 3. CÁLCULO FINAL DEL ARQUEO FÍSICO
            // Fórmula: Dinero Inicial + Ventas Efectivo - Gastos
            // (El dinero digital no está en el cajón, así que no se suma aquí)
            const saldoEsperadoEnCajon = (parseFloat(caja.monto_inicial) + resumenVentas.efectivo) - parseFloat(gastosTotal);

            res.render('cash/close', { 
                caja, 
                resumenVentas, // Objeto { efectivo, digital }
                gastosTotal, 
                saldoEsperado: saldoEsperadoEnCajon 
            });

        } catch (error) {
            console.error(error);
            res.redirect('/');
        }
    },

    // Procesar Cierre
    processClose: async (req, res) => {
        try {
            const { id, monto_sistema, monto_real } = req.body;
            
            await CashRegister.close(id, monto_real, monto_sistema);
            
            req.session.cajaId = null;
            req.session.fechaApertura = null;

            req.flash('success', '🔒 Caja cerrada exitosamente.');
            res.redirect('/');
            
        } catch (error) {
            console.error(error);
            req.flash('error', 'Error al cerrar caja');
            res.redirect('/');
        }
    },
    
    // Historial
    history: async (req, res) => {
        try {
            const cierres = await CashRegister.findAll();
            res.render('cash/index', { cierres });
        } catch (error) {
            console.error(error);
            res.redirect('/');
        }
    }
};

module.exports = controller;