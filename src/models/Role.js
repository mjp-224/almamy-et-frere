// src/models/Role.js
const { query } = require('./index');

const Role = {
    create: async (nom_role) => {
        const sql = 'INSERT INTO ROLE (NOM_ROLE) VALUES (?)';
        const [result] = await query(sql, [nom_role]);
        return result.insertId;
    },

    findAll: async () => {
        const sql = 'SELECT * FROM ROLE ORDER BY NOM_ROLE ASC';
        return await query(sql);
    },

    findById: async (id) => {
        const sql = 'SELECT * FROM ROLE WHERE ID_ROLE = ?';
        const results = await query(sql, [id]);
        return results[0];
    },

    update: async (id, nom_role) => {
        const sql = 'UPDATE ROLE SET NOM_ROLE = ? WHERE ID_ROLE = ?';
        const [result] = await query(sql, [nom_role, id]);
        return result.affectedRows;
    },

    delete: async (id) => {
        const sql = 'DELETE FROM ROLE WHERE ID_ROLE = ?';
        const [result] = await query(sql, [id]);
        return result.affectedRows;
    }
};

module.exports = Role;