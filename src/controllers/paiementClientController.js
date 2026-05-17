// src/controllers/paiementClientController.js
const pool = require('../config/database');

const paiementClientController = {

  createPaiementClient: async (req, res) => {
    const { id_facture, montant, mode } = req.body;
    try {
      // 1. Vérifier que la facture existe et récupérer le solde restant
      const [factures] = await pool.query(
        'SELECT SOLDE_RESTANT, MONTANT_TOTAL FROM FACTURE WHERE ID_FACTURE = ?',
        [id_facture]
      );
      if (factures.length === 0) {
        return res.status(404).json({ message: 'Facture non trouvée' });
      }

      const solde_restant = parseFloat(factures[0].SOLDE_RESTANT);

      // 2. Vérifier que le montant ne dépasse pas le solde restant
      if (parseFloat(montant) > solde_restant) {
        return res.status(400).json({
          message: `Montant trop élevé. Solde restant : ${solde_restant} GNF`
        });
      }

      if (parseFloat(montant) <= 0) {
        return res.status(400).json({ message: 'Le montant doit être supérieur à 0' });
      }

      // 3. Enregistrer le paiement
      const [result] = await pool.query(
        'INSERT INTO PAIEMENT_CLIENT (ID_FACTURE, MONTANT, MODE) VALUES (?, ?, ?)',
        [id_facture, montant, mode]
      );

      // 4. Mettre à jour le solde restant
      const nouveau_solde = solde_restant - parseFloat(montant);
      await pool.query(
        'UPDATE FACTURE SET SOLDE_RESTANT = ? WHERE ID_FACTURE = ?',
        [nouveau_solde, id_facture]
      );

      res.status(201).json({
        message: 'Paiement enregistré avec succès',
        id_paiement: result.insertId,
        solde_restant: nouveau_solde
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur enregistrement paiement', error: error.message });
    }
  },

  getAllPaiements: async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT
          p.ID_PAIEMENT       AS id_paiement,
          p.ID_FACTURE        AS id_facture,
          p.MONTANT           AS montant,
          p.DATE_PAIEMENT     AS date_paiement,
          p.MODE              AS mode,
          f.MONTANT_TOTAL     AS montant_total,
          f.SOLDE_RESTANT     AS solde_restant,
          cl.NOM              AS client_nom
        FROM PAIEMENT_CLIENT p
        JOIN FACTURE f          ON p.ID_FACTURE  = f.ID_FACTURE
        JOIN COMMANDE_CLIENT c  ON f.ID_COMMANDE = c.ID_COMMANDE
        JOIN CLIENT cl          ON c.ID_CLIENT   = cl.ID_CLIENT
        ORDER BY p.DATE_PAIEMENT DESC
      `);
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur récupération paiements' });
    }
  },

  getPaiementsByFacture: async (req, res) => {
    const { id_facture } = req.params;
    try {
      const [paiements] = await pool.query(
        `SELECT
          ID_PAIEMENT   AS id_paiement,
          ID_FACTURE    AS id_facture,
          MONTANT       AS montant,
          DATE_PAIEMENT AS date_paiement,
          MODE          AS mode
        FROM PAIEMENT_CLIENT
        WHERE ID_FACTURE = ?
        ORDER BY DATE_PAIEMENT DESC`,
        [id_facture]
      );
      res.json(paiements);
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
};

module.exports = paiementClientController;