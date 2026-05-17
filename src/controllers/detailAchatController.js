// src/controllers/detailAchatController.js
const pool = require('../config/database');

const detailAchatController = {
    createDetailAchat: async (req, res) => {
        const { id_achat, id_produit, quantite, prix_unitaire } = req.body;

        try {
            const montant_ligne = quantite * prix_unitaire;

            // 1. Insérer le détail
            const [result] = await pool.query(
                'INSERT INTO DETAIL_ACHAT (ID_ACHAT, ID_PRODUIT, QUANTITE, PRIX_UNITAIRE) VALUES (?, ?, ?, ?)',
                [id_achat, id_produit, quantite, prix_unitaire]
            );

            // 2. Recalculer et mettre à jour le montant total de l'achat
            await pool.query(`
                UPDATE ACHAT_USINE 
                SET MONTANT_TOTAL = (
                    SELECT SUM(QUANTITE * PRIX_UNITAIRE) 
                    FROM DETAIL_ACHAT 
                    WHERE ID_ACHAT = ?
                )
                WHERE ID_ACHAT = ?
            `, [id_achat, id_achat]);

            res.status(201).json({
                message: 'Détail d\'achat ajouté avec succès',
                id_detail: result.insertId,
                montant_ligne
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de l\'ajout du détail achat' });
        }
    },

    getDetailsByAchatId: async (req, res) => {
        const { id_achat } = req.params;
        try {
            const [details] = await pool.query(`
                SELECT da.*, 
                    p.NOM as produit_nom,
                    (da.QUANTITE * da.PRIX_UNITAIRE) as MONTANT_LIGNE
                FROM DETAIL_ACHAT da
                JOIN PRODUIT p ON da.ID_PRODUIT = p.ID_PRODUIT
                WHERE da.ID_ACHAT = ?
            `, [id_achat]);
            res.json(details);
        } catch (error) {
            res.status(500).json({ message: 'Erreur serveur' });
        }
    }
};

module.exports = detailAchatController;