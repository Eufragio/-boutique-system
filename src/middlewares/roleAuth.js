// src/middlewares/roleAuth.js

const isAdmin = (req, res, next) => {
    if (req.session.userRol === 'admin') {
        return next(); // Es jefe, pase.
    } else {
        // No es jefe, le mostramos error y lo mandamos al inicio.
        req.flash('error', '⛔ Acceso Denegado: Se requieren permisos de Administrador.');
        return res.redirect('/'); 
    }
};

module.exports = isAdmin;