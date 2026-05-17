-- Initialisation du système de rôles
-- 3 acteurs principaux : Administrateur, Gestionnaire de Stock, Gestionnaire des Ventes
-- + Rôle 7 pour un autre Gestionnaire de Stock

-- Supprimer les anciens rôles et recréer (attention en production !)
DELETE FROM ROLE WHERE ID_ROLE IN (1, 2, 3, 7);

-- Insérer les rôles
INSERT INTO ROLE (ID_ROLE, NOM_ROLE) VALUES 
(1, 'Administrateur'),
(2, 'Gestionnaire de Stock'),
(3, 'Gestionnaire des Ventes'),
(7, 'Gestionnaire de Stock');

-- Vérification
SELECT * FROM ROLE ORDER BY ID_ROLE;
