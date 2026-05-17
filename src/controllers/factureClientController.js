// src/controllers/factureClientController.js
const pool = require('../config/database');
const historiqueHelper = require('../utils/historiqueHelper');
const bonusHelper = require('../utils/bonusHelper');

const factureClientController = {

  createFacture: async (req, res) => {
    console.log('🔥🔥🔥 ROUTE createFacture APPELÉE');
    console.log('📦 Body reçu:', req.body);
    
    const { id_commande, montant_total } = req.body;
    
    // Démarrer une transaction
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Vérifier si une facture existe déjà
      const [existing] = await connection.query(
        'SELECT ID_FACTURE FROM FACTURE WHERE ID_COMMANDE = ?', [id_commande]
      );
      if (existing.length > 0) {
        await connection.release();
        return res.status(400).json({ message: 'Une facture existe déjà pour cette commande' });
      }
      
      // Récupérer l'ID_CLIENT de la commande
      const [commandeRows] = await connection.query(
        'SELECT ID_CLIENT FROM COMMANDE_CLIENT WHERE ID_COMMANDE = ?', [id_commande]
      );
      if (commandeRows.length === 0) {
        await connection.release();
        return res.status(404).json({ message: 'Commande non trouvée' });
      }
      const id_client = commandeRows[0].ID_CLIENT;
      
      // Créer la facture avec ID_CLIENT
      const [result] = await connection.query(
        'INSERT INTO FACTURE (ID_COMMANDE, ID_CLIENT, MONTANT_TOTAL, SOLDE_RESTANT) VALUES (?, ?, ?, ?)',
        [id_commande, id_client, montant_total, montant_total]
      );
      
      const id_facture = result.insertId;
      
      // Récupérer les détails de la commande
      const [detailsCommande] = await connection.query(
        'SELECT ID_PRODUIT, QUANTITE, PRIX_UNITAIRE FROM DETAIL_COMMANDE WHERE ID_COMMANDE = ?',
        [id_commande]
      );
      
      console.log('📋 Détails commande à copier:', detailsCommande);
      
      // Insérer les détails dans DETAIL_FACTURE
      if (detailsCommande.length > 0) {
        for (const detail of detailsCommande) {
          await connection.query(
            'INSERT INTO DETAIL_FACTURE (ID_FACTURE, ID_PRODUIT, QUANTITE, PRIX_UNITAIRE) VALUES (?, ?, ?, ?)',
            [id_facture, detail.ID_PRODUIT, detail.QUANTITE, detail.PRIX_UNITAIRE]
          );
        }
        console.log(`✅ ${detailsCommande.length} détails facture créés`);
      }
      
      // Commit la transaction
      await connection.commit();
      
      const id_utilisateur = req.user?.id || req.user?.id_utilisateur;

      // Calcul et attribution automatique du bonus fournisseur
      await bonusHelper.processBonusForFacture(id_facture, id_utilisateur);
      
      // Enregistrer dans l'historique
      await historiqueHelper.logAction(
        id_utilisateur,
        'CREATION_FACTURE',
        `Facture #${id_facture} créée pour commande #${id_commande} - ${montant_total} GNF (${detailsCommande.length} articles)`
      );

      console.log(`✅ Facture #${id_facture} créée avec ${detailsCommande.length} articles`);
      
      res.status(201).json({
        message: 'Facture client créée avec succès',
        id_facture: id_facture,
        nb_articles: detailsCommande.length,
        details_copies: detailsCommande
      });
    } catch (error) {
      await connection.rollback();
      console.error('❌ Erreur création facture:', error);
      res.status(500).json({ message: 'Erreur création facture client', error: error.message });
    } finally {
      connection.release();
    }
  },

  getAllFactures: async (req, res) => {
    try {
      const [factures] = await pool.query(`
  SELECT 
    f.ID_FACTURE AS id_facture,
    f.DATE_FACTURE AS date_facture,
    f.MONTANT_TOTAL AS montant_total,
    f.SOLDE_RESTANT AS solde_restant,
    f.STATUT AS statut,
    c.NOM AS client_nom
  FROM FACTURE f
  LEFT JOIN CLIENT c ON f.ID_CLIENT = c.ID_CLIENT
  ORDER BY f.DATE_FACTURE DESC
`);
      res.json(factures);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur récupération factures client' });
    }
  },

  getFactureById: async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await pool.query(`
        SELECT
          f.ID_FACTURE        AS id_facture,
          f.ID_COMMANDE       AS id_commande,
          f.DATE_FACTURE      AS date_facture,
          f.MONTANT_TOTAL     AS montant_total,
          f.SOLDE_RESTANT     AS solde_restant,
          cl.NOM              AS client_nom,
          cl.ID_CLIENT        AS id_client
        FROM FACTURE f
        JOIN COMMANDE_CLIENT c ON f.ID_COMMANDE = c.ID_COMMANDE
        JOIN CLIENT cl         ON c.ID_CLIENT   = cl.ID_CLIENT
        WHERE f.ID_FACTURE = ?
      `, [id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Facture non trouvée' });
      }
      res.json(rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur récupération facture client' });
    }
  }
};

module.exports = factureClientController;