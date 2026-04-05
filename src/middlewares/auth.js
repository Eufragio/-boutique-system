// src/middlewares/auth.js

const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next(); // Si tiene sesión, pase adelante
    } else {
        return res.redirect('/login'); // Si no, váyase al login
    }
};

module.exports = isAuthenticated;