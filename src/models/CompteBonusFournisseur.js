// src/models/CompteBonusFournisseur.js
const { query } = require('./index');

const CompteBonusFournisseur = {
    create: async (id_fournisseur) => {
        const sql = 'INSERT INTO COMPTE_BONUS_FOURNISSEUR (ID_FOURNISSEUR) VALUES (?)';
        const [result] = await query(sql, [id_fournisseur]);
        return result.insertId;
    },

    findByFournisseurId: async (id_fournisseur) => {
        const sql = 'SELECT * FROM COMPTE_BONUS_FOURNISSEUR WHERE ID_FOURNISSEUR = ?';
        const results = await query(sql, [id_fournisseur]);
        return results[0] || { SOLDE: 0 };
    },

    updateSolde: async (id_compte, nouveauSolde) => {
        const sql = 'UPDATE COMPTE_BONUS_FOURNISSEUR SET SOLDE = ? WHERE ID_COMPTE = ?';
        const [result] = await query(sql, [nouveauSolde, id_compte]);
        return result.affectedRows;
    }
};

module.exports = CompteBonusFournisseur;