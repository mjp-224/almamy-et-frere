// src/models/AchatUsine.js
const { query } = require('./index');

const AchatUsine = {
    create: async (data) => {
        const { id_fournisseur, id_utilisateur, montant_total } = data;
        const sql = `
            INSERT INTO ACHAT_USINE 
            (ID_FOURNISSEUR, ID_UTILISATEUR, MONTANT_TOTAL) 
            VALUES (?, ?, ?)
        `;
        const [result] = await query(sql, [id_fournisseur, id_utilisateur, montant_total || 0]);
        return result.insertId;
    },

    findAll: async () => {
        const sql = `
            SELECT a.*, f.NOM as fournisseur_nom, u.NOM as utilisateur_nom
            FROM ACHAT_USINE a
            JOIN FOURNISSEUR f ON a.ID_FOURNISSEUR = f.ID_FOURNISSEUR
            JOIN UTILISATEUR u ON a.ID_UTILISATEUR = u.ID_UTILISATEUR
            ORDER BY a.DATE_ACHAT DESC
        `;
        return await query(sql);
    },

    findById: async (id) => {
        const sql = `
            SELECT a.*, f.NOM as fournisseur_nom, u.NOM as utilisateur_nom
            FROM ACHAT_USINE a
            JOIN FOURNISSEUR f ON a.ID_FOURNISSEUR = f.ID_FOURNISSEUR
            JOIN UTILISATEUR u ON a.ID_UTILISATEUR = u.ID_UTILISATEUR
            WHERE a.ID_ACHAT = ?
        `;
        const results = await query(sql, [id]);
        return results[0];
    },

    update: async (id, data) => {
        const { montant_total } = data;
        const sql = 'UPDATE ACHAT_USINE SET MONTANT_TOTAL = ? WHERE ID_ACHAT = ?';
        const [result] = await query(sql, [montant_total, id]);
        return result.affectedRows;
    },

    delete: async (id) => {
        const sql = 'DELETE FROM ACHAT_USINE WHERE ID_ACHAT = ?';
        const [result] = await query(sql, [id]);
        return result.affectedRows;
    }
};

module.exports = AchatUsine;