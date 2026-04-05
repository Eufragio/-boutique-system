// src/controllers/expenseController.js
const Expense = require('../models/Expense');

const controller = {
    index: async (req, res) => {
        try {
            const gastos = await Expense.findAll();
            res.render('expenses/index', { gastos });
        } catch (error) {
            console.error(error);
            res.redirect('/');
        }
    },

    store: async (req, res) => {
        try {
            const { descripcion, monto } = req.body;
            await Expense.create({
                descripcion,
                monto,
                usuario_id: req.session.userId
            });
            req.flash('success', 'Gasto registrado correctamente');
            res.redirect('/gastos');
        } catch (error) {
            console.error(error);
            req.flash('error', 'Error al registrar gasto');
            res.redirect('/gastos');
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            await Expense.delete(id);
            req.flash('success', 'Gasto eliminado');
            res.redirect('/gastos');
        } catch (error) {
            console.error(error);
            req.flash('error', 'Error al eliminar');
            res.redirect('/gastos');
        }
    }
};

module.exports = controller;