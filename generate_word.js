const fs = require("fs");
const path = require("path");
const docx = require("docx");

const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;

// Helper to create paragraphs easily
const p = (text, options = {}) => {
  const { bold = false, heading, bullet = false, italic = false, size } = options;
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
      }),
    ],
  });
};

const doc = new Document({
  sections: [
    {
      properties: {},
      children: [
        p("Architecture Détaillée : Projet Almamy Et Frère (Ges-Mag)", { heading: HeadingLevel.TITLE }),
        p("Ce document décrit l'ensemble des technologies utilisées, organisées par section, avec le rôle et l'importance de chaque élément technique.", { italic: true }),
        p(""),
        
        // SECTION 1
        p("1. Section Base de Données", { heading: HeadingLevel.HEADING_1 }),
        
        p("PostgreSQL (hébergement Neon.tech)", { bold: true }),
        p("- Rôle : SGBDR (Système de Gestion de Base de Données Relationnelle). Il stocke l'intégralité des entités de l'entreprise (Factures, Stocks, Bonus, Utilisateurs).", { bullet: true }),
        p("- Importance : Cruciale. PostgreSQL garantit l'intégrité référentielle, le support JSON et les transactions ACID. Neon permet une élasticité 'Serverless' sans coûts de maintien en cas d'inactivité.", { bullet: true }),
        p("- Détails : Utilise des requêtes préparées avec des paramètres indexés ($1, $2) pour prévenir les injections SQL. Gère les rollbacks lors des annulations de factures complexes.", { bullet: true }),

        p("node-postgres (pg)", { bold: true }),
        p("- Rôle : Pilote (Driver) Node.js pour communiquer avec PostgreSQL.", { bullet: true }),
        p("- Importance : Indispensable. Il gère le 'Pool de Connexions', permettant d'exécuter plusieurs requêtes SQL en parallèle sans épuiser les ressources de la base de données.", { bullet: true }),

        p("Adaptateur SQL Custom (formatPgSql)", { bold: true }),
        p("- Rôle : Une couche logicielle intégrée au fichier database.js qui traduit à la volée la syntaxe MySQL vers PostgreSQL (ex: '?' vers '$1', 'NOW()' vers 'CURRENT_TIMESTAMP').", { bullet: true }),
        p("- Importance : Vitale. Cette couche de compatibilité a permis de migrer vers PostgreSQL sans réécrire les dizaines de requêtes brutes de l'application.", { bullet: true }),
        
        p(""),
        // SECTION 2
        p("2. Section Backend (Le Cerveau de l'application)", { heading: HeadingLevel.HEADING_1 }),
        
        p("Node.js", { bold: true }),
        p("- Rôle : Environnement d'exécution JavaScript côté serveur.", { bullet: true }),
        p("- Importance : Moteur asynchrone ultra-performant. Grâce à son 'Event Loop', il peut gérer des milliers de petites opérations de facturation ou de consultation de stock simultanément sans bloquer le système.", { bullet: true }),

        p("Express.js", { bold: true }),
        p("- Rôle : Framework de routage API REST.", { bullet: true }),
        p("- Importance : Structure l'application en respectant le modèle MVC (Modèles-Vues-Contrôleurs). Il gère la sécurité des flux HTTP, les middlewares et les formats de retour en JSON.", { bullet: true }),

        p("JSON Web Tokens (JWT) & jsonwebtoken", { bold: true }),
        p("- Rôle : Sécurité et authentification 'Stateless' (sans état).", { bullet: true }),
        p("- Importance : Crypte les informations de l'utilisateur connecté dans un jeton inaltérable. Il assure qu'un simple caissier ne puisse jamais exécuter la route de suppression réservée à l'administrateur.", { bullet: true }),

        p("Multer & File System (fs, path, uuid)", { bold: true }),
        p("- Rôle : Gestion des téléchargements (Uploads) de fichiers lourds.", { bullet: true }),
        p("- Importance : Indispensable pour la capture des factures fournisseurs en PDF. Multer intercepte les flux 'multipart/form-data', et UUID garantit un nom unique pour éviter la collision de fichiers sur le serveur.", { bullet: true }),

        p("CORS", { bold: true }),
        p("- Rôle : Partage des ressources inter-origines (Cross-Origin Resource Sharing).", { bullet: true }),
        p("- Importance : Mécanisme de sécurité primordial des navigateurs qui permet au frontend (React) d'interroger le backend de façon légitime.", { bullet: true }),

        p(""),
        // SECTION 3
        p("3. Section Frontend (L'Interface Utilisateur)", { heading: HeadingLevel.HEADING_1 }),
        
        p("React.js (v19)", { bold: true }),
        p("- Rôle : Bibliothèque de composants d'interface utilisateur.", { bullet: true }),
        p("- Importance : Central. Contrairement aux anciens sites web, React met à jour le DOM virtuellement et ne rafraîchit que la partie de l'écran qui change. Cela offre une réactivité impressionnante pour un logiciel de gestion.", { bullet: true }),

        p("Vite.js", { bold: true }),
        p("- Rôle : Outil de construction (Bundler) et serveur de développement.", { bullet: true }),
        p("- Importance : Remplace Webpack. Vite compile le JavaScript instantanément grâce aux modules ES natifs. En production, il utilise Rollup pour créer un fichier très léger et optimisé.", { bullet: true }),

        p("Tailwind CSS", { bold: true }),
        p("- Rôle : Framework CSS utilitaire.", { bullet: true }),
        p("- Importance : Au lieu d'écrire du CSS complexe, les classes sont directement insérées dans les composants. Cela permet de créer des grilles et des tableaux responsives beaucoup plus rapidement, et garantit un design uniforme.", { bullet: true }),

        p("Axios", { bold: true }),
        p("- Rôle : Client HTTP.", { bullet: true }),
        p("- Importance : Remplace la fonction 'fetch' native. Il gère l'injection globale du Token JWT dans chaque requête via ses 'Intercepteurs' et redirige automatiquement vers l'écran de login en cas d'erreur 401 (non autorisé).", { bullet: true }),

        p("React Router DOM", { bold: true }),
        p("- Rôle : Routage côté client (SPA - Single Page Application).", { bullet: true }),
        p("- Importance : L'application fonctionne sur une seule page HTML réelle. React Router intercepte les clics sur le menu et change le composant affiché instantanément, sans jamais faire clignoter ou recharger le navigateur.", { bullet: true }),

        p("jsPDF & html2canvas-pro", { bold: true }),
        p("- Rôle : Génération de documents d'impression.", { bullet: true }),
        p("- Importance : Outils critiques pour le métier. Ils 'photographient' les composants HTML (comme une belle facture) et les convertissent en fichiers PDF de haute qualité, prêts à être imprimés sur du papier, sans surcharger le backend.", { bullet: true }),
      ],
    },
  ],
});

// Used to export the file into a .docx file
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(path.join(__dirname, "Documentation_Architecture.docx"), buffer);
  console.log("Document généré avec succès !");
});
