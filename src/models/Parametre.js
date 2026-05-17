// src/models/Parametre.js
const { query } = require('./index');

const Parametre = {
    create: async (data) => {
        const { nom, valeur, description } = data;
        const sql = 'INSERT INTO PARAMETRE (NOM, VALEUR, DESCRIPTION) VALUES (?, ?, ?)';
        const [result] = await query(sql, [nom, valeur, description]);
        return result.insertId;
    },

    findAll: async () => {
        const sql = 'SELECT * FROM PARAMETRE ORDER BY NOM ASC';
        return await query(sql);
    },

    findByNom: async (nom) => {
        const sql = 'SELECT * FROM PARAMETRE WHERE NOM = ?';
        const results = await query(sql, [nom]);
        return results[0];
    },

    update: async (id, data) => {
        const { valeur, description } = data;
        const sql = 'UPDATE PARAMETRE SET VALEUR = ?, DESCRIPTION = ? WHERE ID_PARAMETRE = ?';
        const [result] = await query(sql, [valeur, description, id]);
        return result.affectedRows;
    },

    delete: async (id) => {
        const sql = 'DELETE FROM PARAMETRE WHERE ID_PARAMETRE = ?';
        const [result] = await query(sql, [id]);
        return result.affectedRows;
    }
};

module.exports = Parametre;