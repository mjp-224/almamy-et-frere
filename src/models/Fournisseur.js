// src/models/Fournisseur.js
const { query } = require('./index');

const Fournisseur = {
    create: async (data) => {
        const { nom, telephone, email, ville } = data;
        const sql = 'INSERT INTO FOURNISSEUR (NOM, TELEPHONE, EMAIL, VILLE) VALUES (?, ?, ?, ?)';
        const [result] = await query(sql, [nom, telephone, email, ville]);
        return result.insertId;
    },

    findAll: async () => {
        const sql = 'SELECT * FROM FOURNISSEUR ORDER BY NOM ASC';
        return await query(sql);
    },

    findById: async (id) => {
        const sql = 'SELECT * FROM FOURNISSEUR WHERE ID_FOURNISSEUR = ?';
        const results = await query(sql, [id]);
        return results[0];
    },

    update: async (id, data) => {
        const { nom, telephone, email, ville } = data;
        const sql = 'UPDATE FOURNISSEUR SET NOM = ?, TELEPHONE = ?, EMAIL = ?, VILLE = ? WHERE ID_FOURNISSEUR = ?';
        const [result] = await query(sql, [nom, telephone, email, ville, id]);
        return result.affectedRows;
    },

    delete: async (id) => {
        const sql = 'DELETE FROM FOURNISSEUR WHERE ID_FOURNISSEUR = ?';
        const [result] = await query(sql, [id]);
        return result.affectedRows;
    }
};

module.exports = Fournisseur;