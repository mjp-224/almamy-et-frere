// src/controllers/depenseController.js
const pool = require('../config/database');
const historiqueHelper = require('../utils/historiqueHelper');

const depenseController = {

    // Créer une dépense
    // Dans src/controllers/depenseController.js

createDepense: async (req, res) => {
    const { montant, date_depense, categorie, description } = req.body;
    
    // Correction importante ici
    const id_utilisateur = req.user?.id || req.user?.id_utilisateur;

    console.log('🆔 ID utilisateur récupéré du token:', id_utilisateur); // Debug

    if (!id_utilisateur) {
        return res.status(401).json({ message: 'Utilisateur non authentifié - ID manquant' });
    }

    if (!montant || !date_depense || !categorie) {
        return res.status(400).json({ 
            message: 'Montant, date et catégorie sont obligatoires' 
        });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO DEPENSE 
            (ID_UTILISATEUR, MONTANT, DATE_DEPENSE, CATEGORIE, DESCRIPTION) 
            VALUES (?, ?, ?, ?, ?)`,
            [id_utilisateur, montant, date_depense, categorie, description || null]
        );

        // Enregistrer dans l'historique
        await historiqueHelper.logAction(
            id_utilisateur,
            'CREATION_DEPENSE',
            `Dépense #${result.insertId} créée: ${montant} GNF - ${categorie}`
        );

        res.status(201).json({
            message: 'Dépense enregistrée avec succès',
            id_depense: result.insertId
        });
    } catch (error) {
        console.error('Erreur createDepense:', error);
        res.status(500).json({
            message: 'Erreur lors de l\'enregistrement de la dépense',
            error: error.message
        });
    }
},

    // Récupérer toutes les dépenses avec filtres
    getAllDepenses: async (req, res) => {
        const { startDate, endDate, categorie, search } = req.query;

        let query = `
            SELECT d.*, u.NOM as utilisateur_nom, u.PRENOM as utilisateur_prenom 
            FROM DEPENSE d
            JOIN UTILISATEUR u ON d.ID_UTILISATEUR = u.ID_UTILISATEUR
            WHERE 1=1
        `;
        const params = [];

        if (startDate) { query += ' AND d.DATE_DEPENSE >= ?'; params.push(startDate); }
        if (endDate)   { query += ' AND d.DATE_DEPENSE <= ?'; params.push(endDate); }
        if (categorie) { query += ' AND d.CATEGORIE = ?'; params.push(categorie); }
        if (search) {
            query += ' AND (d.DESCRIPTION LIKE ? OR u.NOM LIKE ? OR u.PRENOM LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY d.DATE_DEPENSE DESC';

        try {
            const [depenses] = await pool.query(query, params);
            res.json(depenses);
        } catch (error) {
            console.error('Erreur getAllDepenses:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des dépenses' });
        }
    },

    // Récupérer une dépense par ID
    getDepenseById: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await pool.query(`
                SELECT d.*, u.NOM, u.PRENOM 
                FROM DEPENSE d
                JOIN UTILISATEUR u ON d.ID_UTILISATEUR = u.ID_UTILISATEUR
                WHERE d.ID_DEPENSE = ?
            `, [id]);

            if (rows.length === 0) return res.status(404).json({ message: 'Dépense non trouvée' });

            res.json(rows[0]);
        } catch (error) {
            console.error('Erreur getDepenseById:', error);
            res.status(500).json({ message: 'Erreur serveur' });
        }
    },

    // Modifier une dépense
updateDepense: async (req, res) => {
    const { id } = req.params;
    const { montant, date_depense, categorie, description } = req.body;

    const id_utilisateur = req.user?.id || req.user?.id_utilisateur;

    console.log("USER:", req.user);
    console.log("ID USER:", id_utilisateur);
    console.log("ID DEPENSE:", id);

    try {
        const [result] = await pool.query(
            `UPDATE DEPENSE 
             SET MONTANT = ?, DATE_DEPENSE = ?, CATEGORIE = ?, DESCRIPTION = ?
             WHERE ID_DEPENSE = ? AND ID_UTILISATEUR = ?`,
            [montant, date_depense, categorie, description || null, id, id_utilisateur]
        );

        console.log("RESULT:", result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: 'Dépense non trouvée ou accès refusé' 
            });
        }

        // Enregistrer dans l'historique
        await historiqueHelper.logAction(
            id_utilisateur,
            'MODIFICATION_DEPENSE',
            `Dépense #${id} modifiée: ${montant} GNF - ${categorie}`
        );

        res.json({ message: 'Dépense mise à jour avec succès' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur mise à jour' });
    }
},

    // Supprimer une dépense
    deleteDepense: async (req, res) => {
        const { id } = req.params;
        const id_utilisateur = req.user?.id || req.user?.id_utilisateur;

        try {
            const [result] = await pool.query(
                `DELETE FROM DEPENSE WHERE ID_DEPENSE = ? AND ID_UTILISATEUR = ?`,
                [id, id_utilisateur]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Dépense non trouvée ou accès refusé' });
            }

            // Enregistrer dans l'historique
            await historiqueHelper.logAction(
                id_utilisateur,
                'SUPPRESSION_DEPENSE',
                `Dépense #${id} supprimée`
            );

            res.json({ message: 'Dépense supprimée avec succès' });
        } catch (error) {
            console.error('Erreur deleteDepense:', error);
            res.status(500).json({ message: 'Erreur lors de la suppression' });
        }
    }
};

module.exports = depenseController;