// src/models/Depense.js
const { query } = require('./index');

const Depense = {
    create: async (data) => {
        const { id_utilisateur, montant, date_depense, categorie, description } = data;
        const sql = `
            INSERT INTO DEPENSE 
            (ID_UTILISATEUR, MONTANT, DATE_DEPENSE, CATEGORIE, DESCRIPTION) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await query(sql, [id_utilisateur, montant, date_depense, categorie, description]);
        return result.insertId;
    },

    findAll: async () => {
        const sql = `
            SELECT d.*, u.NOM as utilisateur_nom, u.PRENOM as utilisateur_prenom
            FROM DEPENSE d
            JOIN UTILISATEUR u ON d.ID_UTILISATEUR = u.ID_UTILISATEUR
            ORDER BY d.DATE_DEPENSE DESC
        `;
        return await query(sql);
    },

    findByUtilisateurId: async (id_utilisateur) => {
        const sql = `
            SELECT * FROM DEPENSE 
            WHERE ID_UTILISATEUR = ? 
            ORDER BY DATE_DEPENSE DESC
        `;
        return await query(sql, [id_utilisateur]);
    },

    findById: async (id) => {
        const sql = `
            SELECT d.*, u.NOM, u.PRENOM 
            FROM DEPENSE d
            JOIN UTILISATEUR u ON d.ID_UTILISATEUR = u.ID_UTILISATEUR
            WHERE d.ID_DEPENSE = ?
        `;
        const results = await query(sql, [id]);
        return results[0];
    }
};

module.exports = Depense;