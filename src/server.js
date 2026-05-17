// src/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // ✅ AJOUT IMPORTANT

dotenv.config();

const app = express();

// ====================== CORS ======================
const envVars = require('./config/env');
const allowedOrigins = envVars.FRONTEND_URL ? [envVars.FRONTEND_URL, 'http://localhost:5173'] : ['http://localhost:5173'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

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