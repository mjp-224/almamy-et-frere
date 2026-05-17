// src/models/MouvementStock.js
const { query } = require('./index');

const MouvementStock = {
    create: async (data) => {
        const { id_stock, type, quantite } = data;
        const sql = 'INSERT INTO MOUVEMENT_STOCK (ID_STOCK, TYPE, QUANTITE) VALUES (?, ?, ?)';
        const [result] = await query(sql, [id_stock, type, quantite]);
        return result.insertId;
    },

    findAll: async () => {
        const sql = `
            SELECT m.*, p.NOM as produit_nom, p.POIDS_SAC
            FROM MOUVEMENT_STOCK m
            JOIN STOCK_MAGASIN s ON m.ID_STOCK = s.ID_STOCK
            JOIN PRODUIT p ON s.ID_PRODUIT = p.ID_PRODUIT
            ORDER BY m.DATE_MOUVEMENT DESC
        `;
        return await query(sql);
    },

    findByStockId: async (id_stock) => {
        const sql = `
            SELECT m.*, p.NOM as produit_nom
            FROM MOUVEMENT_STOCK m
            JOIN STOCK_MAGASIN s ON m.ID_STOCK = s.ID_STOCK
            JOIN PRODUIT p ON s.ID_PRODUIT = p.ID_PRODUIT
            WHERE m.ID_STOCK = ?
            ORDER BY m.DATE_MOUVEMENT DESC
        `;
        return await query(sql, [id_stock]);
    },

    findById: async (id) => {
        const sql = `
            SELECT m.*, p.NOM as produit_nom
            FROM MOUVEMENT_STOCK m
            JOIN STOCK_MAGASIN s ON m.ID_STOCK = s.ID_STOCK
            JOIN PRODUIT p ON s.ID_PRODUIT = p.ID_PRODUIT
            WHERE m.ID_MOUVEMENT = ?
        `;
        const results = await query(sql, [id]);
        return results[0];
    },

    delete: async (id) => {
        const sql = 'DELETE FROM MOUVEMENT_STOCK WHERE ID_MOUVEMENT = ?';
        const [result] = await query(sql, [id]);
        return result.affectedRows;
    }
};

module.exports = MouvementStock;