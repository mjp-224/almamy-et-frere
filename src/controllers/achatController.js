// src/controllers/achatController.js
const pool = require('../config/database');
const historiqueHelper = require('../utils/historiqueHelper');

const achatController = {
    createAchat: async (req, res) => {
        const { id_fournisseur, id_utilisateur, montant_total } = req.body;

        try {
            const [result] = await pool.query(
                'INSERT INTO ACHAT_USINE (ID_FOURNISSEUR, ID_UTILISATEUR, MONTANT_TOTAL) VALUES (?, ?, ?)',
                [id_fournisseur, id_utilisateur, montant_total || 0]
            );

            // Enregistrer dans l'historique
            await historiqueHelper.logAction(
                id_utilisateur,
                'CREATION_ACHAT',
                `Achat #${result.insertId} créé - Fournisseur ID ${id_fournisseur} - ${montant_total || 0} GNF`
            );

            res.status(201).json({
                message: 'Achat créé avec succès',
                id_achat: result.insertId
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de la création de l\'achat', error: error.message });
        }
    },

    getAllAchats: async (req, res) => {
        try {
            const [achats] = await pool.query(`
                SELECT a.*, f.NOM as fournisseur_nom, u.NOM as utilisateur_nom 
                FROM ACHAT_USINE a
                JOIN FOURNISSEUR f ON a.ID_FOURNISSEUR = f.ID_FOURNISSEUR
                JOIN UTILISATEUR u ON a.ID_UTILISATEUR = u.ID_UTILISATEUR
                ORDER BY a.DATE_ACHAT DESC
            `);
            res.json(achats);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de la récupération des achats' });
        }
    },

    getAchatById: async (req, res) => {
        const { id } = req.params;
        try {
            const [achats] = await pool.query(`
                SELECT a.*, f.NOM as fournisseur_nom, u.NOM as utilisateur_nom 
                FROM ACHAT_USINE a
                JOIN FOURNISSEUR f ON a.ID_FOURNISSEUR = f.ID_FOURNISSEUR
                JOIN UTILISATEUR u ON a.ID_UTILISATEUR = u.ID_UTILISATEUR
                WHERE a.ID_ACHAT = ?
            `, [id]);

            if (achats.length === 0) return res.status(404).json({ message: 'Achat non trouvé' });
            res.json(achats[0]);
        } catch (error) {
            res.status(500).json({ message: 'Erreur serveur' });
        }
    },

    updateAchat: async (req, res) => {
        const { id } = req.params;
        const { id_fournisseur, montant_total } = req.body;

        try {
            const [result] = await pool.query(
                'UPDATE ACHAT_USINE SET ID_FOURNISSEUR = ?, MONTANT_TOTAL = ? WHERE ID_ACHAT = ?',
                [id_fournisseur, montant_total, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Achat non trouvé' });
            }

            res.json({ message: 'Achat mis à jour avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de la mise à jour' });
        }
    },

    deleteAchat: async (req, res) => {
        const { id } = req.params;

        try {
            const [result] = await pool.query('DELETE FROM ACHAT_USINE WHERE ID_ACHAT = ?', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Achat non trouvé' });
            }

            res.json({ message: 'Achat supprimé avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de la suppression' });
        }
    }
};

module.exports = achatController;