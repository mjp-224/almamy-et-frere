const pool = require('../config/database');

const historiqueController = {
    // Récupérer tout l'historique
    getAll: async (req, res) => {
        try {
            const [rows] = await pool.query(`
                SELECT h.*, u.NOM as utilisateur_nom, u.PRENOM as utilisateur_prenom
                FROM HISTORIQUE_ACTION h
                LEFT JOIN UTILISATEUR u ON h.ID_UTILISATEUR = u.ID_UTILISATEUR
                ORDER BY h.DATE_ACTION DESC
                LIMIT 1000
            `);
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur récupération historique' });
        }
    },

    // Récupérer par utilisateur
    getByUser: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await pool.query(`
                SELECT * FROM HISTORIQUE_ACTION 
                WHERE ID_UTILISATEUR = ? 
                ORDER BY DATE_ACTION DESC
            `, [id]);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: 'Erreur' });
        }
    }
};

module.exports = historiqueController;
