// src/models/DetailAchat.js
const { query } = require('./index');

const DetailAchat = {
    create: async (data) => {
        const { id_achat, id_produit, quantite, prix_unitaire } = data;
        const sql = `
            INSERT INTO DETAIL_ACHAT (ID_ACHAT, ID_PRODUIT, QUANTITE, PRIX_UNITAIRE) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await query(sql, [id_achat, id_produit, quantite, prix_unitaire]);
        return result.insertId;
    },

    findByAchatId: async (id_achat) => {
        const sql = `
            SELECT da.*, p.NOM as produit_nom 
            FROM DETAIL_ACHAT da
            JOIN PRODUIT p ON da.ID_PRODUIT = p.ID_PRODUIT
            WHERE da.ID_ACHAT = ?
        `;
        return await query(sql, [id_achat]);
    },

    findById: async (id) => {
        const sql = 'SELECT * FROM DETAIL_ACHAT WHERE ID_DETAIL = ?';
        const results = await query(sql, [id]);
        return results[0];
    }
};

module.exports = DetailAchat;