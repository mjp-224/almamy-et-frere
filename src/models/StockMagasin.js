// src/models/StockMagasin.js
const { query } = require('./index');

const StockMagasin = {
    create: async (data) => {
        const { id_produit, quantite, stock_min } = data;
        const sql = 'INSERT INTO STOCK_MAGASIN (ID_PRODUIT, QUANTITE, STOCK_MIN) VALUES (?, ?, ?)';
        const [result] = await query(sql, [id_produit, quantite || 0, stock_min || 0]);
        return result.insertId;
    },

    findAll: async () => {
        const sql = `
            SELECT s.*, p.NOM as produit_nom, p.POIDS_SAC, t.LIBELLE as type_libelle
            FROM STOCK_MAGASIN s
            JOIN PRODUIT p ON s.ID_PRODUIT = p.ID_PRODUIT
            JOIN TYPE_PRODUIT t ON p.ID_TYPE = t.ID_TYPE
            ORDER BY p.NOM ASC
        `;
        return await query(sql);
    },

    findById: async (id) => {
        const sql = `
            SELECT s.*, p.NOM as produit_nom, p.POIDS_SAC, t.LIBELLE as type_libelle
            FROM STOCK_MAGASIN s
            JOIN PRODUIT p ON s.ID_PRODUIT = p.ID_PRODUIT
            JOIN TYPE_PRODUIT t ON p.ID_TYPE = t.ID_TYPE
            WHERE s.ID_STOCK = ?
        `;
        const results = await query(sql, [id]);
        return results[0];
    },

    update: async (id, data) => {
        const { quantite, stock_min } = data;
        const sql = 'UPDATE STOCK_MAGASIN SET QUANTITE = ?, STOCK_MIN = ? WHERE ID_STOCK = ?';
        const [result] = await query(sql, [quantite, stock_min, id]);
        return result.affectedRows;
    },

    delete: async (id) => {
        const sql = 'DELETE FROM STOCK_MAGASIN WHERE ID_STOCK = ?';
        const [result] = await query(sql, [id]);
        return result.affectedRows;
    }
};

module.exports = StockMagasin;