const pool = require('../config/database');

const historiqueHelper = {
    // Enregistrer une action
    logAction: async (id_utilisateur, action, description) => {
        try {
            await pool.query(
                'INSERT INTO HISTORIQUE_ACTION (ID_UTILISATEUR, ACTION, DESCRIPTION) VALUES (?, ?, ?)',
                [id_utilisateur, action, description || '']
            );
        } catch (error) {
            console.error('Erreur log action:', error);
        }
    }
};

module.exports = historiqueHelper;
