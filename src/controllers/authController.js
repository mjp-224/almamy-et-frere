// src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const env = require('../config/env');

const authController = {
    // Inscription d'un utilisateur
    register: async (req, res) => {
        const { nom, prenom, email, mot_de_passe, telephone, id_role } = req.body;

        try {
            // Vérifier si l'email existe déjà
            const [existingUser] = await pool.query('SELECT * FROM UTILISATEUR WHERE EMAIL = ?', [email]);
            if (existingUser.length > 0) {
                return res.status(400).json({ message: 'Cet email est déjà utilisé' });
            }

            // Hasher le mot de passe
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(mot_de_passe, salt);

            // Insérer l'utilisateur
            const [result] = await pool.query(
                'INSERT INTO UTILISATEUR (NOM, PRENOM, EMAIL, MOT_DE_PASSE, TELEPHONE, ID_ROLE) VALUES (?, ?, ?, ?, ?, ?)',
                [nom, prenom, email, hashedPassword, telephone, id_role]
            );

            res.status(201).json({
                message: 'Utilisateur créé avec succès',
                userId: result.insertId
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de l\'inscription', error: error.message });
        }
    },

    // Connexion
    login: async (req, res) => {
        const { email, mot_de_passe } = req.body;

        try {
            const [users] = await pool.query(
                'SELECT * FROM UTILISATEUR WHERE EMAIL = ? AND STATUT = 1',
                [email]
            );

            if (users.length === 0) {
                return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
            }

            const user = users[0];

            const isMatch = await bcrypt.compare(mot_de_passe, user.MOT_DE_PASSE);
            if (!isMatch) {
                return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
            }

            // Générer le token JWT
            const token = jwt.sign(
                { 
                    id: user.ID_UTILISATEUR,
                    email: user.EMAIL,
                    role: user.ID_ROLE 
                },
                env.JWT_SECRET,
                { expiresIn: env.JWT_EXPIRES_IN }
            );

            res.json({
                message: 'Connexion réussie',
                token,
                user: {
                    id: user.ID_UTILISATEUR,
                    nom: user.NOM,
                    prenom: user.PRENOM,
                    email: user.EMAIL,
                    role: user.ID_ROLE
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de la connexion' });
        }
    }
};

module.exports = authController;