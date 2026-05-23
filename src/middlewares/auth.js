// src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                message: 'Utilisateur non authentifié - Token manquant' 
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, env.JWT_SECRET);

        req.user = decoded;

        console.log('✅ [AUTH] SUCCÈS ! Utilisateur décodé :', decoded);
        console.log('✅ [AUTH] ID utilisateur trouvé :', decoded.id_utilisateur || decoded.id);

        next();
    } catch (error) {
        console.error('❌ [AUTH] ÉCHEC JWT :', error.name, '→', error.message);
        return res.status(401).json({ 
            message: 'Utilisateur non authentifié',
            details: error.message 
        });
    }
};

module.exports = authMiddleware;