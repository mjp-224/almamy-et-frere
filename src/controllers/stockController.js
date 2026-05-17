// src/controllers/stockController.js
const pool = require('../config/database');

const stockController = {

    // Créer une ligne de stock
    createStock: async (req, res) => {
        const { id_produit, quantite, stock_min } = req.body;
        try {
            const [result] = await pool.query(
                'INSERT INTO STOCK_MAGASIN (ID_PRODUIT, QUANTITE, STOCK_MIN) VALUES (?, ?, ?)',
                [id_produit, quantite || 0, stock_min || 0]
            );
            res.status(201).json({ message: 'Stock créé avec succès', id_stock: result.insertId });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de la création du stock', error: error.message });
        }
    },

    // Récupérer tout le stock avec alertes
    getAllStocks: async (req, res) => {
        try {
            const [stocks] = await pool.query(`
                SELECT 
                    s.ID_STOCK,
                    s.ID_PRODUIT,
                    s.QUANTITE          AS quantite,
                    s.STOCK_MIN         AS stock_min,
                    p.NOM               AS produit_nom,
                    p.POIDS_SAC,
                    t.LIBELLE           AS type_libelle,
                    CASE 
                        WHEN s.QUANTITE = 0 THEN 'RUPTURE'
                        WHEN s.QUANTITE <= s.STOCK_MIN THEN 'CRITIQUE'
                        WHEN s.QUANTITE <= s.STOCK_MIN * 1.5 THEN 'FAIBLE'
                        ELSE 'OK'
                    END AS etat_stock
                FROM STOCK_MAGASIN s
                JOIN PRODUIT p ON s.ID_PRODUIT = p.ID_PRODUIT
                LEFT JOIN TYPE_PRODUIT t ON p.ID_TYPE = t.ID_TYPE
                ORDER BY s.QUANTITE ASC
            `);
            res.json(stocks);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de la récupération du stock' });
        }
    },

    // Récupérer un stock par ID
    getStockById: async (req, res) => {
        const { id } = req.params;
        try {
            const [stocks] = await pool.query(`
                SELECT s.*, p.NOM as produit_nom, p.POIDS_SAC, t.LIBELLE as type_libelle
                FROM STOCK_MAGASIN s
                JOIN PRODUIT p ON s.ID_PRODUIT = p.ID_PRODUIT
                LEFT JOIN TYPE_PRODUIT t ON p.ID_TYPE = t.ID_TYPE
                WHERE s.ID_STOCK = ?
            `, [id]);
            if (stocks.length === 0) return res.status(404).json({ message: 'Stock non trouvé' });
            res.json(stocks[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de la récupération du stock' });
        }
    },

    // Mettre à jour stock_min
    updateStock: async (req, res) => {
        const { id } = req.params;
        const { stock_min } = req.body;
        try {
            const [result] = await pool.query(
                'UPDATE STOCK_MAGASIN SET STOCK_MIN = ? WHERE ID_STOCK = ?',
                [stock_min, id]
            );
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Stock non trouvé' });
            res.json({ message: 'Stock minimum mis à jour avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de la mise à jour du stock' });
        }
    },

    // Supprimer
    deleteStock: async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await pool.query('DELETE FROM STOCK_MAGASIN WHERE ID_STOCK = ?', [id]);
            if (result.affectedRows === 0) return res.status(404).json({ message: 'Stock non trouvé' });
            res.json({ message: 'Stock supprimé avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de la suppression du stock' });
        }
    }
};

module.exports = stockController;