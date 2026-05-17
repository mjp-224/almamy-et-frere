-- Vérifier et corriger les rôles

-- 1. Voir tous les rôles existants
SELECT * FROM ROLE;

-- 2. Voir tous les utilisateurs avec leur rôle
SELECT 
    u.ID_UTILISATEUR,
    u.NOM,
    u.PRENOM,
    u.EMAIL,
    u.ID_ROLE,
    r.NOM_ROLE
FROM UTILISATEUR u
LEFT JOIN ROLE r ON u.ID_ROLE = r.ID_ROLE;

-- 3. Créer les 3 rôles principaux s'ils n'existent pas
INSERT IGNORE INTO ROLE (ID_ROLE, NOM_ROLE) VALUES 
(1, 'Administrateur'),
(2, 'Gestionnaire de Stock'),
(3, 'Gestionnaire des Ventes');

-- 4. Mettre à jour les utilisateurs sans rôle (mettre rôle 2 = Gestionnaire de Stock par défaut)
-- UPDATE UTILISATEUR SET ID_ROLE = 2 WHERE ID_ROLE IS NULL OR ID_ROLE = 0;

-- 5. Mettre à jour un utilisateur spécifique pour test
-- Exemple: mettre 'Abdoulaye Diallo' en tant que Gestionnaire de Stock (rôle 2)
-- UPDATE UTILISATEUR SET ID_ROLE = 2 WHERE NOM = 'Diallo' AND PRENOM = 'Abdoulaye';
