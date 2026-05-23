const fs = require("fs");
const path = require("path");
const docx = require("docx");

const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;

// Helper to create paragraphs easily
const p = (text, options = {}) => {
  const { bold = false, heading, bullet = false, italic = false, size, color } = options;
  let props = {};
  if (heading) {
    props.heading = heading;
  }
  if (bullet) {
    props.bullet = { level: 0 };
  }
  
  return new Paragraph({
    ...props,
    children: [
      new TextRun({
        text,
        bold,
        italic,
        size: size ? size * 2 : undefined, // docx uses half-points
        color: color,
      }),
    ],
  });
};

const doc = new Document({
  sections: [
    {
      properties: {},
      children: [
        p("Guide Détaillé : Hébergement du Projet sur Render.com", { heading: HeadingLevel.TITLE }),
        p("Ce document décrit pas à pas les étapes nécessaires pour déployer l'application Almamy Et Frère (Backend Node.js et Frontend React/Vite) sur la plateforme d'hébergement cloud Render.", { italic: true }),
        p(""),
        
        // PREREQUIS
        p("Étape 0 : Prérequis avant le déploiement", { heading: HeadingLevel.HEADING_1 }),
        p("- Code source en ligne : Le projet complet doit être poussé sur une plateforme de gestion de version (GitHub ou GitLab).", { bullet: true }),
        p("- Base de données prête : La base de données PostgreSQL doit être déjà créée et active sur Neon.tech, avec son URL de connexion prête (DATABASE_URL).", { bullet: true }),
        p("- Comptes créés : Vous devez avoir un compte actif sur Render.com lié à votre compte GitHub/GitLab.", { bullet: true }),
        p(""),

        // DEPLOIEMENT BACKEND
        p("Étape 1 : Déploiement du Backend (Web Service)", { heading: HeadingLevel.HEADING_1 }),
        p("Le Backend est déployé comme un 'Web Service' dynamique qui tourne en continu pour écouter les requêtes.", { italic: true }),
        p("1. Création du service :", { bold: true }),
        p("Dans le tableau de bord Render, cliquez sur 'New' > 'Web Service'.", { bullet: true }),
        p("Connectez le dépôt GitHub contenant votre code.", { bullet: true }),
        
        p("2. Configuration de base :", { bold: true }),
        p("- Name : almamy-et-frere-backend", { bullet: true }),
        p("- Root Directory : projet_backend (Important : Indique à Render dans quel dossier se trouve le backend).", { bullet: true }),
        p("- Environment : Node", { bullet: true }),
        p("- Build Command : npm install (Télécharge toutes les dépendances du backend).", { bullet: true }),
        p("- Start Command : node src/server.js (ou 'npm start' selon votre package.json. C'est la commande qui lance le serveur).", { bullet: true }),
        
        p("3. Variables d'Environnement (Environment Variables) :", { bold: true }),
        p("Allez dans la section 'Environment' et ajoutez :", { bullet: true }),
        p("  - NODE_ENV = production", { bullet: true }),
        p("  - DATABASE_URL = postgresql://[user]:[password]@[neon_host]/[db_name]?sslmode=require", { bullet: true }),
        p("  - JWT_SECRET = [Une_Clef_Secrete_Complexe_Et_Longue]", { bullet: true }),
        p("  - FRONTEND_URL = https://almamy-et-frere.onrender.com (L'URL de votre futur frontend, pour autoriser le CORS).", { bullet: true }),
        p("Validez et attendez que Render affiche le statut 'Live'. Vous obtiendrez l'URL de votre API (ex: https://almamy-et-frere-backend.onrender.com).", { italic: true }),
        p(""),

        // DEPLOIEMENT FRONTEND
        p("Étape 2 : Déploiement du Frontend (Static Site)", { heading: HeadingLevel.HEADING_1 }),
        p("Le Frontend React/Vite est déployé en tant que 'Static Site', car c'est une application SPA (Single Page Application) qui génère des fichiers HTML/JS statiques après la compilation.", { italic: true }),
        
        p("1. Configuration du fichier d'environnement :", { bold: true }),
        p("Avant de déployer, assurez-vous que la variable d'environnement VITE_API_URL dans le code Frontend pointe vers l'URL du backend Render obtenue à l'étape précédente.", { bullet: true }),
        
        p("2. Création du site statique :", { bold: true }),
        p("Dans Render, cliquez sur 'New' > 'Static Site'.", { bullet: true }),
        p("Sélectionnez à nouveau votre dépôt GitHub.", { bullet: true }),
        
        p("3. Configuration de base :", { bold: true }),
        p("- Name : almamy-et-frere", { bullet: true }),
        p("- Root Directory : frontend", { bullet: true }),
        p("- Build Command : npm install && npm run build (Installe les modules et compile le code React/Vite en fichiers statiques légers).", { bullet: true }),
        p("- Publish Directory : dist (C'est le dossier magique créé par Vite qui contient le code final prêt pour la production).", { bullet: true }),
        
        p("4. Configuration des règles de réécriture (Rewrite Rules) - TRÈS IMPORTANT :", { bold: true }),
        p("Puisque nous utilisons React Router (qui gère plusieurs pages virtuelles), il faut dire à Render de toujours charger le fichier 'index.html' même si l'utilisateur actualise une page comme '/factures'.", { bullet: true }),
        p("Allez dans la section 'Redirects/Rewrites' et ajoutez cette règle :", { bullet: true }),
        p("  - Source : /*", { bullet: true }),
        p("  - Destination : /index.html", { bullet: true }),
        p("  - Action : Rewrite", { bullet: true }),
        p(""),
        
        // DISQUES (UPLOADS)
        p("Étape 3 : Gestion du Stockage des PDF (Persistent Disk)", { heading: HeadingLevel.HEADING_1 }),
        p("Attention : Sur Render, l'espace de stockage des 'Web Services' est éphémère. À chaque redémarrage, les factures PDF téléchargées dans le dossier '/uploads' seraient supprimées. Pour éviter cela :", { italic: true, color: "FF0000" }),
        p("1. Allez dans les paramètres de votre Backend sur Render.", { bullet: true }),
        p("2. Allez dans l'onglet 'Disks'.", { bullet: true }),
        p("3. Créez un nouveau disque persistant :", { bullet: true }),
        p("   - Name : uploads-disk", { bullet: true }),
        p("   - Mount Path : /opt/render/project/src/uploads", { bullet: true }),
        p("   - Size : 1 GB (ajustable selon le volume de factures).", { bullet: true }),
        p("Cela garantit que les PDF des factures fournisseurs resteront sauvegardés à vie, indépendamment des redémarrages du serveur.", { italic: true }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(path.join(__dirname, "Guide_Hebergement_Render.docx"), buffer);
  console.log("Document Guide_Hebergement_Render.docx généré avec succès !");
});
