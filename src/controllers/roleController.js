// src/controllers/roleController.js
const pool = require('../config/database');

const roleController = {
    // Créer un nouveau rôle
    createRole: async (req, res) => {
        const { nom_role } = req.body;

        try {
            const [result] = await pool.query(
                'INSERT INTO ROLE (NOM_ROLE) VALUES (?)',
                [nom_role]
            );

            res.status(201).json({
                message: 'Rôle créé avec succès',
                id_role: result.insertId
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                message: 'Erreur lors de la création du rôle', 
                error: error.message 
            });
        }
    },

    // Récupérer tous les rôles
    getAllRoles: async (req, res) => {
        try {
            const [roles] = await pool.query('SELECT * FROM ROLE ORDER BY NOM_ROLE ASC');
            res.json(roles);
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                message: 'Erreur lors de la récupération des rôles' 
            });
        }
    },

    // Récupérer un rôle par ID
    getRoleById: async (req, res) => {
        const { id } = req.params;

        try {
            const [roles] = await pool.query('SELECT * FROM ROLE WHERE ID_ROLE = ?', [id]);
            
            if (roles.length === 0) {
                return res.status(404).json({ message: 'Rôle non trouvé' });
            }

            res.json(roles[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de la récupération du rôle' });
        }
    },

    // Mettre à jour un rôle
    updateRole: async (req, res) => {
        const { id } = req.params;
        const { nom_role } = req.body;

        try {
            const [result] = await pool.query(
                'UPDATE ROLE SET NOM_ROLE = ? WHERE ID_ROLE = ?',
                [nom_role, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Rôle non trouvé' });
            }

            res.json({ message: 'Rôle mis à jour avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de la mise à jour du rôle' });
        }
    },

    // Supprimer un rôle
    deleteRole: async (req, res) => {
        const { id } = req.params;

        try {
            const [result] = await pool.query('DELETE FROM ROLE WHERE ID_ROLE = ?', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Rôle non trouvé' });
            }

            res.json({ message: 'Rôle supprimé avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erreur lors de la suppression du rôle' });
        }
    }
};

module.exports = roleController;