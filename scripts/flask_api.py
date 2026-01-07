"""
=============================================================================
MODULE 6 - API REST FLASK
=============================================================================
Ce module expose les fonctionnalités de MarketFlow via une API REST.
Peut être utilisé en parallèle de l'interface PyWebView.

Endpoints disponibles:
- /api/auth/login          POST   - Authentification
- /api/auth/register       POST   - Inscription
- /api/users               GET    - Liste des utilisateurs (admin)
- /api/users/<id>          GET    - Détails utilisateur
- /api/products            GET    - Liste des produits
- /api/products/<id>       GET    - Détails produit
- /api/products            POST   - Créer produit (vendeur/admin)
- /api/products/<id>       PUT    - Modifier produit
- /api/products/<id>       DELETE - Supprimer produit
- /api/cart                GET    - Panier utilisateur
- /api/cart                POST   - Ajouter au panier
- /api/cart/<product_id>   DELETE - Retirer du panier
- /api/orders              GET    - Liste commandes
- /api/orders              POST   - Créer commande
- /api/orders/<id>/status  PUT    - Modifier statut (vendeur/admin)
- /api/statistics          GET    - Statistiques (admin)
- /api/statistics/charts   GET    - Graphiques (admin)

Auteur: MarketFlow Team
Date: 2025
=============================================================================
"""

import os
import sys
from functools import wraps

# Ajout du répertoire courant au path pour les imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify, make_response
from database import DatabaseManager

# Initialisation de Flask
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'marketflow-secret-key-dev-2025')

# Initialisation de la base de données
db = DatabaseManager()
db.initialize_database()

# Stockage des sessions utilisateurs (en production, utiliser Redis ou JWT)
sessions = {}


# =========================================================================
# UTILITAIRES
# =========================================================================

def get_current_user():
    """Récupère l'utilisateur connecté via le token d'authentification."""
    auth_header = request.headers.get('Authorization', '')
    
    if auth_header.startswith('Bearer '):
        token = auth_header[7:]
        if token in sessions:
            return sessions[token]
    
    return None


def login_required(f):
    """Décorateur pour les routes nécessitant une authentification."""
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({
                'success': False,
                'error': 'Authentification requise',
                'code': 'UNAUTHORIZED'
            }), 401
        return f(*args, **kwargs)
    return decorated


def role_required(*roles):
    """Décorateur pour les routes nécessitant un rôle spécifique."""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = get_current_user()
            if not user:
                return jsonify({
                    'success': False,
                    'error': 'Authentification requise',
                    'code': 'UNAUTHORIZED'
                }), 401
            if user.get('role') not in roles:
                return jsonify({
                    'success': False,
                    'error': 'Accès non autorisé',
                    'code': 'FORBIDDEN'
                }), 403
            return f(*args, **kwargs)
        return decorated
    return decorator


def generate_token():
    """Génère un token d'authentification unique."""
    import secrets
    return secrets.token_hex(32)


# =========================================================================
# ROUTES - AUTHENTIFICATION
# =========================================================================

@app.route('/api/auth/login', methods=['POST'])
def login():
    """
    Authentifie un utilisateur.
    
    Body JSON:
        - email: string (required)
        - password: string (required)
    
    Returns:
        - success: bool
        - token: string (si succès)
        - user: object (si succès)
        - message: string
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'error': 'Données JSON requises'}), 400
    
    email = data.get('email', '').strip()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({
            'success': False,
            'error': 'Email et mot de passe requis'
        }), 400
    
    user = db.authenticate_user(email, password)
    
    if user:
        # Génération du token
        token = generate_token()
        sessions[token] = user
        
        return jsonify({
            'success': True,
            'token': token,
            'user': user,
            'message': 'Connexion réussie'
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Email ou mot de passe incorrect'
        }), 401


@app.route('/api/auth/register', methods=['POST'])
def register():
    """
    Inscrit un nouvel utilisateur.
    
    Body JSON:
        - email: string (required)
        - password: string (required)
        - firstname: string (required)
        - lastname: string (required)
    
    Returns:
        - success: bool
        - token: string (si succès)
        - user: object (si succès)
        - message: string
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'error': 'Données JSON requises'}), 400
    
    email = data.get('email', '').strip()
    password = data.get('password', '')
    firstname = data.get('firstname', '').strip()
    lastname = data.get('lastname', '').strip()
    
    # Validations
    if not all([email, password, firstname, lastname]):
        return jsonify({
            'success': False,
            'error': 'Tous les champs sont requis (email, password, firstname, lastname)'
        }), 400
    
    if len(password) < 6:
        return jsonify({
            'success': False,
            'error': 'Le mot de passe doit contenir au moins 6 caractères'
        }), 400
    
    if '@' not in email:
        return jsonify({
            'success': False,
            'error': 'Email invalide'
        }), 400
    
    # Vérification mot de passe compromis
    password_check = db.check_password_compromised(password)
    if password_check['compromised']:
        return jsonify({
            'success': False,
            'error': f"Ce mot de passe a été trouvé {password_check['count']} fois dans des fuites de données. Choisissez un mot de passe plus sécurisé.",
            'code': 'PASSWORD_COMPROMISED',
            'pwned_count': password_check['count']
        }), 400
    
    # Création de l'utilisateur
    user = db.create_user(email, password, firstname, lastname, 'client')
    
    if user:
        token = generate_token()
        sessions[token] = user
        
        return jsonify({
            'success': True,
            'token': token,
            'user': user,
            'message': 'Inscription réussie'
        }), 201
    else:
        return jsonify({
            'success': False,
            'error': 'Cet email est déjà utilisé'
        }), 409


@app.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    """Déconnecte l'utilisateur."""
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header[7:]
        sessions.pop(token, None)
    
    return jsonify({'success': True, 'message': 'Déconnexion réussie'})


@app.route('/api/auth/me', methods=['GET'])
@login_required
def get_me():
    """Récupère les informations de l'utilisateur connecté."""
    user = get_current_user()
    return jsonify({'success': True, 'user': user})


@app.route('/api/auth/check-password', methods=['POST'])
def check_password():
    """
    Vérifie si un mot de passe est compromis (HaveIBeenPwned).
    
    Body JSON:
        - password: string (required)
    """
    data = request.get_json()
    
    if not data or not data.get('password'):
        return jsonify({'success': False, 'error': 'Mot de passe requis'}), 400
    
    result = db.check_password_compromised(data['password'])
    
    return jsonify({
        'success': True,
        'compromised': result['compromised'],
        'count': result['count'],
        'error': result['error']
    })


# =========================================================================
# ROUTES - UTILISATEURS
# =========================================================================

@app.route('/api/users', methods=['GET'])
@role_required('admin')
def get_users():
    """Liste tous les utilisateurs (admin uniquement)."""
    users = db.get_all_users()
    return jsonify({
        'success': True,
        'users': users,
        'total': len(users)
    })


@app.route('/api/users/<user_id>', methods=['GET'])
@role_required('admin')
def get_user(user_id):
    """Récupère un utilisateur par son ID (admin uniquement)."""
    user = db.get_user_by_id(user_id)
    
    if user:
        return jsonify({'success': True, 'user': user})
    else:
        return jsonify({'success': False, 'error': 'Utilisateur non trouvé'}), 404


@app.route('/api/users/<user_id>/role', methods=['PUT'])
@role_required('admin')
def update_user_role(user_id):
    """Met à jour le rôle d'un utilisateur (admin uniquement)."""
    data = request.get_json()
    
    if not data or 'role' not in data:
        return jsonify({'success': False, 'error': 'Rôle requis'}), 400
    
    role = data['role']
    if role not in ['client', 'seller', 'admin']:
        return jsonify({'success': False, 'error': 'Rôle invalide'}), 400
    
    success = db.update_user(user_id, role=role)
    
    if success:
        return jsonify({'success': True, 'message': 'Rôle mis à jour'})
    else:
        return jsonify({'success': False, 'error': 'Utilisateur non trouvé'}), 404


@app.route('/api/users/<user_id>', methods=['DELETE'])
@role_required('admin')
def delete_user(user_id):
    """Supprime un utilisateur (admin uniquement)."""
    current_user = get_current_user()
    
    if user_id == current_user.get('id'):
        return jsonify({
            'success': False,
            'error': 'Impossible de supprimer votre propre compte'
        }), 400
    
    success = db.delete_user(user_id)
    
    if success:
        return jsonify({'success': True, 'message': 'Utilisateur supprimé'})
    else:
        return jsonify({'success': False, 'error': 'Utilisateur non trouvé'}), 404


# =========================================================================
# ROUTES - PRODUITS
# =========================================================================

@app.route('/api/products', methods=['GET'])
def get_products():
    """
    Liste les produits avec filtres optionnels.
    
    Query params:
        - category: string - Filtrer par catégorie
        - search: string - Recherche dans nom/description
        - active: bool - Inclure les produits inactifs (admin)
    """
    category = request.args.get('category')
    search = request.args.get('search')
    include_inactive = request.args.get('active', 'true').lower() == 'false'
    
    # Seuls les admins peuvent voir les produits inactifs
    user = get_current_user()
    active_only = True
    if include_inactive and user and user.get('role') == 'admin':
        active_only = False
    
    if search:
        products = db.search_products(search)
    elif category:
        products = db.get_products_by_category(category)
    else:
        products = db.get_all_products(active_only=active_only)
    
    return jsonify({
        'success': True,
        'products': products,
        'total': len(products)
    })


@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    """Récupère un produit par son ID."""
    product = db.get_product_by_id(product_id)
    
    if product:
        return jsonify({'success': True, 'product': product})
    else:
        return jsonify({'success': False, 'error': 'Produit non trouvé'}), 404


@app.route('/api/products', methods=['POST'])
@role_required('seller', 'admin')
def create_product():
    """
    Crée un nouveau produit (vendeur/admin).
    
    Body JSON:
        - name: string (required)
        - description: string (required)
        - price: number (required)
        - stock: number (required)
        - category: string (required)
        - image_url: string (required)
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'error': 'Données JSON requises'}), 400
    
    required_fields = ['name', 'description', 'price', 'stock', 'category', 'image_url']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'success': False,
                'error': f'Champ requis manquant: {field}'
            }), 400
    
    user = get_current_user()
    
    product = db.create_product(
        name=data['name'],
        description=data['description'],
        price=str(data['price']),
        stock=str(data['stock']),
        category=data['category'],
        image_url=data['image_url'],
        seller_id=user['id']
    )
    
    return jsonify({
        'success': True,
        'product': product,
        'message': 'Produit créé avec succès'
    }), 201


@app.route('/api/products/<product_id>', methods=['PUT'])
@role_required('seller', 'admin')
def update_product(product_id):
    """
    Met à jour un produit (vendeur/admin).
    
    Le vendeur ne peut modifier que ses propres produits.
    L'admin peut modifier tous les produits.
    """
    data = request.get_json()
    user = get_current_user()
    
    if not data:
        return jsonify({'success': False, 'error': 'Données JSON requises'}), 400
    
    # Vérification des droits
    product = db.get_product_by_id(product_id)
    if not product:
        return jsonify({'success': False, 'error': 'Produit non trouvé'}), 404
    
    if user.get('role') == 'seller' and product['seller_id'] != user['id']:
        return jsonify({
            'success': False,
            'error': 'Non autorisé à modifier ce produit'
        }), 403
    
    # Mise à jour des champs fournis
    update_fields = {}
    allowed_fields = ['name', 'description', 'price', 'stock', 'category', 'image_url']
    
    for field in allowed_fields:
        if field in data:
            update_fields[field] = str(data[field])
    
    if update_fields:
        success = db.update_product(product_id, **update_fields)
        
        if success:
            return jsonify({'success': True, 'message': 'Produit mis à jour'})
    
    return jsonify({'success': False, 'error': 'Aucune modification effectuée'}), 400


@app.route('/api/products/<product_id>', methods=['DELETE'])
@role_required('seller', 'admin')
def delete_product(product_id):
    """
    Supprime (désactive) un produit.
    
    Le vendeur ne peut supprimer que ses propres produits.
    """
    user = get_current_user()
    
    product = db.get_product_by_id(product_id)
    if not product:
        return jsonify({'success': False, 'error': 'Produit non trouvé'}), 404
    
    if user.get('role') == 'seller' and product['seller_id'] != user['id']:
        return jsonify({
            'success': False,
            'error': 'Non autorisé à supprimer ce produit'
        }), 403
    
    success = db.delete_product(product_id)
    
    if success:
        return jsonify({'success': True, 'message': 'Produit supprimé'})
    else:
        return jsonify({'success': False, 'error': 'Erreur lors de la suppression'}), 500


@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Liste toutes les catégories de produits."""
    categories = db.get_categories()
    return jsonify({
        'success': True,
        'categories': categories
    })


# =========================================================================
# ROUTES - PANIER
# =========================================================================

@app.route('/api/cart', methods=['GET'])
@login_required
def get_cart():
    """Récupère le panier de l'utilisateur connecté."""
    user = get_current_user()
    cart = db.get_cart(user['id'])
    
    total = sum(float(item['product']['price']) * item['quantity'] for item in cart)
    count = sum(item['quantity'] for item in cart)
    
    return jsonify({
        'success': True,
        'cart': cart,
        'total': f"{total:.2f}",
        'count': count
    })


@app.route('/api/cart', methods=['POST'])
@login_required
def add_to_cart():
    """
    Ajoute un produit au panier.
    
    Body JSON:
        - product_id: string (required)
        - quantity: number (default: 1)
    """
    data = request.get_json()
    user = get_current_user()
    
    if not data or 'product_id' not in data:
        return jsonify({'success': False, 'error': 'product_id requis'}), 400
    
    product_id = data['product_id']
    quantity = data.get('quantity', 1)
    
    success = db.add_to_cart(user['id'], product_id, quantity)
    
    if success:
        return jsonify({'success': True, 'message': 'Produit ajouté au panier'})
    else:
        return jsonify({'success': False, 'error': 'Stock insuffisant'}), 400


@app.route('/api/cart/<product_id>', methods=['PUT'])
@login_required
def update_cart_item(product_id):
    """
    Met à jour la quantité d'un produit dans le panier.
    
    Body JSON:
        - quantity: number (required)
    """
    data = request.get_json()
    user = get_current_user()
    
    if not data or 'quantity' not in data:
        return jsonify({'success': False, 'error': 'quantity requis'}), 400
    
    quantity = int(data['quantity'])
    
    success = db.update_cart_quantity(user['id'], product_id, quantity)
    
    if success:
        return jsonify({'success': True, 'message': 'Panier mis à jour'})
    else:
        return jsonify({'success': False, 'error': 'Erreur lors de la mise à jour'}), 400


@app.route('/api/cart/<product_id>', methods=['DELETE'])
@login_required
def remove_from_cart(product_id):
    """Retire un produit du panier."""
    user = get_current_user()
    
    success = db.remove_from_cart(user['id'], product_id)
    
    if success:
        return jsonify({'success': True, 'message': 'Produit retiré du panier'})
    else:
        return jsonify({'success': False, 'error': 'Produit non trouvé dans le panier'}), 404


# =========================================================================
# ROUTES - COMMANDES
# =========================================================================

@app.route('/api/orders', methods=['GET'])
@login_required
def get_orders():
    """
    Liste les commandes.
    
    - Clients: leurs propres commandes
    - Vendeurs/Admins: toutes les commandes
    """
    user = get_current_user()
    
    if user.get('role') in ['seller', 'admin']:
        orders = db.get_all_orders()
        # Enrichir avec les infos utilisateur
        for order in orders:
            order_user = db.get_user_by_id(order['user_id'])
            if order_user:
                order['user_name'] = f"{order_user['firstname']} {order_user['lastname']}"
                order['user_email'] = order_user['email']
    else:
        orders = db.get_orders_by_user(user['id'])
    
    return jsonify({
        'success': True,
        'orders': orders,
        'total': len(orders)
    })


@app.route('/api/orders/<order_id>', methods=['GET'])
@login_required
def get_order(order_id):
    """Récupère une commande par son ID."""
    user = get_current_user()
    orders = db.get_all_orders() if user.get('role') in ['seller', 'admin'] else db.get_orders_by_user(user['id'])
    
    order = next((o for o in orders if o['id'] == order_id), None)
    
    if order:
        return jsonify({'success': True, 'order': order})
    else:
        return jsonify({'success': False, 'error': 'Commande non trouvée'}), 404


@app.route('/api/orders', methods=['POST'])
@login_required
def create_order():
    """
    Crée une commande à partir du panier.
    
    Body JSON:
        - shipping_address: string (required)
    """
    data = request.get_json()
    user = get_current_user()
    
    if not data or 'shipping_address' not in data:
        return jsonify({'success': False, 'error': 'Adresse de livraison requise'}), 400
    
    order = db.create_order(user['id'], data['shipping_address'])
    
    if order:
        return jsonify({
            'success': True,
            'order': order,
            'message': 'Commande créée avec succès'
        }), 201
    else:
        return jsonify({'success': False, 'error': 'Panier vide'}), 400


@app.route('/api/orders/<order_id>/status', methods=['PUT'])
@role_required('seller', 'admin')
def update_order_status(order_id):
    """
    Met à jour le statut d'une commande (vendeur/admin).
    
    Body JSON:
        - status: string (pending, confirmed, shipped, delivered, cancelled)
    """
    data = request.get_json()
    
    if not data or 'status' not in data:
        return jsonify({'success': False, 'error': 'Statut requis'}), 400
    
    status = data['status']
    valid_statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    
    if status not in valid_statuses:
        return jsonify({
            'success': False,
            'error': f'Statut invalide. Valeurs acceptées: {", ".join(valid_statuses)}'
        }), 400
    
    success = db.update_order_status(order_id, status)
    
    if success:
        return jsonify({'success': True, 'message': 'Statut mis à jour'})
    else:
        return jsonify({'success': False, 'error': 'Commande non trouvée'}), 404


# =========================================================================
# ROUTES - STATISTIQUES
# =========================================================================

@app.route('/api/statistics', methods=['GET'])
@role_required('admin')
def get_statistics():
    """Récupère les statistiques globales (admin uniquement)."""
    stats = db.get_statistics()
    
    return jsonify({
        'success': True,
        'statistics': stats
    })


@app.route('/api/statistics/charts', methods=['GET'])
@role_required('admin')
def get_charts():
    """
    Génère et retourne les graphiques statistiques en base64 (admin uniquement).
    
    Query params:
        - chart: string - Nom du graphique spécifique (optionnel)
    """
    try:
        from statistics import StatisticsGenerator
        generator = StatisticsGenerator()
        
        chart_name = request.args.get('chart')
        
        if chart_name:
            # Génère un graphique spécifique
            method_map = {
                'users_by_role': generator.generate_users_by_role_chart,
                'registrations': generator.generate_registrations_chart,
                'products_by_category': generator.generate_products_by_category_chart,
                'price_distribution': generator.generate_price_distribution_chart,
                'stock_status': generator.generate_stock_status_chart,
                'orders_by_status': generator.generate_orders_by_status_chart,
                'revenue_evolution': generator.generate_revenue_evolution_chart
            }
            
            if chart_name in method_map:
                chart_data = method_map[chart_name](save_file=False)
                return jsonify({
                    'success': True,
                    'chart': chart_name,
                    'image': chart_data
                })
            else:
                return jsonify({
                    'success': False,
                    'error': f'Graphique inconnu. Disponibles: {", ".join(method_map.keys())}'
                }), 400
        else:
            # Génère tous les graphiques
            charts = generator.generate_all_charts(save_files=False)
            return jsonify({
                'success': True,
                'charts': charts
            })
    
    except ImportError:
        return jsonify({
            'success': False,
            'error': 'Module statistics non disponible (matplotlib requis)'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erreur lors de la génération: {str(e)}'
        }), 500


@app.route('/api/statistics/summary', methods=['GET'])
@role_required('admin')
def get_statistics_summary():
    """Récupère un résumé complet des statistiques (admin uniquement)."""
    try:
        from statistics import StatisticsGenerator
        generator = StatisticsGenerator()
        
        summary = generator.get_summary_stats()
        
        return jsonify({
            'success': True,
            'summary': summary
        })
    except ImportError:
        # Fallback si le module statistics n'est pas disponible
        stats = db.get_statistics()
        return jsonify({
            'success': True,
            'summary': {'basic': stats}
        })


# =========================================================================
# ROUTES - DOCUMENTATION API
# =========================================================================

@app.route('/api', methods=['GET'])
def api_root():
    """Documentation de l'API."""
    return jsonify({
        'name': 'MarketFlow API',
        'version': '1.0.0',
        'description': 'API REST pour la marketplace MarketFlow',
        'endpoints': {
            'auth': {
                'POST /api/auth/login': 'Authentification',
                'POST /api/auth/register': 'Inscription',
                'POST /api/auth/logout': 'Déconnexion',
                'GET /api/auth/me': 'Utilisateur connecté',
                'POST /api/auth/check-password': 'Vérifier mot de passe (HaveIBeenPwned)'
            },
            'users': {
                'GET /api/users': 'Liste utilisateurs (admin)',
                'GET /api/users/<id>': 'Détails utilisateur (admin)',
                'PUT /api/users/<id>/role': 'Modifier rôle (admin)',
                'DELETE /api/users/<id>': 'Supprimer utilisateur (admin)'
            },
            'products': {
                'GET /api/products': 'Liste produits',
                'GET /api/products/<id>': 'Détails produit',
                'POST /api/products': 'Créer produit (vendeur/admin)',
                'PUT /api/products/<id>': 'Modifier produit (vendeur/admin)',
                'DELETE /api/products/<id>': 'Supprimer produit (vendeur/admin)',
                'GET /api/categories': 'Liste catégories'
            },
            'cart': {
                'GET /api/cart': 'Panier utilisateur',
                'POST /api/cart': 'Ajouter au panier',
                'PUT /api/cart/<product_id>': 'Modifier quantité',
                'DELETE /api/cart/<product_id>': 'Retirer du panier'
            },
            'orders': {
                'GET /api/orders': 'Liste commandes',
                'GET /api/orders/<id>': 'Détails commande',
                'POST /api/orders': 'Créer commande',
                'PUT /api/orders/<id>/status': 'Modifier statut (vendeur/admin)'
            },
            'statistics': {
                'GET /api/statistics': 'Statistiques globales (admin)',
                'GET /api/statistics/charts': 'Graphiques (admin)',
                'GET /api/statistics/summary': 'Résumé complet (admin)'
            }
        },
        'authentication': 'Bearer token dans header Authorization'
    })


# =========================================================================
# GESTION DES ERREURS
# =========================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint non trouvé',
        'code': 'NOT_FOUND'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Erreur interne du serveur',
        'code': 'INTERNAL_ERROR'
    }), 500


@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        'success': False,
        'error': 'Méthode non autorisée',
        'code': 'METHOD_NOT_ALLOWED'
    }), 405


# =========================================================================
# POINT D'ENTRÉE
# =========================================================================

if __name__ == '__main__':
    print("=" * 60)
    print("DÉMARRAGE DE L'API REST MARKETFLOW")
    print("=" * 60)
    print(f"\nServeur Flask disponible sur: http://localhost:5000")
    print("Documentation API: http://localhost:5000/api")
    print("\nEndpoints principaux:")
    print("  - POST /api/auth/login")
    print("  - GET  /api/products")
    print("  - GET  /api/categories")
    print("  - POST /api/cart")
    print("  - POST /api/orders")
    print("  - GET  /api/statistics (admin)")
    print("\n" + "=" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
