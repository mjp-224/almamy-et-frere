// src/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // ✅ AJOUT IMPORTANT

dotenv.config();

const app = express();

// ====================== CORS ======================
const envVars = require('./config/env');

// On ajoute les URLs de production pour éviter les erreurs CORS
const allowedOrigins = [
    envVars.FRONTEND_URL,
    // 'http://localhost:5173',
    'https://almay-et-frere-frontend.onrender.com',
    'https://almamy-et-frere-frontend.onrender.com'
].filter(Boolean); // Enlève les valeurs undefined/null

app.use(cors({
    origin: function (origin, callback) {
        // Autoriser les requêtes sans origin (ex: Postman) ou si en développement
        if (!origin || process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }

        // Vérifier si l'origine correspond (en ignorant le '/' final éventuel)
        const isAllowed = allowedOrigins.some(allowed =>
            origin === allowed || origin === allowed + '/'
        );

        if (isAllowed) {
            callback(null, true);
        } else {
            console.error(`CORS bloqué pour l'origine: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Health check route for anti-sleep strategy
app.get('/ping', (req, res) => res.status(200).send('pong'));

// ====================== BODY PARSER ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====================== STATIC FILES (TRÈS IMPORTANT) ======================
// 👉 Permet d'accéder aux fichiers uploadés (PDF)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ====================== ROUTES ======================
const env = require('./config/env');
const routes = require('./routes/index');

app.use('/api', routes);

// ====================== ROUTE TEST ======================
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '✅ API Gestion Ciment Backend est en ligne !'
    });
});

// ====================== SERVER ======================
const PORT = env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📁 Uploads accessibles sur : http://localhost:${PORT}/uploads`);
    console.log(`🌐 Frontend autorisé : http://localhost:5173`);
});
