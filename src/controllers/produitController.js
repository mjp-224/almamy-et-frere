// src/controllers/produitController.js
const pool = require('../config/database');

const produitController = {

    // ✅ CREATE
    create: async (req, res) => {
        const { nom, poids_sac, id_type, prix_vente, description } = req.body;

        if (!nom || !id_type) {
            return res.status(400).json({ message: 'Nom et type sont obligatoires' });
        }

        try {
            const [result] = await pool.query(`
                INSERT INTO produit (NOM, POIDS_SAC, ID_TYPE)
                VALUES (?, ?, ?)
            `, [nom, poids_sac || null, id_type]);

            res.status(201).json({
                message: 'Produit créé avec succès',
                id_produit: result.insertId
            });
        } catch (error) {
            console.error('❌ Erreur création produit :', error);
            res.status(500).json({ error: error.message });
        }
    },

    // ✅ GET ALL
    getAll: async (req, res) => {
        try {
            const [produits] = await pool.query(`
                SELECT 
                    p.ID_PRODUIT,
                    p.NOM as nom,
                    p.POIDS_SAC,
                    p.STATUT,
                    t.LIBELLE as type_libelle
                FROM produit p
                LEFT JOIN type_produit t 
                    ON p.ID_TYPE = t.ID_TYPE
                ORDER BY p.NOM
            `);
            res.json(produits);
        } catch (error) {
            console.error('❌ ERREUR SQL :', error);
            res.status(500).json({ error: error.message });
        }
    },

    // ✅ NOUVEAU : GET produits d'un fournisseur via TARIF_FOURNISSEUR
    getByFournisseur: async (req, res) => {
        const { id_fournisseur } = req.params;

        try {
            const [produits] = await pool.query(`
                SELECT DISTINCT
                    p.ID_PRODUIT,
                    p.NOM as nom,
                    p.POIDS_SAC,
                    t.PRIX as prix_tarif
                FROM PRODUIT p
                JOIN TARIF_FOURNISSEUR t ON p.ID_PRODUIT = t.ID_PRODUIT
                WHERE t.ID_FOURNISSEUR = ?
                AND (t.DATE_FIN IS NULL OR t.DATE_FIN >= CURDATE())
                ORDER BY p.NOM
            `, [id_fournisseur]);

            res.json(produits);
        } catch (error) {
            console.error('❌ Erreur getByFournisseur :', error);
            res.status(500).json({ error: error.message });
        }
    },

    // ✅ DELETE
    deleteProduit: async (req, res) => {
        const { id } = req.params;

        try {
            const [result] = await pool.query(
                'DELETE FROM produit WHERE ID_PRODUIT = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Produit non trouvé' });
            }

            res.json({ message: 'Produit supprimé avec succès' });
        } catch (error) {
            console.error('❌ Erreur suppression :', error);
            res.status(500).json({ error: error.message });
        }
    },

    // ✅ UPDATE
    updateProduit: async (req, res) => {
        const { id } = req.params;
        const { nom, poids_sac, id_type } = req.body;

        if (!nom || !id_type) {
            return res.status(400).json({ message: 'Nom et type obligatoires' });
        }

        try {
            const [result] = await pool.query(`
                UPDATE produit
                SET NOM = ?, POIDS_SAC = ?, ID_TYPE = ?
                WHERE ID_PRODUIT = ?
            `, [nom, poids_sac || null, id_type, id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Produit non trouvé' });
            }

            res.json({ message: 'Produit mis à jour' });
        } catch (error) {
            console.error('❌ Erreur update :', error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = produitController;