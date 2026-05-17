const pool = require('../config/database');

const parametresHelper = {
    // Récupérer un paramètre par son nom
    getParametre: async (nom) => {
        try {
            const [rows] = await pool.query(
                'SELECT VALEUR FROM PARAMETRE WHERE NOM = ?',
                [nom]
            );
            return rows.length > 0 ? rows[0].VALEUR : null;
        } catch (error) {
            console.error(`Erreur récupération paramètre ${nom}:`, error);
            return null;
        }
    },

    // Récupérer tous les paramètres
    getAllParametres: async () => {
        try {
            const [rows] = await pool.query('SELECT NOM, VALEUR FROM PARAMETRE');
            const parametres = {};
            rows.forEach(row => {
                parametres[row.NOM] = row.VALEUR;
            });
            return parametres;
        } catch (error) {
            console.error('Erreur récupération paramètres:', error);
            return {};
        }
    },

    // Valeurs par défaut
    defaults: {
        POIDS_LIVRAISON_TONNES: 35,
        NB_SACS_LIVRAISON: 700,
        POIDS_SAC_KG: 50,
        MARGE_BENEFICIAIRE_POURCENT: 10,
        TRANSPORT_CHARGE_CLIENT: 1,
        FRAIS_TRANSPORT_PAR_SAC: 0
    },

    // Récupérer avec valeur par défaut
    getParametreWithDefault: async (nom) => {
        const valeur = await parametresHelper.getParametre(nom);
        return valeur !== null ? valeur : parametresHelper.defaults[nom];
    }
};

module.exports = parametresHelper;
