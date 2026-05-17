// src/models/TypeProduit.js
const { query } = require('./index');

const TypeProduit = {
    create: async (libelle) => {
        const sql = 'INSERT INTO TYPE_PRODUIT (LIBELLE) VALUES (?)';
        const [result] = await query(sql, [libelle]);
        return result.insertId;
    },

    findAll: async () => {
        const sql = 'SELECT * FROM TYPE_PRODUIT ORDER BY LIBELLE ASC';
        return await query(sql);
    },

    findById: async (id) => {
        const sql = 'SELECT * FROM TYPE_PRODUIT WHERE ID_TYPE = ?';
        const results = await query(sql, [id]);
        return results[0];
    },

    update: async (id, libelle) => {
        const sql = 'UPDATE TYPE_PRODUIT SET LIBELLE = ? WHERE ID_TYPE = ?';
        const [result] = await query(sql, [libelle, id]);
        return result.affectedRows;
    },

    delete: async (id) => {
        const sql = 'DELETE FROM TYPE_PRODUIT WHERE ID_TYPE = ?';
        const [result] = await query(sql, [id]);
        return result.affectedRows;
    }
};

module.exports = TypeProduit;