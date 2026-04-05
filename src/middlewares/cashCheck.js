// src/middlewares/cashCheck.js
const CashRegister = require('../models/CashRegister');

const checkCashOpen = async (req, res, next) => {
    // Si no está logueado, auth.js lo atrapará antes, pero por seguridad:
    if (!req.session.userId) return res.redirect('/login');

    try {
        // Buscamos si tiene caja abierta en BD
        const caja = await CashRegister.findOpenByUserId(req.session.userId);

        if (caja) {
            // Guardamos el ID de la caja en la sesión para usarlo luego
            req.session.cajaId = caja.id;
            req.session.fechaApertura = caja.fecha_apertura;
            res.locals.cajaAbierta = true; // Variable para las vistas (mostrar botón "Cerrar Caja")
            return next();
        } else {
            // No tiene caja abierta, lo mandamos a abrir
            req.flash('error', '⚠️ Debes ABRIR CAJA antes de realizar ventas.');
            return res.redirect('/caja/apertura');
        }
    } catch (error) {
        console.error(error);
        return res.redirect('/');
    }
};

module.exports = checkCashOpen;