// src/controllers/fournisseurController.js
const pool = require('../config/database');

const fournisseurController = {

  // Créer un nouveau fournisseur
  createFournisseur: async (req, res) => {
    const { nom, telephone, email, ville } = req.body;

    try {
      const [result] = await pool.query(
        'INSERT INTO FOURNISSEUR (NOM, TELEPHONE, EMAIL, VILLE) VALUES (?, ?, ?, ?)',
        [nom, telephone, email, ville]
      );

      res.status(201).json({
        message: 'Fournisseur créé avec succès',
        id: result.insertId
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Erreur lors de la création du fournisseur',
        error: error.message
      });
    }
  },

  // Récupérer tous les fournisseurs
  getAllFournisseurs: async (req, res) => {
    try {
      const [fournisseurs] = await pool.query(`
        SELECT
          ID_FOURNISSEUR  AS id,
          NOM             AS nom,
          TELEPHONE       AS telephone,
          EMAIL           AS email,
          VILLE           AS ville
        FROM FOURNISSEUR
        ORDER BY NOM ASC
      `);
      res.json(fournisseurs);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Erreur lors de la récupération des fournisseurs'
      });
    }
  },

  // Récupérer un fournisseur par ID
  getFournisseurById: async (req, res) => {
    const { id } = req.params;

    try {
      const [fournisseurs] = await pool.query(`
        SELECT
          ID_FOURNISSEUR  AS id,
          NOM             AS nom,
          TELEPHONE       AS telephone,
          EMAIL           AS email,
          VILLE           AS ville
        FROM FOURNISSEUR
        WHERE ID_FOURNISSEUR = ?
      `, [id]);

      if (fournisseurs.length === 0) {
        return res.status(404).json({ message: 'Fournisseur non trouvé' });
      }

      res.json(fournisseurs[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Erreur lors de la récupération du fournisseur'
      });
    }
  },

  // Mettre à jour un fournisseur
  updateFournisseur: async (req, res) => {
    const { id } = req.params;
    const { nom, telephone, email, ville } = req.body;

    try {
      const [result] = await pool.query(
        'UPDATE FOURNISSEUR SET NOM = ?, TELEPHONE = ?, EMAIL = ?, VILLE = ? WHERE ID_FOURNISSEUR = ?',
        [nom, telephone, email, ville, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Fournisseur non trouvé' });
      }

      res.json({ message: 'Fournisseur mis à jour avec succès' });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Erreur lors de la mise à jour du fournisseur'
      });
    }
  },

  // Supprimer un fournisseur
  deleteFournisseur: async (req, res) => {
    const { id } = req.params;

    try {
      const [result] = await pool.query(
        'DELETE FROM FOURNISSEUR WHERE ID_FOURNISSEUR = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Fournisseur non trouvé' });
      }

      res.json({ message: 'Fournisseur supprimé avec succès' });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Erreur lors de la suppression du fournisseur'
      });
    }
  }
};

module.exports = fournisseurController;