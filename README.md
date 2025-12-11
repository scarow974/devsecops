# ShopPro - Application E-commerce avec PyWebView

Application e-commerce complète développée en Python avec PyWebView pour l'interface graphique et des fichiers CSV pour la persistance des données.

## Fonctionnalités

### Types de comptes

L'application supporte 3 types de comptes distincts :

1. **Client** - Peut :
   - Parcourir le catalogue de produits
   - Ajouter des produits au panier
   - Passer des commandes
   - Consulter ses commandes passées

2. **Vendeur** - Peut faire tout ce que le client fait, plus :
   - Ajouter de nouveaux produits
   - Modifier ses produits existants
   - Supprimer ses produits
   - Voir les commandes et gérer leurs statuts

3. **Admin** - Accès complet :
   - Toutes les fonctionnalités client et vendeur
   - Gestion de tous les utilisateurs
   - Gestion de tous les produits
   - Vue d'ensemble complète du système
   - Statistiques globales

### Comptes de démonstration

| Type | Email | Mot de passe |
|------|-------|--------------|
| Client | client@shoppro.com | client123 |
| Vendeur | vendeur@shoppro.com | vendeur123 |
| Admin | admin@shoppro.com | admin123 |

## Installation

### Prérequis

- Python 3.8 ou supérieur
- pip (gestionnaire de paquets Python)

### Étapes d'installation

1. **Cloner ou télécharger le projet**

2. **Créer un environnement virtuel (recommandé)**
   \`\`\`bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   \`\`\`

3. **Installer les dépendances**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`
   
   Ou directement :
   \`\`\`bash
   pip install pywebview
   \`\`\`

4. **Lancer l'application**
   \`\`\`bash
   cd scripts
   python main.py
   \`\`\`

## Structure du projet

\`\`\`
scripts/
├── main.py              # Point d'entrée de l'application
├── database.py          # Gestionnaire de base de données CSV
├── api.py               # API Python exposée au JavaScript
├── requirements.txt     # Dépendances Python
├── README.md            # Documentation
├── data/                # Dossier des données CSV (créé automatiquement)
│   ├── users.csv        # Utilisateurs
│   ├── products.csv     # Produits
│   ├── orders.csv       # Commandes
│   └── cart.csv         # Paniers
└── templates/
    └── index.html       # Interface complète (HTML + CSS + JS intégrés)
\`\`\`

## Base de données CSV

Les données sont stockées dans des fichiers CSV dans le dossier `data/`. Ce dossier est créé automatiquement au premier lancement.

### users.csv
- `id` : Identifiant unique
- `email` : Email (unique)
- `password_hash` : Mot de passe hashé (SHA-256)
- `salt` : Sel pour le hachage
- `firstname` : Prénom
- `lastname` : Nom
- `role` : client | seller | admin
- `created_at` : Date de création
- `last_login` : Dernière connexion

### products.csv
- `id` : Identifiant unique
- `name` : Nom du produit
- `description` : Description
- `price` : Prix
- `stock` : Quantité en stock
- `category` : Catégorie
- `image_url` : URL de l'image
- `seller_id` : ID du vendeur
- `created_at` : Date de création
- `active` : Produit actif (true/false)

### orders.csv
- `id` : Identifiant unique
- `user_id` : ID de l'acheteur
- `products` : Liste des produits
- `total` : Montant total
- `status` : pending | confirmed | shipped | delivered | cancelled
- `shipping_address` : Adresse de livraison
- `created_at` : Date de création
- `updated_at` : Dernière mise à jour

### cart.csv
- `id` : Identifiant unique
- `user_id` : ID de l'utilisateur
- `product_id` : ID du produit
- `quantity` : Quantité
- `added_at` : Date d'ajout

## Sécurité

- **Hachage des mots de passe** : SHA-256 avec sel unique par utilisateur
- **Validation des données** : Côté serveur (Python) et client (JavaScript)
- **Contrôle d'accès** : Vérification des rôles pour chaque action

## API Python/JavaScript

L'API est exposée via `window.pywebview.api`. PyWebView convertit automatiquement les dictionnaires Python en objets JavaScript.

\`\`\`javascript
// Exemple d'appel API
const result = await window.pywebview.api.login(email, password);
// result est directement un objet JavaScript
if (result.success) {
    console.log('Connexion réussie:', result.user);
}
\`\`\`

### Méthodes disponibles

#### Authentification
- `login(email, password)` - Connexion
- `register(email, password, firstname, lastname, role)` - Inscription
- `logout()` - Déconnexion
- `get_current_user()` - Utilisateur connecté

#### Produits
- `get_products(category, search)` - Liste des produits
- `get_product(id)` - Détail d'un produit
- `get_categories()` - Liste des catégories
- `create_product(name, description, price, stock, category, image_url)` - Créer (vendeur)
- `update_product(id, name, description, price, stock, category, image_url)` - Modifier (vendeur)
- `delete_product(id)` - Supprimer (vendeur)

#### Panier
- `add_to_cart(product_id, quantity)` - Ajouter au panier
- `get_cart()` - Contenu du panier
- `update_cart_quantity(product_id, quantity)` - Modifier la quantité
- `remove_from_cart(product_id)` - Retirer du panier

#### Commandes
- `create_order(address)` - Créer une commande
- `get_my_orders()` - Mes commandes (client)
- `get_all_orders()` - Toutes les commandes (vendeur/admin)
- `update_order_status(id, status)` - Changer le statut

#### Administration
- `get_all_users()` - Liste des utilisateurs (admin)
- `update_user_role(id, role)` - Changer le rôle (admin)
- `delete_user(id)` - Supprimer un utilisateur (admin)
- `get_statistics()` - Statistiques globales (admin)

## Mode Debug

Pour activer le mode debug (outils de développement), modifiez dans `main.py` :

\`\`\`python
webview.start(debug=True)  # Affiche les outils de développement
\`\`\`

## Dépannage

### L'application ne démarre pas
- Vérifiez que Python est installé : `python --version`
- Vérifiez que pywebview est installé : `pip show pywebview`
- Sur Linux, installez les dépendances GTK : `sudo apt install python3-gi gir1.2-webkit2-4.0`

### Erreur "Module not found"
- Assurez-vous d'être dans le bon répertoire (`scripts/`)
- Vérifiez que l'environnement virtuel est activé

### La base de données ne se crée pas
- Vérifiez les permissions d'écriture dans le dossier
- Supprimez le dossier `data/` et relancez l'application

### L'interface est vide ou blanche
- Lancez avec `debug=True` pour voir les erreurs dans la console
- Vérifiez que le fichier `templates/index.html` existe

## Licence

Ce projet est fourni à des fins éducatives.

## Auteur
