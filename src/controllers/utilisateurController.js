// src/controllers/utilisateurController.js
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const utilisateurController = {

    // ==================== CRÉER UN UTILISATEUR ====================
    create: async (req, res) => {
        const { nom, prenom, email, mot_de_passe, telephone, id_role } = req.body;

        if (!nom || !prenom || !email || !mot_de_passe || !id_role) {
            return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis' });
        }

        try {
            const [existing] = await pool.query(
                'SELECT ID_UTILISATEUR FROM UTILISATEUR WHERE EMAIL = ?', 
                [email]
            );
            if (existing.length > 0) {
                return res.status(409).json({ message: 'Cet email est déjà utilisé' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(mot_de_passe, salt);

            const [result] = await pool.query(`
                INSERT INTO UTILISATEUR 
                (NOM, PRENOM, EMAIL, MOT_DE_PASSE, TELEPHONE, ID_ROLE, STATUT, DATE_CREATION)
                VALUES (?, ?, ?, ?, ?, ?, 1, NOW())
            `, [nom, prenom, email, hashedPassword, telephone, id_role]);

            res.status(201).json({
                message: 'Utilisateur créé avec succès',
                id: result.insertId
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erreur lors de la création de l'utilisateur" });
        }
    },

    // ==================== RÉCUPÉRER TOUS LES UTILISATEURS ====================
    getAllUtilisateurs: async (req, res) => {
        try {
            const [utilisateurs] = await pool.query(`
                SELECT 
                    u.ID_UTILISATEUR    AS id,
                    u.NOM               AS nom,
                    u.PRENOM            AS prenom,
                    u.EMAIL             AS email,
                    u.TELEPHONE         AS telephone,
                    u.DATE_CREATION     AS date_creation,
                    u.STATUT            AS statut,
                    r.NOM_ROLE          AS role_nom
                FROM UTILISATEUR u
                JOIN ROLE r ON u.ID_ROLE = r.ID_ROLE
                ORDER BY u.NOM, u.PRENOM
            `);
            res.json(utilisateurs);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
        }
    },

    // ==================== RÉCUPÉRER UN UTILISATEUR PAR ID ====================
    getUtilisateurById: async (req, res) => {
        const { id } = req.params;

        try {
            const [utilisateurs] = await pool.query(`
                SELECT 
                    u.ID_UTILISATEUR    AS id,
                    u.NOM               AS nom,
                    u.PRENOM            AS prenom,
                    u.EMAIL             AS email,
                    u.TELEPHONE         AS telephone,
                    u.DATE_CREATION     AS date_creation,
                    u.STATUT            AS statut,
                    r.ID_ROLE           AS id_role,
                    r.NOM_ROLE          AS role_nom
                FROM UTILISATEUR u
                JOIN ROLE r ON u.ID_ROLE = r.ID_ROLE
                WHERE u.ID_UTILISATEUR = ?
            `, [id]);

            if (utilisateurs.length === 0) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            res.json(utilisateurs[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur" });
        }
    },

    // ==================== METTRE À JOUR UN UTILISATEUR ====================
    updateUtilisateur: async (req, res) => {
        const { id } = req.params;
        const { nom, prenom, email, telephone, id_role, statut } = req.body;

        try {
            const [result] = await pool.query(`
                UPDATE UTILISATEUR 
                SET NOM = ?, PRENOM = ?, EMAIL = ?, TELEPHONE = ?, 
                    ID_ROLE = ?, STATUT = ?
                WHERE ID_UTILISATEUR = ?
            `, [nom, prenom, email, telephone, id_role, statut, id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            res.json({ message: 'Utilisateur mis à jour avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
        }
    },

    // ==================== CHANGER MOT DE PASSE ====================
    changePassword: async (req, res) => {
        const { id } = req.params;
        const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;

        try {
            const [users] = await pool.query(
                'SELECT MOT_DE_PASSE FROM UTILISATEUR WHERE ID_UTILISATEUR = ?',
                [id]
            );

            if (users.length === 0) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            const isMatch = await bcrypt.compare(ancien_mot_de_passe, users[0].MOT_DE_PASSE);
            if (!isMatch) {
                return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(nouveau_mot_de_passe, salt);

            await pool.query(
                'UPDATE UTILISATEUR SET MOT_DE_PASSE = ? WHERE ID_UTILISATEUR = ?',
                [hashedPassword, id]
            );

            res.json({ message: 'Mot de passe changé avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors du changement de mot de passe' });
        }
    },

    // ==================== ACTIVER / DÉSACTIVER ====================
    toggleStatut: async (req, res) => {
        const { id } = req.params;
        const { statut } = req.body;

        try {
            const [result] = await pool.query(
                'UPDATE UTILISATEUR SET STATUT = ? WHERE ID_UTILISATEUR = ?',
                [statut, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }

            res.json({
                message: `Utilisateur ${statut === 1 ? 'activé' : 'désactivé'} avec succès`
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors du changement de statut' });
        }
    }
};

module.exports = utilisateurController;