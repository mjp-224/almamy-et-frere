// src/models/CommandeClient.js
const { query } = require('./index');

const CommandeClient = {
    create: async (data) => {
        const { id_client, montant_total, statut } = data;
        const sql = `
            INSERT INTO COMMANDE_CLIENT (ID_CLIENT, MONTANT_TOTAL, STATUT) 
            VALUES (?, ?, ?)
        `;
        const [result] = await query(sql, [id_client, montant_total || 0, statut || 'EN_COURS']);
        return result.insertId;
    },

    findAll: async () => {
        const sql = `
            SELECT c.*, cl.NOM as client_nom 
            FROM COMMANDE_CLIENT c
            JOIN CLIENT cl ON c.ID_CLIENT = cl.ID_CLIENT
            ORDER BY c.DATE_COMMANDE DESC
        `;
        return await query(sql);
    },

    findById: async (id) => {
        const sql = `
            SELECT c.*, cl.NOM as client_nom 
            FROM COMMANDE_CLIENT c
            JOIN CLIENT cl ON c.ID_CLIENT = cl.ID_CLIENT
            WHERE c.ID_COMMANDE = ?
        `;
        const results = await query(sql, [id]);
        return results[0];
    },

    updateStatut: async (id, statut) => {
        const sql = 'UPDATE COMMANDE_CLIENT SET STATUT = ? WHERE ID_COMMANDE = ?';
        const [result] = await query(sql, [statut, id]);
        return result.affectedRows;
    }
};

module.exports = CommandeClient;