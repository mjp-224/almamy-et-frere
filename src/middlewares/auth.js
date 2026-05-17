// src/middlewares/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        console.log('🔍 [AUTH] Header complet reçu :', authHeader);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ [AUTH] Pas de Bearer token');
            return res.status(401).json({ 
                message: 'Utilisateur non authentifié - Token manquant' 
            });
        }

        const token = authHeader.split(' ')[1];
        console.log('🔑 [AUTH] Token extrait (début) :', token.substring(0, 50) + '...');

        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'votre_secret_par_defaut_123456789'
        );

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