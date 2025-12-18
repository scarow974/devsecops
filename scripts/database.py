"""
=============================================================================
GESTIONNAIRE DE BASE DE DONNÉES CSV
=============================================================================
Ce module gère toutes les opérations CRUD sur les fichiers CSV.
Les données sont persistantes et stockées dans le dossier 'data'.

Tables CSV:
- users.csv : Utilisateurs (clients, vendeurs, admins)
- products.csv : Catalogue des produits
- orders.csv : Commandes passées
- cart.csv : Paniers des utilisateurs
=============================================================================
"""

import csv
import os
import hashlib
import secrets
import json
from datetime import datetime
from typing import List, Dict, Optional


class DatabaseManager:
    """
    Classe principale pour la gestion de la base de données CSV.
    Gère les utilisateurs, produits, panier et commandes.
    """

    def __init__(self):
        """
        Initialise le gestionnaire avec les chemins vers les fichiers CSV.
        """
        # Répertoire de stockage des données
        self.data_dir = os.path.join(os.path.dirname(__file__), 'data')

        # Chemins vers les différents fichiers CSV
        self.users_file = os.path.join(self.data_dir, 'users.csv')
        self.products_file = os.path.join(self.data_dir, 'products.csv')
        self.orders_file = os.path.join(self.data_dir, 'orders.csv')
        self.cart_file = os.path.join(self.data_dir, 'cart.csv')

    def initialize_database(self):
        """
        Crée le répertoire data et initialise tous les fichiers CSV
        avec leurs en-têtes si ils n'existent pas.
        """
        # Création du répertoire data s'il n'existe pas
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
            print(f"[DB] Répertoire créé: {self.data_dir}")

        # Initialisation de chaque table CSV
        self._init_users_table()
        self._init_products_table()
        self._init_orders_table()
        self._init_cart_table()

        print("[DB] Base de données initialisée avec succès")

    # =========================================================================
    # INITIALISATION DES TABLES
    # =========================================================================

    def _init_users_table(self):
        """
        Initialise la table des utilisateurs.
        Crée des comptes vendeur pré-configurés si la table est vide.
        """
        if not os.path.exists(self.users_file):
            headers = ['id', 'email', 'password_hash', 'salt', 'firstname',
                      'lastname', 'role', 'created_at', 'last_login']
            self._write_csv(self.users_file, headers, [])

            # Admin système
            self.create_user('admin@marketflow.com', 'Admin2024!', 'Admin', 'Système', 'admin')

            # Vendeurs pré-configurés
            self.create_user('vendeur1@marketflow.com', 'Vendeur2024!', 'Pierre', 'Martin', 'seller')
            self.create_user('vendeur2@marketflow.com', 'Vendeur2024!', 'Sophie', 'Durand', 'seller')

            print("[DB] Table users créée avec comptes pré-configurés")

    def _init_products_table(self):
        """
        Initialise la table des produits avec des produits de démonstration.
        """
        if not os.path.exists(self.products_file):
            headers = ['id', 'name', 'description', 'price', 'stock',
                      'category', 'image_url', 'seller_id', 'created_at', 'active']
            self._write_csv(self.products_file, headers, [])

            # Produits de démonstration
            demo_products = [
                ('MacBook Pro 14"',
                'Ordinateur portable Apple avec puce M3 Pro, 18Go RAM, 512Go SSD. Écran Liquid Retina XDR.',
                '2499.99',
                '15',
                'Informatique',
                'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
                '2'),

                ('iPhone 15 Pro',
                'Smartphone Apple dernière génération avec titane, puce A17 Pro, caméra 48MP.',
                '1199.99',
                '25',
                'Smartphones',
                'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
                '2'),

                ('Sony WH-1000XM5',
                'Casque audio sans fil avec réduction de bruit active premium, autonomie 30h.'
                '379.99',
                '30',
                'Audio',
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
                '2'),


                ('Samsung Galaxy Tab S9',
                'Tablette Android haut de gamme avec écran AMOLED 11", S Pen inclus.',
                '899.99',
                '20',
                'Tablettes',
                'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
                '2'),


                ('Nintendo Switch OLED',
                'Console de jeu portable avec écran OLED 7", dock et Joy-Con inclus.',
                '349.99',
                '40',
                'Gaming',
                'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400',
                '3'),

                ('Dyson V15 Detect',
                'Aspirateur sans fil intelligent avec laser pour détecter la poussière microscopique.',
                '699.99',
                '12',
                'Maison',
                'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400',
                '3'),

                ('Montre Garmin Fenix 7',
                'Montre GPS multisports avec cartes TopoActive, autonomie 18 jours.',
                '699.99',
                '18',
                'Sport',
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
                '2'),

                ('Canon EOS R6 Mark II',
                'Appareil photo hybride plein format 24.2MP, vidéo 4K 60fps, stabilisation.',
                '2499.99',
                '8',
                'Photo',
                'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
                '3'),

                ('AirPods Pro 2',
                'Écouteurs sans fil Apple avec réduction de bruit adaptative et audio spatial.',
                '279.99',
                '50',
                'Audio',
                'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400',
                '2'),

                ('Dell UltraSharp 27"',
                'Moniteur 4K IPS professionnel avec calibration usine, USB-C 90W.',
                '599.99',
                '15',
                'Informatique',
                'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
                '3'),
            ]

            for p in demo_products:
                self.create_product(p[0], p[1], p[2], p[3], p[4], p[5], p[6])

            print("[DB] Table products créée avec produits de démonstration")

    def _init_orders_table(self):
        """Initialise la table des commandes."""
        if not os.path.exists(self.orders_file):
            headers = ['id', 'user_id', 'products', 'total', 'status',
                      'shipping_address', 'created_at', 'updated_at']
            self._write_csv(self.orders_file, headers, [])
            print("[DB] Table orders créée")


    def _init_cart_table(self):
        """Initialise la table des paniers."""
        if not os.path.exists(self.cart_file):
            headers = ['id', 'user_id', 'product_id', 'quantity', 'added_at']
            self._write_csv(self.cart_file, headers, [])
            print("[DB] Table cart créée")

    # =========================================================================
    # UTILITAIRES CSV
    # =========================================================================

    def _read_csv(self, filepath: str) -> List[Dict]:
        """Lit un fichier CSV et retourne une liste de dictionnaires."""
        if not os.path.exists(filepath):
            return []
        with open(filepath, 'r', newline='', encoding='utf-8') as f:
            return list(csv.DictReader(f))


    def _write_csv(self, filepath: str, headers: List[str], data: List[Dict]):
        """Écrit des données dans un fichier CSV."""
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            writer.writerows(data)


    def _append_csv(self, filepath: str, row: Dict):
        """Ajoute une ligne à un fichier CSV existant."""
        with open(filepath, 'a', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=row.keys())
            writer.writerow(row)


    def _get_next_id(self, filepath: str) -> int:
        """Génère le prochain ID disponible pour une table."""
        data = self._read_csv(filepath)
        if not data:
            return 1
        return max(int(row['id']) for row in data) + 1

    # =========================================================================
    # GESTION DES UTILISATEURS
    # =========================================================================

    def _hash_password(self, password: str, salt: str = None) -> tuple:
        """
        Hash un mot de passe avec un sel pour la sécurité.
        Utilise SHA-256 pour le hachage.
        """
        if salt is None:
            salt = secrets.token_hex(32)
        password_hash = hashlib.sha256(f"{password}{salt}".encode()).hexdigest()
        return password_hash, salt


    def create_user(self, email: str, password: str, firstname: str,
                   lastname: str, role: str = 'client') -> Optional[Dict]:
        """Crée un nouvel utilisateur."""
        # Vérifie si l'email existe déjà
        users = self._read_csv(self.users_file)
        for user in users:
            if user['email'].lower() == email.lower():
                return None

        password_hash, salt = self._hash_password(password)

        user = {
            'id': str(self._get_next_id(self.users_file)),
            'email': email.lower(),
            'password_hash': password_hash,
            'salt': salt,
            'firstname': firstname,
            'lastname': lastname,
            'role': role,
            'created_at': datetime.now().isoformat(),
            'last_login': ''
        }

        self._append_csv(self.users_file, user)
        print(f"[DB] Utilisateur créé: {email} ({role})")

        # Retourne sans les données sensibles
        return {k: v for k, v in user.items() if k not in ['password_hash', 'salt']}


    def authenticate_user(self, email: str, password: str) -> Optional[Dict]:
        """Authentifie un utilisateur avec son email et mot de passe."""
        users = self._read_csv(self.users_file)

        for user in users:
            if user['email'].lower() == email.lower():
                password_hash, _ = self._hash_password(password, user['salt'])

                if password_hash == user['password_hash']:
                    # Met à jour la date de dernière connexion
                    self._update_user_login(user['id'])
                    return {k: v for k, v in user.items() if k not in ['password_hash', 'salt']}

        return None


    def _update_user_login(self, user_id: str):
        """Met à jour la date de dernière connexion."""
        users = self._read_csv(self.users_file)
        headers = ['id', 'email', 'password_hash', 'salt', 'firstname',
                  'lastname', 'role', 'created_at', 'last_login']

        for user in users:
            if user['id'] == user_id:
                user['last_login'] = datetime.now().isoformat()
                break

        self._write_csv(self.users_file, headers, users)


    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Récupère un utilisateur par son ID."""
        users = self._read_csv(self.users_file)
        for user in users:
            if user['id'] == user_id:
                return {k: v for k, v in user.items() if k not in ['password_hash', 'salt']}
        return None


    def get_all_users(self) -> List[Dict]:
        """Récupère tous les utilisateurs (pour l'admin)."""
        users = self._read_csv(self.users_file)
        return [{k: v for k, v in user.items() if k not in ['password_hash', 'salt']} for user in users]


    def update_user(self, user_id: str, **kwargs) -> bool:
        """Met à jour les informations d'un utilisateur."""
        users = self._read_csv(self.users_file)
        headers = ['id', 'email', 'password_hash', 'salt', 'firstname',
                  'lastname', 'role', 'created_at', 'last_login']

        for user in users:
            if user['id'] == user_id:
                for key, value in kwargs.items():
                    if key in user and key not in ['id', 'password_hash', 'salt']:
                        user[key] = value
                self._write_csv(self.users_file, headers, users)
                return True
        return False


    def delete_user(self, user_id: str) -> bool:
        """Supprime un utilisateur."""
        users = self._read_csv(self.users_file)
        headers = ['id', 'email', 'password_hash', 'salt', 'firstname',
                  'lastname', 'role', 'created_at', 'last_login']

        new_users = [u for u in users if u['id'] != user_id]
        if len(new_users) < len(users):
            self._write_csv(self.users_file, headers, new_users)
            # Supprime aussi le panier de l'utilisateur
            self.clear_cart(user_id)
            return True
        return False

    # =========================================================================
    # GESTION DES PRODUITS
    # =========================================================================

    def create_product(self, name: str, description: str, price: str,
                      stock: str, category: str, image_url: str,
                      seller_id: str) -> Dict:
        """Crée un nouveau produit."""
        product = {
            'id': str(self._get_next_id(self.products_file)),
            'name': name,
            'description': description,
            'price': price,
            'stock': stock,
            'category': category,
            'image_url': image_url,
            'seller_id': seller_id,
            'created_at': datetime.now().isoformat(),
            'active': 'true'
        }

        self._append_csv(self.products_file, product)
        print(f"[DB] Produit créé: {name}")
        return product


    def get_all_products(self, active_only: bool = True) -> List[Dict]:
        """Récupère tous les produits."""
        products = self._read_csv(self.products_file)
        if active_only:
            return [p for p in products if p.get('active', 'true') == 'true']
        return products


    def get_product_by_id(self, product_id: str) -> Optional[Dict]:
        """Récupère un produit par son ID."""
        products = self._read_csv(self.products_file)
        for product in products:
            if product['id'] == product_id:
                return product
        return None


    def get_products_by_seller(self, seller_id: str) -> List[Dict]:
        """Récupère tous les produits d'un vendeur."""
        products = self._read_csv(self.products_file)
        return [p for p in products if p['seller_id'] == seller_id]


    def get_products_by_category(self, category: str) -> List[Dict]:
        """Récupère les produits d'une catégorie."""
        products = self._read_csv(self.products_file)
        return [p for p in products if p['category'].lower() == category.lower() and p.get('active', 'true') == 'true']


    def get_categories(self) -> List[str]:
        """Récupère toutes les catégories uniques."""
        products = self._read_csv(self.products_file)
        categories = set(p['category'] for p in products if p.get('active', 'true') == 'true')
        return sorted(list(categories))


    def search_products(self, query: str) -> List[Dict]:
        """Recherche des produits par nom ou description."""
        products = self.get_all_products(active_only=True)
        query_lower = query.lower()
        return [p for p in products if query_lower in p['name'].lower() or query_lower in p['description'].lower()]


    def update_product(self, product_id: str, **kwargs) -> bool:
        """Met à jour un produit."""
        products = self._read_csv(self.products_file)
        headers = ['id', 'name', 'description', 'price', 'stock',
                  'category', 'image_url', 'seller_id', 'created_at', 'active']

        for product in products:
            if product['id'] == product_id:
                for key, value in kwargs.items():
                    if key in product and key != 'id':
                        product[key] = str(value)
                self._write_csv(self.products_file, headers, products)
                print(f"[DB] Produit mis à jour: {product_id}")
                return True
        return False

    def delete_product(self, product_id: str) -> bool:
        """Désactive un produit (soft delete)."""
        return self.update_product(product_id, active='false')

    # =========================================================================
    # GESTION DU PANIER
    # =========================================================================

    def add_to_cart(self, user_id: str, product_id: str, quantity: int = 1) -> bool:
        """Ajoute un produit au panier."""
        product = self.get_product_by_id(product_id)
        if not product or int(product['stock']) < quantity:
            return False

        cart_items = self._read_csv(self.cart_file)
        headers = ['id', 'user_id', 'product_id', 'quantity', 'added_at']

        # Vérifie si le produit est déjà dans le panier
        for item in cart_items:
            if item['user_id'] == user_id and item['product_id'] == product_id:
                item['quantity'] = str(int(item['quantity']) + quantity)
                self._write_csv(self.cart_file, headers, cart_items)
                return True

        # Ajoute un nouvel item
        cart_item = {
            'id': str(self._get_next_id(self.cart_file)),
            'user_id': user_id,
            'product_id': product_id,
            'quantity': str(quantity),
            'added_at': datetime.now().isoformat()
        }

        self._append_csv(self.cart_file, cart_item)
        return True

    def get_cart(self, user_id: str) -> List[Dict]:
        """Récupère le panier d'un utilisateur avec les détails des produits."""
        cart_items = self._read_csv(self.cart_file)
        user_cart = [item for item in cart_items if item['user_id'] == user_id]

        result = []
        for item in user_cart:
            product = self.get_product_by_id(item['product_id'])
            if product:
                result.append({
                    'cart_id': item['id'],
                    'product_id': item['product_id'],
                    'quantity': int(item['quantity']),
                    'product': product
                })
        return result

    def update_cart_quantity(self, user_id: str, product_id: str, quantity: int) -> bool:
        """Met à jour la quantité d'un produit dans le panier."""
        if quantity <= 0:
            return self.remove_from_cart(user_id, product_id)

        cart_items = self._read_csv(self.cart_file)
        headers = ['id', 'user_id', 'product_id', 'quantity', 'added_at']

        for item in cart_items:
            if item['user_id'] == user_id and item['product_id'] == product_id:
                item['quantity'] = str(quantity)
                self._write_csv(self.cart_file, headers, cart_items)
                return True
        return False

    def remove_from_cart(self, user_id: str, product_id: str) -> bool:
        """Supprime un produit du panier."""
        cart_items = self._read_csv(self.cart_file)
        headers = ['id', 'user_id', 'product_id', 'quantity', 'added_at']

        new_cart = [item for item in cart_items
                   if not (item['user_id'] == user_id and item['product_id'] == product_id)]

        if len(new_cart) < len(cart_items):
            self._write_csv(self.cart_file, headers, new_cart)
            return True
        return False

    def clear_cart(self, user_id: str):
        """Vide le panier d'un utilisateur."""
        cart_items = self._read_csv(self.cart_file)
        headers = ['id', 'user_id', 'product_id', 'quantity', 'added_at']
        new_cart = [item for item in cart_items if item['user_id'] != user_id]
        self._write_csv(self.cart_file, headers, new_cart)

    # =========================================================================
    # GESTION DES COMMANDES
    # =========================================================================

    def create_order(self, user_id: str, shipping_address: str) -> Optional[Dict]:
        """Crée une commande à partir du panier."""

        cart = self.get_cart(user_id)
        if not cart:
            return None

        total = sum(float(item['product']['price']) * item['quantity'] for item in cart)

        # Prépare les données des produits pour la commande
        products_data = []
        for item in cart:
            products_data.append({
                'id': item['product_id'],
                'name': item['product']['name'],
                'price': item['product']['price'],
                'quantity': item['quantity']
            })
            # Décrémente le stock
            new_stock = int(item['product']['stock']) - item['quantity']
            self.update_product(item['product_id'], stock=max(0, new_stock))

        order = {
            'id': str(self._get_next_id(self.orders_file)),
            'user_id': user_id,
            'products': json.dumps(products_data),
            'total': f"{total:.2f}",
            'status': 'pending',
            'shipping_address': shipping_address,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }

        self._append_csv(self.orders_file, order)

        # Vide le panier
        self.clear_cart(user_id)

        print(f"[DB] Commande créée: #{order['id']}")
        return order

    def get_orders_by_user(self, user_id: str) -> List[Dict]:
        """Récupère les commandes d'un utilisateur."""
        orders = self._read_csv(self.orders_file)
        return [o for o in orders if o['user_id'] == user_id]

    def get_all_orders(self) -> List[Dict]:
        """Récupère toutes les commandes."""
        return self._read_csv(self.orders_file)

    def update_order_status(self, order_id: str, status: str) -> bool:
        """Met à jour le statut d'une commande."""
        orders = self._read_csv(self.orders_file)
        headers = ['id', 'user_id', 'products', 'total', 'status',
                  'shipping_address', 'created_at', 'updated_at']

        for order in orders:
            if order['id'] == order_id:
                order['status'] = status
                order['updated_at'] = datetime.now().isoformat()
                self._write_csv(self.orders_file, headers, orders)
                return True
        return False

    # =========================================================================
    # STATISTIQUES
    # =========================================================================

    def get_statistics(self) -> Dict:
        """Récupère les statistiques globales."""
        users = self._read_csv(self.users_file)
        products = self._read_csv(self.products_file)
        orders = self._read_csv(self.orders_file)

        return {
            'users': {
                'total': len(users),
                'clients': len([u for u in users if u['role'] == 'client']),
                'sellers': len([u for u in users if u['role'] == 'seller']),
                'admins': len([u for u in users if u['role'] == 'admin'])
            },
            'products': {
                'total': len(products),
                'active': len([p for p in products if p.get('active', 'true') == 'true'])
            },
            'orders': {
                'total': len(orders),
                'pending': len([o for o in orders if o['status'] == 'pending']),
                'delivered': len([o for o in orders if o['status'] == 'delivered']),
                'revenue': sum(float(o['total']) for o in orders if o['status'] == 'delivered')
            }
        }
