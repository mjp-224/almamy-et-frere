// src/config/env.js
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

const env = {
    // Serveur
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

    // Base de données MySQL
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT) || 3306,
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_NAME: process.env.DB_NAME,
    DATABASE_URL: process.env.DATABASE_URL,

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_change_this_in_production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h'
};

module.exports = env;