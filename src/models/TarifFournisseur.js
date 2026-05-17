// src/models/TarifFournisseur.js
const { query } = require('./index');

const TarifFournisseur = {
    create: async (data) => {
        const { id_fournisseur, id_produit, prix, date_debut, date_fin } = data;
        const sql = `
            INSERT INTO TARIF_FOURNISSEUR 
            (ID_FOURNISSEUR, ID_PRODUIT, PRIX, DATE_DEBUT, DATE_FIN) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await query(sql, [id_fournisseur, id_produit, prix, date_debut, date_fin]);
        return result.insertId;
    },

    findAll: async () => {
        const sql = `
            SELECT t.*, f.NOM as fournisseur_nom, p.NOM as produit_nom
            FROM TARIF_FOURNISSEUR t
            JOIN FOURNISSEUR f ON t.ID_FOURNISSEUR = f.ID_FOURNISSEUR
            JOIN PRODUIT p ON t.ID_PRODUIT = p.ID_PRODUIT
            ORDER BY f.NOM, p.NOM
        `;
        return await query(sql);
    },

    findById: async (id) => {
        const sql = `
            SELECT t.*, f.NOM as fournisseur_nom, p.NOM as produit_nom
            FROM TARIF_FOURNISSEUR t
            JOIN FOURNISSEUR f ON t.ID_FOURNISSEUR = f.ID_FOURNISSEUR
            JOIN PRODUIT p ON t.ID_PRODUIT = p.ID_PRODUIT
            WHERE t.ID_TARIF = ?
        `;
        const results = await query(sql, [id]);
        return results[0];
    },

    update: async (id, data) => {
        const { prix, date_debut, date_fin } = data;
        const sql = `
            UPDATE TARIF_FOURNISSEUR 
            SET PRIX = ?, DATE_DEBUT = ?, DATE_FIN = ? 
            WHERE ID_TARIF = ?
        `;
        const [result] = await query(sql, [prix, date_debut, date_fin, id]);
        return result.affectedRows;
    },

    delete: async (id) => {
        const sql = 'DELETE FROM TARIF_FOURNISSEUR WHERE ID_TARIF = ?';
        const [result] = await query(sql, [id]);
        return result.affectedRows;
    }
};

module.exports = TarifFournisseur;