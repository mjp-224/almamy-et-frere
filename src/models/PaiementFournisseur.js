// src/models/PaiementFournisseur.js
const { query } = require('./index');

const PaiementFournisseur = {
    create: async (data) => {
        const { id_achat, montant, mode } = data;
        const sql = `
            INSERT INTO PAIEMENT_FOURNISSEUR (ID_ACHAT, MONTANT, MODE) 
            VALUES (?, ?, ?)
        `;
        const [result] = await query(sql, [id_achat, montant, mode]);
        return result.insertId;
    },

    findByAchatId: async (id_achat) => {
        const sql = `
            SELECT * FROM PAIEMENT_FOURNISSEUR 
            WHERE ID_ACHAT = ? 
            ORDER BY DATE_PAIEMENT DESC
        `;
        return await query(sql, [id_achat]);
    },

    findById: async (id) => {
        const sql = 'SELECT * FROM PAIEMENT_FOURNISSEUR WHERE ID_PAIEMENT = ?';
        const results = await query(sql, [id]);
        return results[0];
    }
};

module.exports = PaiementFournisseur;