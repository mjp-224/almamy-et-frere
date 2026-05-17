// src/models/HistoriqueAction.js
const { query } = require('./index');

const HistoriqueAction = {
    create: async (data) => {
        const { id_utilisateur, action, description } = data;
        const sql = `
            INSERT INTO HISTORIQUE_ACTION (ID_UTILISATEUR, ACTION, DESCRIPTION) 
            VALUES (?, ?, ?)
        `;
        const [result] = await query(sql, [id_utilisateur, action, description]);
        return result.insertId;
    },

    findAll: async () => {
        const sql = `
            SELECT h.*, u.NOM, u.PRENOM 
            FROM HISTORIQUE_ACTION h
            JOIN UTILISATEUR u ON h.ID_UTILISATEUR = u.ID_UTILISATEUR
            ORDER BY h.DATE_ACTION DESC
        `;
        return await query(sql);
    },

    findByUtilisateurId: async (id_utilisateur) => {
        const sql = `
            SELECT * FROM HISTORIQUE_ACTION 
            WHERE ID_UTILISATEUR = ? 
            ORDER BY DATE_ACTION DESC
        `;
        return await query(sql, [id_utilisateur]);
    }
};

module.exports = HistoriqueAction;