// src/models/Facture.js
const { query } = require('./index');

const Facture = {
    create: async (data) => {
        const { id_commande, montant_total } = data;
        const sql = `
            INSERT INTO FACTURE (ID_COMMANDE, MONTANT_TOTAL, SOLDE_RESTANT) 
            VALUES (?, ?, ?)
        `;
        const [result] = await query(sql, [id_commande, montant_total, montant_total]);
        return result.insertId;
    },

    findAll: async () => {
        const sql = `
            SELECT f.*, c.DATE_COMMANDE, cl.NOM as client_nom 
            FROM FACTURE f
            JOIN COMMANDE_CLIENT c ON f.ID_COMMANDE = c.ID_COMMANDE
            JOIN CLIENT cl ON c.ID_CLIENT = cl.ID_CLIENT
            ORDER BY f.DATE_FACTURE DESC
        `;
        return await query(sql);
    },

    findById: async (id) => {
        const sql = `
            SELECT f.*, c.DATE_COMMANDE, cl.NOM as client_nom 
            FROM FACTURE f
            JOIN COMMANDE_CLIENT c ON f.ID_COMMANDE = c.ID_COMMANDE
            JOIN CLIENT cl ON c.ID_CLIENT = cl.ID_CLIENT
            WHERE f.ID_FACTURE = ?
        `;
        const results = await query(sql, [id]);
        return results[0];
    },

    findByCommandeId: async (id_commande) => {
        const sql = 'SELECT * FROM FACTURE WHERE ID_COMMANDE = ?';
        const results = await query(sql, [id_commande]);
        return results[0];
    },

    updateSolde: async (id_facture, solde_restant) => {
        const sql = 'UPDATE FACTURE SET SOLDE_RESTANT = ? WHERE ID_FACTURE = ?';
        const [result] = await query(sql, [solde_restant, id_facture]);
        return result.affectedRows;
    }
};

module.exports = Facture;