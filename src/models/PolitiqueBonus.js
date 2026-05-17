// src/models/PolitiqueBonus.js
const { query } = require('./index');

const PolitiqueBonus = {
    create: async (data) => {
        const { id_fournisseur, type_bonus, seuil, montant, unite, periode } = data;
        const sql = `
            INSERT INTO POLITIQUE_BONUS 
            (ID_FOURNISSEUR, TYPE_BONUS, SEUIL, MONTANT, UNITE, PERIODE) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await query(sql, [id_fournisseur, type_bonus, seuil, montant, unite, periode]);
        return result.insertId;
    },

    findAll: async () => {
        const sql = `
            SELECT pb.*, f.NOM as fournisseur_nom 
            FROM POLITIQUE_BONUS pb
            JOIN FOURNISSEUR f ON pb.ID_FOURNISSEUR = f.ID_FOURNISSEUR
            ORDER BY f.NOM
        `;
        return await query(sql);
    },

    findByFournisseurId: async (id_fournisseur) => {
        const sql = 'SELECT * FROM POLITIQUE_BONUS WHERE ID_FOURNISSEUR = ?';
        return await query(sql, [id_fournisseur]);
    }
};

module.exports = PolitiqueBonus;