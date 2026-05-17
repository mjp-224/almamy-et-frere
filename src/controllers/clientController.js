// src/controllers/clientController.js
const pool = require('../config/database');

const clientController = {
    // Créer un nouveau client
    createClient: async (req, res) => {
        const { nom, telephone, adresse, plafond_credit } = req.body;

        try {
            const [result] = await pool.query(
                'INSERT INTO CLIENT (NOM, TELEPHONE, ADRESSE, PLAFOND_CREDIT) VALUES (?, ?, ?, ?)',
                [nom, telephone, adresse, plafond_credit || 0]
            );

            res.status(201).json({
                message: 'Client créé avec succès',
                id_client: result.insertId
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                message: 'Erreur lors de la création du client', 
                error: error.message 
            });
        }
    },

    // Récupérer tous les clients
    getAllClients: async (req, res) => {
        try {
            const [clients] = await pool.query(
                'SELECT * FROM CLIENT ORDER BY NOM ASC'
            );
            res.json(clients);
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                message: 'Erreur lors de la récupération des clients' 
            });
        }
    },

    // Récupérer un client par ID
    getClientById: async (req, res) => {
        const { id } = req.params;

        try {
            const [clients] = await pool.query(
                'SELECT * FROM CLIENT WHERE ID_CLIENT = ?', 
                [id]
            );

            if (clients.length === 0) {
                return res.status(404).json({ message: 'Client non trouvé' });
            }

            res.json(clients[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                message: 'Erreur lors de la récupération du client' 
            });
        }
    },

    // Mettre à jour un client
    updateClient: async (req, res) => {
        const { id } = req.params;
        const { nom, telephone, adresse, plafond_credit } = req.body;

        try {
            const [result] = await pool.query(
                'UPDATE CLIENT SET NOM = ?, TELEPHONE = ?, ADRESSE = ?, PLAFOND_CREDIT = ? WHERE ID_CLIENT = ?',
                [nom, telephone, adresse, plafond_credit, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Client non trouvé' });
            }

            res.json({ message: 'Client mis à jour avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                message: 'Erreur lors de la mise à jour du client' 
            });
        }
    },

    // Supprimer un client
    deleteClient: async (req, res) => {
        const { id } = req.params;

        try {
            const [result] = await pool.query(
                'DELETE FROM CLIENT WHERE ID_CLIENT = ?', 
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Client non trouvé' });
            }

            res.json({ message: 'Client supprimé avec succès' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                message: 'Erreur lors de la suppression du client' 
            });
        }
    }
};

module.exports = clientController;