// src/models/Livraison.js
const { query } = require('./index');

const Livraison = {
    create: async (data) => {
        const { id_achat, date_livraison, statut } = data;
        const sql = `
            INSERT INTO LIVRAISON (ID_ACHAT, DATE_LIVRAISON, STATUT) 
            VALUES (?, ?, ?)
        `;
        const [result] = await query(sql, [id_achat, date_livraison, statut || 'EN_COURS']);
        return result.insertId;
    },

    findAll: async () => {
        const sql = `
            SELECT l.*, a.DATE_ACHAT, f.NOM as fournisseur_nom
            FROM LIVRAISON l
            JOIN ACHAT_USINE a ON l.ID_ACHAT = a.ID_ACHAT
            JOIN FOURNISSEUR f ON a.ID_FOURNISSEUR = f.ID_FOURNISSEUR
            ORDER BY l.DATE_LIVRAISON DESC
        `;
        return await query(sql);
    },

    findById: async (id) => {
        const sql = `
            SELECT l.*, a.DATE_ACHAT, f.NOM as fournisseur_nom
            FROM LIVRAISON l
            JOIN ACHAT_USINE a ON l.ID_ACHAT = a.ID_ACHAT
            JOIN FOURNISSEUR f ON a.ID_FOURNISSEUR = f.ID_FOURNISSEUR
            WHERE l.ID_LIVRAISON = ?
        `;
        const results = await query(sql, [id]);
        return results[0];
    },

    updateStatut: async (id, statut) => {
        const sql = 'UPDATE LIVRAISON SET STATUT = ? WHERE ID_LIVRAISON = ?';
        const [result] = await query(sql, [statut, id]);
        return result.affectedRows;
    }
};

module.exports = Livraison;