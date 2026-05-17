// src/middlewares/role.js
const roleMiddleware = (rolesAutorises) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ 
                message: 'Accès refusé. Authentification requise.' 
            });
        }

        // rolesAutorises peut être un nombre (ID_ROLE) ou un tableau d'IDs
        const roleUtilisateur = req.user.role;

        if (Array.isArray(rolesAutorises)) {
            if (!rolesAutorises.includes(roleUtilisateur)) {
                return res.status(403).json({ 
                    message: 'Accès refusé. Vous n\'avez pas les droits nécessaires.' 
                });
            }
        } else {
            if (roleUtilisateur !== rolesAutorises) {
                return res.status(403).json({ 
                    message: 'Accès refusé. Vous n\'avez pas les droits nécessaires.' 
                });
            }
        }

        next();
    };
};

module.exports = roleMiddleware;