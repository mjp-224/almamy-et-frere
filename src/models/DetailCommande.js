// src/models/DetailCommande.js
const { query } = require('./index');

const DetailCommande = {
    create: async (data) => {
        const { id_commande, id_produit, quantite, prix_unitaire } = data;
        const sql = `
            INSERT INTO DETAIL_COMMANDE (ID_COMMANDE, ID_PRODUIT, QUANTITE, PRIX_UNITAIRE) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await query(sql, [id_commande, id_produit, quantite, prix_unitaire]);
        return result.insertId;
    },

    findByCommandeId: async (id_commande) => {
        const sql = `
            SELECT dc.*, p.NOM as produit_nom 
            FROM DETAIL_COMMANDE dc
            JOIN PRODUIT p ON dc.ID_PRODUIT = p.ID_PRODUIT
            WHERE dc.ID_COMMANDE = ?
        `;
        return await query(sql, [id_commande]);
    },

    findById: async (id) => {
        const sql = 'SELECT * FROM DETAIL_COMMANDE WHERE ID_DETAIL = ?';
        const results = await query(sql, [id]);
        return results[0];
    }
};

module.exports = DetailCommande;