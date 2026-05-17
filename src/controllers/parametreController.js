// src/controllers/parametreController.js
const pool = require('../config/database');
const historiqueHelper = require('../utils/historiqueHelper');

const parametreController = {
    // Créer ou mettre à jour un paramètre (UPSERT)
    create: async (req, res) => {
        const { nom, valeur, description } = req.body;

        try {
            // Vérifier si le paramètre existe déjà
            const [existing] = await pool.query(
                'SELECT ID_PARAMETRE FROM PARAMETRE WHERE NOM = ?',
                [nom]
            );

            if (existing.length > 0) {
                // Mettre à jour le paramètre existant
                const id = existing[0].ID_PARAMETRE;
                await pool.query(
                    'UPDATE PARAMETRE SET VALEUR = ?, DESCRIPTION = ? WHERE ID_PARAMETRE = ?',
                    [valeur, description || '', id]
                );

                // Enregistrer dans l'historique
                const id_utilisateur = req.user?.id || req.user?.id_utilisateur;
                await historiqueHelper.logAction(
                    id_utilisateur,
                    'MODIFICATION_PARAMETRE',
                    `Paramètre ${nom} modifié: ${valeur}`
                );

                return res.status(200).json({
                    message: 'Paramètre mis à jour avec succès',
                    id: id
                });
            }

            // Créer un nouveau paramètre
            const [result] = await pool.query(
                'INSERT INTO PARAMETRE (NOM, VALEUR, DESCRIPTION) VALUES (?, ?, ?)',
                [nom, valeur, description || '']
            );

            // Enregistrer dans l'historique
            const id_utilisateur = req.user?.id || req.user?.id_utilisateur;
            await historiqueHelper.logAction(
                id_utilisateur,
                'CREATION_PARAMETRE',
                `Paramètre créé: ${nom} = ${valeur}`
            );

            res.status(201).json({
                message: 'Paramètre créé avec succès',
                id: result.insertId
            });
        } catch (error) {
            console.error('Erreur create parametre:', error);
            res.status(500).json({ message: 'Erreur lors de la création du paramètre', error: error.message });
        }
    },

    // Récupérer tous les paramètres
    getAll: async (req, res) => {
        try {
            const [parametres] = await pool.query('SELECT * FROM PARAMETRE ORDER BY NOM ASC');
            res.json(parametres);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de la récupération des paramètres' });
        }
    },

    // Récupérer un paramètre par ID
    getById: async (req, res) => {
        const { id } = req.params;
        try {
            const [parametres] = await pool.query('SELECT * FROM PARAMETRE WHERE ID_PARAMETRE = ?', [id]);
            if (parametres.length === 0) {
                return res.status(404).json({ message: 'Paramètre non trouvé' });
            }
            res.json(parametres[0]);
        } catch (error) {
            res.status(500).json({ message: 'Erreur serveur' });
        }
    },

    // Mettre à jour un paramètre
    update: async (req, res) => {
        const { id } = req.params;
        const { valeur, description } = req.body;

        try {
            const [result] = await pool.query(
                'UPDATE PARAMETRE SET VALEUR = ?, DESCRIPTION = ? WHERE ID_PARAMETRE = ?',
                [valeur, description, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Paramètre non trouvé' });
            }

            // Enregistrer dans l'historique
            const id_utilisateur = req.user?.id || req.user?.id_utilisateur;
            await historiqueHelper.logAction(
                id_utilisateur,
                'MODIFICATION_PARAMETRE',
                `Paramètre #${id} modifié: nouvelle valeur = ${valeur}`
            );

            res.json({ message: 'Paramètre mis à jour avec succès' });
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la mise à jour' });
        }
    }
};

module.exports = parametreController;