"""
=============================================================================
API - INTERFACE PYTHON/JAVASCRIPT
=============================================================================
Ce module expose les fonctions Python au JavaScript via pywebview.
Toutes les méthodes de cette classe sont accessibles depuis le frontend
via window.pywebview.api.nom_methode()

IMPORTANT: Toutes les méthodes retournent des dictionnaires Python
qui sont automatiquement convertis en objets JavaScript par pywebview.
=============================================================================
"""

from database import DatabaseManager


class Api:
    """
    Classe API exposée au JavaScript via pywebview.
    Chaque méthode publique est accessible via window.pywebview.api.methode()
    """
    
    def __init__(self, db: DatabaseManager):
        """Initialise l'API avec une référence à la base de données."""
        self.db = db
        self.current_user = None
        self.window = None
    
    def set_window(self, window):
        """Définit la référence à la fenêtre pywebview."""
        self.window = window
    
    # =========================================================================
    # AUTHENTIFICATION
    # =========================================================================
    
    def login(self, email: str, password: str) -> dict:
        """
        Authentifie un utilisateur.
        Retourne un dictionnaire avec success, user et message.
        """
        user = self.db.authenticate_user(email, password)
        
        if user:
            self.current_user = user
            return {
                'success': True,
                'user': user,
                'message': 'Connexion réussie'
            }
        else:
            return {
                'success': False,
                'user': None,
                'message': 'Email ou mot de passe incorrect'
            }
    
    def register(self, email: str, password: str, firstname: str, 
                lastname: str, role: str = 'client') -> dict:
        """Inscrit un nouvel utilisateur."""
        # Validation
        if len(password) < 6:
            return {
                'success': False,
                'message': 'Le mot de passe doit contenir au moins 6 caractères'
            }
        
        if '@' not in email:
            return {
                'success': False,
                'message': 'Email invalide'
            }
        
        user = self.db.create_user(email, password, firstname, lastname, role)
        
        if user:
            self.current_user = user
            return {
                'success': True,
                'user': user,
                'message': 'Inscription réussie'
            }
        else:
            return {
                'success': False,
                'message': 'Cet email est déjà utilisé'
            }
    
    def logout(self) -> dict:
        """Déconnecte l'utilisateur actuel."""
        self.current_user = None
        return {'success': True, 'message': 'Déconnexion réussie'}
    
    def get_current_user(self) -> dict:
        """Récupère l'utilisateur connecté."""
        return {'user': self.current_user}
    
    # =========================================================================
    # PRODUITS
    # =========================================================================
    
    def get_products(self, category: str = None, search: str = None) -> dict:
        """Récupère les produits avec filtres optionnels."""
        if search:
            products = self.db.search_products(search)
        elif category:
            products = self.db.get_products_by_category(category)
        else:
            products = self.db.get_all_products()
        
        return {'success': True, 'products': products}
    
    def get_product(self, product_id: str) -> dict:
        """Récupère un produit par son ID."""
        product = self.db.get_product_by_id(product_id)
        
        if product:
            return {'success': True, 'product': product}
        else:
            return {'success': False, 'message': 'Produit non trouvé'}
    
    def get_categories(self) -> dict:
        """Récupère toutes les catégories."""
        categories = self.db.get_categories()
        return {'success': True, 'categories': categories}
    
    def get_seller_products(self) -> dict:
        """Récupère les produits du vendeur connecté."""
        if not self.current_user or self.current_user['role'] not in ['seller', 'admin']:
            return {'success': False, 'message': 'Non autorisé'}
        
        products = self.db.get_products_by_seller(self.current_user['id'])
        return {'success': True, 'products': products}
    
    def create_product(self, name: str, description: str, price: str, 
                      stock: str, category: str, image_url: str) -> dict:
        """Crée un nouveau produit (vendeur/admin)."""
        if not self.current_user or self.current_user['role'] not in ['seller', 'admin']:
            return {'success': False, 'message': 'Non autorisé'}
        
        product = self.db.create_product(
            name=name,
            description=description,
            price=price,
            stock=stock,
            category=category,
            image_url=image_url,
            seller_id=self.current_user['id']
        )
        
        return {'success': True, 'product': product, 'message': 'Produit créé'}
    
    def update_product(self, product_id: str, name: str = None, description: str = None,
                      price: str = None, stock: str = None, category: str = None,
                      image_url: str = None) -> dict:
        """Met à jour un produit (vendeur/admin)."""
        if not self.current_user or self.current_user['role'] not in ['seller', 'admin']:
            return {'success': False, 'message': 'Non autorisé'}
        
        # Vérifie que le produit appartient au vendeur (sauf admin)
        product = self.db.get_product_by_id(product_id)
        if not product:
            return {'success': False, 'message': 'Produit non trouvé'}
        
        if self.current_user['role'] == 'seller' and product['seller_id'] != self.current_user['id']:
            return {'success': False, 'message': 'Non autorisé à modifier ce produit'}
        
        # Construit les kwargs à partir des paramètres non-None
        kwargs = {}
        if name is not None:
            kwargs['name'] = name
        if description is not None:
            kwargs['description'] = description
        if price is not None:
            kwargs['price'] = price
        if stock is not None:
            kwargs['stock'] = stock
        if category is not None:
            kwargs['category'] = category
        if image_url is not None:
            kwargs['image_url'] = image_url
        
        success = self.db.update_product(product_id, **kwargs)
        return {
            'success': success,
            'message': 'Produit mis à jour' if success else 'Erreur'
        }
    
    def delete_product(self, product_id: str) -> dict:
        """Supprime (désactive) un produit."""
        if not self.current_user or self.current_user['role'] not in ['seller', 'admin']:
            return {'success': False, 'message': 'Non autorisé'}
        
        product = self.db.get_product_by_id(product_id)
        if not product:
            return {'success': False, 'message': 'Produit non trouvé'}
        
        if self.current_user['role'] == 'seller' and product['seller_id'] != self.current_user['id']:
            return {'success': False, 'message': 'Non autorisé'}
        
        success = self.db.delete_product(product_id)
        return {
            'success': success,
            'message': 'Produit supprimé' if success else 'Erreur'
        }
    
    # =========================================================================
    # PANIER
    # =========================================================================
    
    def add_to_cart(self, product_id: str, quantity: int = 1) -> dict:
        """Ajoute un produit au panier."""
        if not self.current_user:
            return {'success': False, 'message': 'Veuillez vous connecter'}
        
        success = self.db.add_to_cart(self.current_user['id'], product_id, quantity)
        return {
            'success': success,
            'message': 'Produit ajouté au panier' if success else 'Stock insuffisant'
        }
    
    def get_cart(self) -> dict:
        """Récupère le panier de l'utilisateur."""
        if not self.current_user:
            return {'success': False, 'cart': [], 'total': '0.00', 'count': 0}
        
        cart = self.db.get_cart(self.current_user['id'])
        total = sum(float(item['product']['price']) * item['quantity'] for item in cart)
        count = sum(item['quantity'] for item in cart)
        
        return {
            'success': True,
            'cart': cart,
            'total': f"{total:.2f}",
            'count': count
        }
    
    def update_cart_quantity(self, product_id: str, quantity: int) -> dict:
        """Met à jour la quantité d'un produit dans le panier."""
        if not self.current_user:
            return {'success': False, 'message': 'Veuillez vous connecter'}
        
        success = self.db.update_cart_quantity(self.current_user['id'], product_id, quantity)
        return {'success': success, 'message': 'Panier mis à jour' if success else 'Erreur'}
    
    def remove_from_cart(self, product_id: str) -> dict:
        """Supprime un produit du panier."""
        if not self.current_user:
            return {'success': False, 'message': 'Veuillez vous connecter'}
        
        success = self.db.remove_from_cart(self.current_user['id'], product_id)
        return {'success': success, 'message': 'Produit retiré' if success else 'Erreur'}
    
    # =========================================================================
    # COMMANDES
    # =========================================================================
    
    def create_order(self, shipping_address: str) -> dict:
        """Crée une commande à partir du panier."""
        if not self.current_user:
            return {'success': False, 'message': 'Veuillez vous connecter'}
        
        order = self.db.create_order(self.current_user['id'], shipping_address)
        
        if order:
            return {'success': True, 'order': order, 'message': 'Commande créée'}
        else:
            return {'success': False, 'message': 'Panier vide'}
    
    def get_my_orders(self) -> dict:
        """Récupère les commandes de l'utilisateur connecté."""
        if not self.current_user:
            return {'success': False, 'orders': []}
        
        orders = self.db.get_orders_by_user(self.current_user['id'])
        return {'success': True, 'orders': orders}
    
    def get_all_orders(self) -> dict:
        """Récupère toutes les commandes (admin/vendeur)."""
        if not self.current_user or self.current_user['role'] not in ['seller', 'admin']:
            return {'success': False, 'message': 'Non autorisé'}
        
        orders = self.db.get_all_orders()
        
        # Enrichit avec les infos utilisateur
        for order in orders:
            user = self.db.get_user_by_id(order['user_id'])
            if user:
                order['user_name'] = f"{user['firstname']} {user['lastname']}"
                order['user_email'] = user['email']
        
        return {'success': True, 'orders': orders}
    
    def update_order_status(self, order_id: str, status: str) -> dict:
        """Met à jour le statut d'une commande."""
        if not self.current_user or self.current_user['role'] not in ['seller', 'admin']:
            return {'success': False, 'message': 'Non autorisé'}
        
        success = self.db.update_order_status(order_id, status)
        return {'success': success, 'message': 'Statut mis à jour' if success else 'Erreur'}
    
    # =========================================================================
    # ADMINISTRATION
    # =========================================================================
    
    def get_all_users(self) -> dict:
        """Récupère tous les utilisateurs (admin uniquement)."""
        if not self.current_user or self.current_user['role'] != 'admin':
            return {'success': False, 'message': 'Non autorisé'}
        
        users = self.db.get_all_users()
        return {'success': True, 'users': users}
    
    def update_user_role(self, user_id: str, role: str) -> dict:
        """Met à jour le rôle d'un utilisateur (admin uniquement)."""
        if not self.current_user or self.current_user['role'] != 'admin':
            return {'success': False, 'message': 'Non autorisé'}
        
        success = self.db.update_user(user_id, role=role)
        return {'success': success, 'message': 'Rôle mis à jour' if success else 'Erreur'}
    
    def delete_user(self, user_id: str) -> dict:
        """Supprime un utilisateur (admin uniquement)."""
        if not self.current_user or self.current_user['role'] != 'admin':
            return {'success': False, 'message': 'Non autorisé'}
        
        if user_id == self.current_user['id']:
            return {'success': False, 'message': 'Impossible de supprimer votre propre compte'}
        
        success = self.db.delete_user(user_id)
        return {'success': success, 'message': 'Utilisateur supprimé' if success else 'Erreur'}
    
    def get_statistics(self) -> dict:
        """Récupère les statistiques (admin uniquement)."""
        if not self.current_user or self.current_user['role'] != 'admin':
            return {'success': False, 'message': 'Non autorisé'}
        
        stats = self.db.get_statistics()
        return {'success': True, 'statistics': stats}
    
    def get_all_products_admin(self) -> dict:
        """Récupère tous les produits y compris inactifs (admin uniquement)."""
        if not self.current_user or self.current_user['role'] != 'admin':
            return {'success': False, 'message': 'Non autorisé'}
        
        products = self.db.get_all_products(active_only=False)
        return {'success': True, 'products': products}
