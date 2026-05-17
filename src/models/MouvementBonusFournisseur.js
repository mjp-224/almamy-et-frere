// src/models/MouvementBonusFournisseur.js
const { query } = require('./index');

const MouvementBonusFournisseur = {
    create: async (data) => {
        const { id_compte, id_achat, type, montant } = data;
        const sql = `
            INSERT INTO MOUVEMENT_BONUS_FOURNISSEUR 
            (ID_COMPTE, ID_ACHAT, TYPE, MONTANT) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await query(sql, [id_compte, id_achat, type, montant]);
        return result.insertId;
    },

    findByCompteId: async (id_compte) => {
        const sql = `
            SELECT mb.*, a.DATE_ACHAT, f.NOM as fournisseur_nom
            FROM MOUVEMENT_BONUS_FOURNISSEUR mb
            JOIN COMPTE_BONUS_FOURNISSEUR cb ON mb.ID_COMPTE = cb.ID_COMPTE
            JOIN ACHAT_USINE a ON mb.ID_ACHAT = a.ID_ACHAT
            JOIN FOURNISSEUR f ON a.ID_FOURNISSEUR = f.ID_FOURNISSEUR
            WHERE mb.ID_COMPTE = ?
            ORDER BY mb.DATE_MOUVEMENT DESC
        `;
        return await query(sql, [id_compte]);
    },

    findByAchatId: async (id_achat) => {
        const sql = 'SELECT * FROM MOUVEMENT_BONUS_FOURNISSEUR WHERE ID_ACHAT = ?';
        return await query(sql, [id_achat]);
    }
};

module.exports = MouvementBonusFournisseur;