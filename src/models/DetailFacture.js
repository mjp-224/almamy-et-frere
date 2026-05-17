// src/models/DetailFacture.js
const { query } = require('./index');

const DetailFacture = {
    create: async (data) => {
        const { id_facture, id_produit, quantite, prix_unitaire } = data;
        const sql = `
            INSERT INTO DETAIL_FACTURE (ID_FACTURE, ID_PRODUIT, QUANTITE, PRIX_UNITAIRE) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await query(sql, [id_facture, id_produit, quantite, prix_unitaire]);
        return result.insertId;
    },

    findByFactureId: async (id_facture) => {
        const sql = `
            SELECT df.*, p.NOM as produit_nom 
            FROM DETAIL_FACTURE df
            JOIN PRODUIT p ON df.ID_PRODUIT = p.ID_PRODUIT
            WHERE df.ID_FACTURE = ?
        `;
        return await query(sql, [id_facture]);
    },

    findById: async (id) => {
        const sql = 'SELECT * FROM DETAIL_FACTURE WHERE ID_DETAIL = ?';
        const results = await query(sql, [id]);
        return results[0];
    }
};

module.exports = DetailFacture;