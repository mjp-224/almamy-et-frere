// src/controllers/paiementFournisseurController.js
const pool = require('../config/database');

const paiementFournisseurController = {
    createPaiementFournisseur: async (req, res) => {
        const { id_achat, montant, mode } = req.body;

        try {
            const [result] = await pool.query(
                'INSERT INTO PAIEMENT_FOURNISSEUR (ID_ACHAT, MONTANT, MODE) VALUES (?, ?, ?)',
                [id_achat, montant, mode]
            );

            res.status(201).json({
                message: 'Paiement fournisseur enregistré avec succès',
                id_paiement: result.insertId
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                message: 'Erreur lors de l\'enregistrement du paiement fournisseur', 
                error: error.message 
            });
        }
    },

    getPaiementsByAchat: async (req, res) => {
        const { id_achat } = req.params;

        try {
            const [paiements] = await pool.query(
                'SELECT * FROM PAIEMENT_FOURNISSEUR WHERE ID_ACHAT = ? ORDER BY DATE_PAIEMENT DESC',
                [id_achat]
            );
            res.json(paiements);
        } catch (error) {
            res.status(500).json({ message: 'Erreur serveur' });
        }
    }
};

module.exports = paiementFournisseurController;