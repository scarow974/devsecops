# Module 2 – Authentification Sécurisée

## Objectif
Protéger les identifiants utilisateurs avec hachage SHA-256 et salt unique.

## Fonctionnalités
- Création de compte avec génération de salt
- Connexion avec comparaison temporelle constante
- Logs des tentatives échouées

## Bonnes pratiques
- Toujours saler les hash
- Ne jamais stocker les mots de passe en clair
- Logger les accès pour audit
