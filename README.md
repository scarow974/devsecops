# DevSecOps - Application de Gestion de Produits Sécurisée

Application GUI pour pywebview - Gestion de produits pour commerçants avec sécurité intégrée.

## Les 7 Modules

| # | Module | Description | Priorité |
|---|--------|-------------|----------|
| 1 | Gestion des Produits | CRUD complet en CSV | Haute |
| 2 | Authentification Sécurisée | Hachage SHA-256 + Salt | Critique |
| 3 | Vérification Mots de Passe | Contrôle base compromis | Critique |
| 4 | Interface Graphique | GUI pywebview | Haute |
| 5 | Commandes & Statistiques | Gestion + Visualisations | Moyenne |
| 6 | API REST | Endpoints via pywebview | Moyenne |
| 7 | Sécurité & Audit | Bandit, Pylint, Safety | Critique |

## Installation

\`\`\`bash
pip install pywebview
cd scripts
python main.py
\`\`\`

**Compte par défaut :** `admin` / `admin123`

## Structure

\`\`\`
scripts/
├── main.py           # Toute la logique Python (7 modules)
├── index.html        # Interface graphique (appelle Python)
├── README.md
└── data/             # Créé automatiquement
    ├── products.csv
    ├── users.csv
    ├── orders.csv
    ├── security_logs.csv
    └── compromised_passwords.txt
\`\`\`

## Architecture

\`\`\`
┌─────────────────────────────────────┐
│     Couche Présentation (HTML/JS)   │
│         GUI pywebview               │
└─────────────────┬───────────────────┘
                  │ window.pywebview.api
┌─────────────────▼───────────────────┐
│     Couche Application (Python)     │
│  Gestion produits • Auth • Stats    │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│     Couche Données (CSV)            │
│  Base sécurisée • Logs              │
└─────────────────────────────────────┘
\`\`\`

## API Python

Toutes les fonctionnalités sont en Python, appelées via `window.pywebview.api` :

\`\`\`javascript
// Module 1 - Produits
await window.pywebview.api.get_products()
await window.pywebview.api.add_product(nom, description, prix, quantite, categorie)
await window.pywebview.api.update_product(id, nom, description, prix, quantite, categorie)
await window.pywebview.api.delete_product(id)

// Module 2 - Authentification SHA-256 + Salt
await window.pywebview.api.login(username, password)
await window.pywebview.api.register_user(username, password)
await window.pywebview.api.logout()

// Module 3 - Vérification mots de passe
await window.pywebview.api.check_password_compromised(password)
await window.pywebview.api.check_password_strength(password)
await window.pywebview.api.generate_secure_password(length)

// Module 5 - Commandes & Stats
await window.pywebview.api.get_orders()
await window.pywebview.api.add_order(product_id, quantite, client)
await window.pywebview.api.get_statistics()

// Module 7 - Audit
await window.pywebview.api.run_security_audit()
await window.pywebview.api.get_security_logs(limit)
await window.pywebview.api.hash_text(text, algorithm)
\`\`\`

## Sécurité

- **SHA-256 + Salt** : Chaque mot de passe est hashé avec un salt unique
- **Comparaison temporelle constante** : Protection contre les attaques timing
- **Logs détaillés** : Traçabilité complète des accès
- **Validation input** : Contrôles en temps réel des données saisies
