// src/models/Client.js
const { query } = require('./index');

const Client = {
    create: async (data) => {
        const { nom, telephone, adresse, plafond_credit } = data;
        const sql = 'INSERT INTO CLIENT (NOM, TELEPHONE, ADRESSE, PLAFOND_CREDIT) VALUES (?, ?, ?, ?)';
        const [result] = await query(sql, [nom, telephone, adresse, plafond_credit || 0]);
        return result.insertId;
    },

    findAll: async () => {
        const sql = 'SELECT * FROM CLIENT ORDER BY NOM ASC';
        return await query(sql);
    },

    findById: async (id) => {
        const sql = 'SELECT * FROM CLIENT WHERE ID_CLIENT = ?';
        const results = await query(sql, [id]);
        return results[0];
    },

    update: async (id, data) => {
        const { nom, telephone, adresse, plafond_credit } = data;
        const sql = 'UPDATE CLIENT SET NOM = ?, TELEPHONE = ?, ADRESSE = ?, PLAFOND_CREDIT = ? WHERE ID_CLIENT = ?';
        const [result] = await query(sql, [nom, telephone, adresse, plafond_credit, id]);
        return result.affectedRows;
    },

    delete: async (id) => {
        const sql = 'DELETE FROM CLIENT WHERE ID_CLIENT = ?';
        const [result] = await query(sql, [id]);
        return result.affectedRows;
    }
};

module.exports = Client;