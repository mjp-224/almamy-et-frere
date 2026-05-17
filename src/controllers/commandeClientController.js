// src/controllers/commandeClientController.js
const pool = require('../config/database');
const historiqueHelper = require('../utils/historiqueHelper');

const commandeClientController = {

  createCommande: async (req, res) => {
    const { id_client, statut } = req.body;
    try {
      const [result] = await pool.query(
        'INSERT INTO COMMANDE_CLIENT (ID_CLIENT, MONTANT_TOTAL, STATUT) VALUES (?, ?, ?)',
        [id_client, 0, statut || 'EN_COURS'] // ← montant_total commence à 0
      );
      // Enregistrer dans l'historique
      const id_utilisateur = req.user?.id || req.user?.id_utilisateur;
      await historiqueHelper.logAction(
        id_utilisateur,
        'CREATION_COMMANDE',
        `Commande #${result.insertId} créée pour client ID ${id_client}`
      );

      res.status(201).json({
        message: 'Commande client créée avec succès',
        id_commande: result.insertId
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la création de la commande client', error: error.message });
    }
  },

  getAllCommandes: async (req, res) => {
    try {
      const [commandes] = await pool.query(`
        SELECT 
          c.ID_COMMANDE   AS id_commande,
          c.ID_CLIENT     AS id_client,
          c.DATE_COMMANDE AS date_commande,
          c.MONTANT_TOTAL AS montant_total,
          c.STATUT        AS statut,
          cl.NOM          AS client_nom
        FROM COMMANDE_CLIENT c
        JOIN CLIENT cl ON c.ID_CLIENT = cl.ID_CLIENT
        ORDER BY c.DATE_COMMANDE DESC
      `);
      res.json(commandes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la récupération des commandes' });
    }
  },

  getCommandeById: async (req, res) => {
    const { id } = req.params;
    try {
      const [commandes] = await pool.query(`
        SELECT 
          c.ID_COMMANDE   AS id_commande,
          c.ID_CLIENT     AS id_client,
          c.DATE_COMMANDE AS date_commande,
          c.MONTANT_TOTAL AS montant_total,
          c.STATUT        AS statut,
          cl.NOM          AS client_nom
        FROM COMMANDE_CLIENT c
        JOIN CLIENT cl ON c.ID_CLIENT = cl.ID_CLIENT
        WHERE c.ID_COMMANDE = ?
      `, [id]);
      if (commandes.length === 0) {
        return res.status(404).json({ message: 'Commande non trouvée' });
      }
      res.json(commandes[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la récupération de la commande' });
    }
  },

  updateStatut: async (req, res) => {
    const { id } = req.params;
    const { statut } = req.body;
    try {
      const [result] = await pool.query(
        'UPDATE COMMANDE_CLIENT SET STATUT = ? WHERE ID_COMMANDE = ?',
        [statut, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Commande non trouvée' });
      }
      // Enregistrer dans l'historique
      const id_utilisateur = req.user?.id || req.user?.id_utilisateur;
      await historiqueHelper.logAction(
        id_utilisateur,
        'MODIFICATION_STATUT_COMMANDE',
        `Commande #${id} - Statut changé en: ${statut}`
      );

      res.json({ message: 'Statut mis à jour avec succès' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' });
    }
  },

  // ← NOUVEAU : recalcule et met à jour le montant total
  updateMontantTotal: async (req, res) => {
    const { id } = req.params;
    try {
      // Calcule la somme réelle depuis les détails
      const [rows] = await pool.query(`
        SELECT COALESCE(SUM(QUANTITE * PRIX_UNITAIRE), 0) AS total
        FROM DETAIL_COMMANDE
        WHERE ID_COMMANDE = ?
      `, [id]);

      const total = rows[0].TOTAL || rows[0].total || 0;

      await pool.query(
        'UPDATE COMMANDE_CLIENT SET MONTANT_TOTAL = ? WHERE ID_COMMANDE = ?',
        [total, id]
      );

      res.json({ message: 'Montant total mis à jour', montant_total: total });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur mise à jour montant total' });
    }
  }
};

module.exports = commandeClientController;