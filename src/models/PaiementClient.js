// src/models/PaiementClient.js
const { query } = require('./index');

const PaiementClient = {
    create: async (data) => {
        const { id_facture, montant, mode } = data;
        const sql = `
            INSERT INTO PAIEMENT_CLIENT (ID_FACTURE, MONTANT, MODE) 
            VALUES (?, ?, ?)
        `;
        const [result] = await query(sql, [id_facture, montant, mode]);
        return result.insertId;
    },

    findByFactureId: async (id_facture) => {
        const sql = `
            SELECT * FROM PAIEMENT_CLIENT 
            WHERE ID_FACTURE = ? 
            ORDER BY DATE_PAIEMENT DESC
        `;
        return await query(sql, [id_facture]);
    },

    findById: async (id) => {
        const sql = 'SELECT * FROM PAIEMENT_CLIENT WHERE ID_PAIEMENT = ?';
        const results = await query(sql, [id]);
        return results[0];
    }
};

module.exports = PaiementClient;