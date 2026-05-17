// src/controllers/tarifFournisseurController.js
const pool = require('../config/database');

const tarifFournisseurController = {
    // Créer un nouveau tarif fournisseur
    createTarif: async (req, res) => {
        const { id_fournisseur, id_produit, prix, date_debut, date_fin } = req.body;

        try {
            const [result] = await pool.query(
                'INSERT INTO TARIF_FOURNISSEUR (ID_FOURNISSEUR, ID_PRODUIT, PRIX, DATE_DEBUT, DATE_FIN) VALUES (?, ?, ?, ?, ?)',
                [id_fournisseur, id_produit, prix, date_debut, date_fin]
            );

            res.status(201).json({
                message: 'Tarif fournisseur créé avec succès',
                id_tarif: result.insertId
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                message: 'Erreur lors de la création du tarif', 
                error: error.message 
            });
        }
    },

    // Récupérer tous les tarifs (avec détails fournisseur et produit)
    getAllTarifs: async (req, res) => {
        try {
            const [tarifs] = await pool.query(`
                SELECT t.*, 
                       f.NOM as fournisseur_nom,
                       p.NOM as produit_nom,
                       p.POIDS_SAC
                FROM TARIF_FOURNISSEUR t
                JOIN FOURNISSEUR f ON t.ID_FOURNISSEUR = f.ID_FOURNISSEUR
                JOIN PRODUIT p ON t.ID_PRODUIT = p.ID_PRODUIT
                ORDER BY f.NOM ASC, p.NOM ASC
            `);
            res.json(tarifs);
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                message: 'Erreur lors de la récupération des tarifs' 
            });
        }
    },

    // Récupérer un tarif par ID
    getTarifById: async (req, res) => {
        const { id } = req.params;

        try {
            const [tarifs] = await pool.query(`
                SELECT t.*, 
                       f.NOM as fournisseur_nom,
                       p.NOM as produit_nom,
                       p.POIDS_SAC
                FROM TARIF_FOURNISSEUR t
                JOIN FOURNISSEUR f ON t.ID_FOURNISSEUR = f.ID_FOURNISSEUR
                JOIN PRODUIT p ON t.ID_PRODUIT = p.ID_PRODUIT
                WHERE t.ID_TARIF = ?
            `, [id]);

            if (tarifs.length === 0) {
                return res.status(404).json({ message: 'Tarif non trouvé' });
            }

            res.json(tarifs[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                message: 'Erreur lors de la récupération du tarif' 
            });
        }
    },

    // ✅ NOUVEAU : Récupérer le tarif actif d'un produit pour un fournisseur donné
    getTarifByFournisseurProduit: async (req, res) => {
        const { id_fournisseur, id_produit } = req.params;

        try {
            const [tarifs] = await pool.query(`
                SELECT * FROM TARIF_FOURNISSEUR
                WHERE ID_FOURNISSEUR = ? AND ID_PRODUIT = ?
                AND (DATE_FIN IS NULL OR DATE_FIN >= CURDATE())
                ORDER BY DATE_DEBUT DESC
                LIMIT 1
            `, [id_fournisseur, id_produit]);

            if (tarifs.length === 0) {
                return res.status(404).json({ message: 'Aucun tarif trouvé pour ce fournisseur et ce produit' });
            }

            res.json(tarifs[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur serveur' });
        }
    },

    // Mettre à jour un tarif
    updateTarif: async (req, res) => {
        const { id } = req.params;
        const { prix, date_debut, date_fin } = req.body;

        try {
            const [result] = await pool.query(
                'UPDATE TARIF_FOURNISSEUR SET PRIX = ?, DATE_DEBUT = ?, DATE_FIN = ? WHERE ID_TARIF = ?',
                [prix, date_debut, date_fin, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Tarif non trouvé' });
            }

            res.json({ message: 'Tarif mis à jour avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                message: 'Erreur lors de la mise à jour du tarif' 
            });
        }
    },

    // Supprimer un tarif
    deleteTarif: async (req, res) => {
        const { id } = req.params;

        try {
            const [result] = await pool.query(
                'DELETE FROM TARIF_FOURNISSEUR WHERE ID_TARIF = ?', 
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Tarif non trouvé' });
            }

            res.json({ message: 'Tarif supprimé avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                message: 'Erreur lors de la suppression du tarif' 
            });
        }
    }
};

module.exports = tarifFournisseurController;