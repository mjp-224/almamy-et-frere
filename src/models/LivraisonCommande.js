// src/models/LivraisonCommande.js
const { query } = require('./index');

const LivraisonCommande = {
    create: async (data) => {
        const { id_livraison, id_commande, quantite } = data;
        const sql = `
            INSERT INTO LIVRAISON_COMMANDE (ID_LIVRAISON, ID_COMMANDE, QUANTITE) 
            VALUES (?, ?, ?)
        `;
        const [result] = await query(sql, [id_livraison, id_commande, quantite]);
        return result.insertId;
    },

    findByLivraisonId: async (id_livraison) => {
        const sql = `
            SELECT lc.*, c.DATE_COMMANDE, cl.NOM as client_nom
            FROM LIVRAISON_COMMANDE lc
            JOIN COMMANDE_CLIENT c ON lc.ID_COMMANDE = c.ID_COMMANDE
            JOIN CLIENT cl ON c.ID_CLIENT = cl.ID_CLIENT
            WHERE lc.ID_LIVRAISON = ?
        `;
        return await query(sql, [id_livraison]);
    },

    findByCommandeId: async (id_commande) => {
        const sql = 'SELECT * FROM LIVRAISON_COMMANDE WHERE ID_COMMANDE = ?';
        return await query(sql, [id_commande]);
    }
};

module.exports = LivraisonCommande;