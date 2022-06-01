const jwt = require('jsonwebtoken');

// Middleware para validar el token (rutas protegidas)
const requiresAuth = (req, res, next) => {
    const token = req.headers.authorization || req.query.token;

    // Se verifica si el request posee el header authorization
    if (!token) {
        return res.redirect('/');
        // return res.status(403).json({ error: 'No token provided.' });
    }
    jwt.verify(token, process.env.SECRET_KEY, (err, decodedToken) => {
        if (err) {
            // res.status(401).json({ error: 'Invalid token', token_error: err });
            res.redirect('/');
        } else {
            req.user = decodedToken;
            next();
        }
    });
}

module.exports = requiresAuth;