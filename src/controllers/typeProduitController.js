// src/controllers/typeProduitController.js
const pool = require('../config/database');

const typeProduitController = {
    // Créer un nouveau type de produit
    createTypeProduit: async (req, res) => {
        const { libelle } = req.body;

        try {
            const [result] = await pool.query(
                'INSERT INTO TYPE_PRODUIT (LIBELLE) VALUES (?)',
                [libelle]
            );

            res.status(201).json({
                message: 'Type de produit créé avec succès',
                id_type: result.insertId
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                message: 'Erreur lors de la création du type de produit', 
                error: error.message 
            });
        }
    },

    // Récupérer tous les types de produits
    getAllTypeProduits: async (req, res) => {
        try {
            const [types] = await pool.query(
                'SELECT * FROM TYPE_PRODUIT ORDER BY LIBELLE ASC'
            );
            res.json(types);
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                message: 'Erreur lors de la récupération des types de produits' 
            });
        }
    },

    // Récupérer un type de produit par ID
    getTypeProduitById: async (req, res) => {
        const { id } = req.params;

        try {
            const [types] = await pool.query(
                'SELECT * FROM TYPE_PRODUIT WHERE ID_TYPE = ?', 
                [id]
            );

            if (types.length === 0) {
                return res.status(404).json({ message: 'Type de produit non trouvé' });
            }

            res.json(types[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                message: 'Erreur lors de la récupération du type de produit' 
            });
        }
    },

    // Mettre à jour un type de produit
    updateTypeProduit: async (req, res) => {
        const { id } = req.params;
        const { libelle } = req.body;

        try {
            const [result] = await pool.query(
                'UPDATE TYPE_PRODUIT SET LIBELLE = ? WHERE ID_TYPE = ?',
                [libelle, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Type de produit non trouvé' });
            }

            res.json({ message: 'Type de produit mis à jour avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                message: 'Erreur lors de la mise à jour du type de produit' 
            });
        }
    },

    // Supprimer un type de produit
    deleteTypeProduit: async (req, res) => {
        const { id } = req.params;

        try {
            const [result] = await pool.query(
                'DELETE FROM TYPE_PRODUIT WHERE ID_TYPE = ?', 
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Type de produit non trouvé' });
            }

            res.json({ message: 'Type de produit supprimé avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                message: 'Erreur lors de la suppression du type de produit' 
            });
        }
    }
};

module.exports = typeProduitController;