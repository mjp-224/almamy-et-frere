// src/routes/factureClientRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET toutes les factures
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        f.ID_FACTURE    AS id_facture,
        f.ID_COMMANDE   AS id_commande,
        f.DATE_FACTURE  AS date_facture,
        f.MONTANT_TOTAL AS montant_total,
        f.SOLDE_RESTANT AS solde_restant,
        cl.NOM          AS client_nom,
        cl.ID_CLIENT    AS id_client
      FROM FACTURE f
      JOIN COMMANDE_CLIENT c ON f.ID_COMMANDE = c.ID_COMMANDE
      JOIN CLIENT cl         ON c.ID_CLIENT   = cl.ID_CLIENT
      ORDER BY f.DATE_FACTURE DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erreur GET /factures-client :', error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET une facture par id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT
        f.ID_FACTURE    AS id_facture,
        f.ID_COMMANDE   AS id_commande,
        f.DATE_FACTURE  AS date_facture,
        f.MONTANT_TOTAL AS montant_total,
        f.SOLDE_RESTANT AS solde_restant,
        cl.NOM          AS client_nom,
        cl.ID_CLIENT    AS id_client
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
    console.error('Erreur GET /factures-client/:id :', error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST créer une facture
router.post('/', async (req, res) => {
  const { id_commande, montant_total } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO facture (id_commande, montant_total, solde_restant, date_facture) VALUES (?, ?, ?, NOW())',
      [id_commande, montant_total, montant_total]
    );
    res.status(201).json({
      id: result.insertId,
      id_commande,
      montant_total,
      solde_restant: montant_total,
      date_facture: new Date()
    });
  } catch (error) {
    console.error('Erreur POST /factures-client :', error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;