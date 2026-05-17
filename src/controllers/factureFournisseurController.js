// src/controllers/factureFournisseurController.js

const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// ====================== DOSSIER UPLOAD ======================
const uploadDir = path.join(__dirname, '../../uploads/factures-fournisseurs');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ====================== MULTER ======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont autorisés !'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ====================== CONTROLLER ======================
const factureFournisseurController = {

  // ================= UPLOAD PDF =================
  uploadFacturePDF: (req, res) => {
    upload.single('facture')(req, res, async (err) => {

      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier PDF reçu' });
      }

      const fileName = req.file.filename;

      // 🔥 IMPORTANT: URL PROPRE (PAS DE PATH WINDOWS)
      const fileUrl = `/uploads/factures-fournisseurs/${fileName}`;

      try {
        const [result] = await pool.query(
          `INSERT INTO FACTURE_FOURNISSEUR 
          (ID_ACHAT, MONTANT_TOTAL, fichier_pdf, DATE_FACTURE) 
          VALUES (?, ?, ?, NOW())`,
          [null, 0, fileUrl]
        );

        res.status(201).json({
          success: true,
          message: 'Facture PDF importée avec succès',
          id_facture: result.insertId,
          file: {
            filename: fileName,
            url: fileUrl
          }
        });

      } catch (dbError) {
        console.error(dbError);
        res.status(500).json({
          message: 'Erreur lors de l’enregistrement en base'
        });
      }
    });
  },

  // ================= CREATE =================
  createFactureFournisseur: async (req, res) => {
    try {
      const { id_achat, montant_total } = req.body;

      const [result] = await pool.query(
        `INSERT INTO FACTURE_FOURNISSEUR (ID_ACHAT, MONTANT_TOTAL, DATE_FACTURE)
         VALUES (?, ?, NOW())`,
        [id_achat, montant_total]
      );

      res.status(201).json({
        success: true,
        message: "Facture créée",
        id_facture: result.insertId
      });

    } catch (error) {
      res.status(500).json({
        message: "Erreur création facture"
      });
    }
  },

  // ================= GET ALL =================
  getAllFacturesFournisseur: async (req, res) => {
    try {

      const [factures] = await pool.query(`
        SELECT
          ff.ID_FACTURE AS id_facture,
          ff.ID_ACHAT AS id_achat,
          ff.DATE_FACTURE AS date_facture,
          ff.MONTANT_TOTAL AS montant_total,
          ff.fichier_pdf AS fichier_pdf,
          f.NOM AS fournisseur_nom,
          a.DATE_ACHAT AS date_achat
        FROM FACTURE_FOURNISSEUR ff
        LEFT JOIN ACHAT_USINE a ON ff.ID_ACHAT = a.ID_ACHAT
        LEFT JOIN FOURNISSEUR f ON a.ID_FOURNISSEUR = f.ID_FOURNISSEUR
        ORDER BY ff.DATE_FACTURE DESC
      `);

      const facturesAvecUrl = factures.map(f => ({
        ...f,
        url: f.fichier_pdf
          ? `http://localhost:5000${f.fichier_pdf}`
          : null
      }));

      res.json(facturesAvecUrl);

    } catch (error) {
      res.status(500).json({
        message: 'Erreur récupération factures'
      });
    }
  },

  // ================= GET BY ID =================
  getFactureFournisseurById: async (req, res) => {
    const { id } = req.params;

    try {

      const [factures] = await pool.query(`
        SELECT *
        FROM FACTURE_FOURNISSEUR ff
        LEFT JOIN ACHAT_USINE a ON ff.ID_ACHAT = a.ID_ACHAT
        LEFT JOIN FOURNISSEUR f ON a.ID_FOURNISSEUR = f.ID_FOURNISSEUR
        WHERE ff.ID_FACTURE = ?
      `, [id]);

      if (factures.length === 0) {
        return res.status(404).json({ message: 'Facture non trouvée' });
      }

      const facture = factures[0];

      facture.url = facture.fichier_pdf
        ? `http://localhost:5000${facture.fichier_pdf}`
        : null;

      res.json(facture);

    } catch (error) {
      res.status(500).json({
        message: 'Erreur récupération facture'
      });
    }
  }
};

module.exports = factureFournisseurController;