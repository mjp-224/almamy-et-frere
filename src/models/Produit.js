// src/models/Produit.js
const { query } = require('./index');

const Produit = {
    create: async (data) => {
        const { nom, poids_sac, statut, id_type } = data;
        const sql = 'INSERT INTO PRODUIT (NOM, POIDS_SAC, STATUT, ID_TYPE) VALUES (?, ?, ?, ?)';
        const [result] = await query(sql, [nom, poids_sac, statut || 1, id_type]);
        return result.insertId;
    },

    findAll: async () => {
        const sql = `
            SELECT p.*, t.LIBELLE as type_libelle 
            FROM PRODUIT p
            JOIN TYPE_PRODUIT t ON p.ID_TYPE = t.ID_TYPE
            ORDER BY p.NOM ASC
        `;
        return await query(sql);
    },

    findById: async (id) => {
        const sql = `
            SELECT p.*, t.LIBELLE as type_libelle 
            FROM PRODUIT p
            JOIN TYPE_PRODUIT t ON p.ID_TYPE = t.ID_TYPE
            WHERE p.ID_PRODUIT = ?
        `;
        const results = await query(sql, [id]);
        return results[0];
    },

    update: async (id, data) => {
        const { nom, poids_sac, statut, id_type } = data;
        const sql = 'UPDATE PRODUIT SET NOM = ?, POIDS_SAC = ?, STATUT = ?, ID_TYPE = ? WHERE ID_PRODUIT = ?';
        const [result] = await query(sql, [nom, poids_sac, statut, id_type, id]);
        return result.affectedRows;
    },

    delete: async (id) => {
        const sql = 'DELETE FROM PRODUIT WHERE ID_PRODUIT = ?';
        const [result] = await query(sql, [id]);
        return result.affectedRows;
    }
};

module.exports = Produit;