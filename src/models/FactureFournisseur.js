// src/models/FactureFournisseur.js
const { query } = require('./index');

const FactureFournisseur = {
    create: async (data) => {
        const { id_achat, montant_total } = data;
        const sql = `
            INSERT INTO FACTURE_FOURNISSEUR (ID_ACHAT, MONTANT_TOTAL) 
            VALUES (?, ?)
        `;
        const [result] = await query(sql, [id_achat, montant_total || 0]);
        return result.insertId;
    },

    findAll: async () => {
        const sql = `
            SELECT ff.*, a.DATE_ACHAT, f.NOM as fournisseur_nom
            FROM FACTURE_FOURNISSEUR ff
            JOIN ACHAT_USINE a ON ff.ID_ACHAT = a.ID_ACHAT
            JOIN FOURNISSEUR f ON a.ID_FOURNISSEUR = f.ID_FOURNISSEUR
            ORDER BY ff.DATE_FACTURE DESC
        `;
        return await query(sql);
    },

    findById: async (id) => {
        const sql = `
            SELECT ff.*, a.DATE_ACHAT, f.NOM as fournisseur_nom
            FROM FACTURE_FOURNISSEUR ff
            JOIN ACHAT_USINE a ON ff.ID_ACHAT = a.ID_ACHAT
            JOIN FOURNISSEUR f ON a.ID_FOURNISSEUR = f.ID_FOURNISSEUR
            WHERE ff.ID_FACTURE = ?
        `;
        const results = await query(sql, [id]);
        return results[0];
    },

    findByAchatId: async (id_achat) => {
        const sql = 'SELECT * FROM FACTURE_FOURNISSEUR WHERE ID_ACHAT = ?';
        const results = await query(sql, [id_achat]);
        return results[0];
    }
};

module.exports = FactureFournisseur;