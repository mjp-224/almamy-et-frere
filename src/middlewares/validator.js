// src/middlewares/validator.js
// Middleware de validation simple (peut être étendu avec express-validator plus tard)

const validatorMiddleware = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        
        if (error) {
            return res.status(400).json({
                message: 'Données invalides',
                details: error.details.map(err => err.message)
            });
        }
        
        next();
    };
};

// Exemple de schémas Joi (à utiliser dans les routes)
const schemas = {
    login: (data) => {
        // Pour l'instant on fait une validation basique
        if (!data.email || !data.mot_de_passe) {
            return { error: { details: [{ message: 'Email et mot de passe sont obligatoires' }] } };
        }
        return { error: null };
    },
    // Tu pourras ajouter d'autres schémas plus tard
};

module.exports = { validatorMiddleware, schemas };