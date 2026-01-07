"""
=============================================================================
MODULE 5 - STATISTIQUES ET VISUALISATIONS
=============================================================================
Ce module génère des graphiques statistiques avec Matplotlib et Seaborn
pour visualiser les données de l'application MarketFlow.

Les graphiques sont générés en images PNG qui peuvent être affichées
dans l'interface d'administration.

Auteur: MarketFlow Team
Date: 2025
=============================================================================
"""

import os
import csv
import json
from datetime import datetime, timedelta
from collections import defaultdict
from typing import List, Dict, Optional
import io
import base64

# Import des bibliothèques de visualisation
try:
    import matplotlib
    matplotlib.use('Agg')  # Backend non-interactif pour génération d'images
    import matplotlib.pyplot as plt
    import matplotlib.dates as mdates
    from matplotlib.ticker import MaxNLocator
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False
    print("[STATS] matplotlib non disponible - pip install matplotlib")

try:
    import seaborn as sns
    SEABORN_AVAILABLE = True
except ImportError:
    SEABORN_AVAILABLE = False
    print("[STATS] seaborn non disponible - pip install seaborn")


class StatisticsGenerator:
    """
    Classe pour générer des statistiques et visualisations
    à partir des données CSV de l'application.
    """
    
    def __init__(self):
        """Initialise le générateur de statistiques."""
        # Répertoires
        self.data_dir = os.path.join(os.path.dirname(__file__), 'data')
        self.charts_dir = os.path.join(os.path.dirname(__file__), 'static', 'charts')
        
        # Fichiers CSV
        self.users_file = os.path.join(self.data_dir, 'users.csv')
        self.products_file = os.path.join(self.data_dir, 'products.csv')
        self.orders_file = os.path.join(self.data_dir, 'orders.csv')
        
        # Configuration du style
        if SEABORN_AVAILABLE:
            sns.set_theme(style="whitegrid", palette="muted")
        
        # Palette de couleurs MarketFlow
        self.colors = {
            'primary': '#1a3a32',
            'primary_light': '#2d5a4e',
            'accent': '#d4a373',
            'success': '#3d6b4f',
            'warning': '#c9973d',
            'error': '#b44a4a',
            'info': '#4a7c8c',
            'gray': '#7a756b'
        }
        
        # Création du répertoire de sortie
        os.makedirs(self.charts_dir, exist_ok=True)
    
    def _read_csv(self, filepath: str) -> List[Dict]:
        """Lit un fichier CSV et retourne une liste de dictionnaires."""
        if not os.path.exists(filepath):
            return []
        with open(filepath, 'r', newline='', encoding='utf-8') as f:
            return list(csv.DictReader(f))
    
    def _save_chart(self, fig, filename: str) -> str:
        """Sauvegarde un graphique et retourne le chemin."""
        filepath = os.path.join(self.charts_dir, filename)
        fig.savefig(filepath, dpi=150, bbox_inches='tight', 
                   facecolor='white', edgecolor='none')
        plt.close(fig)
        print(f"[STATS] Graphique sauvegardé: {filepath}")
        return filepath
    
    def _chart_to_base64(self, fig) -> str:
        """Convertit un graphique en base64 pour affichage web."""
        buf = io.BytesIO()
        fig.savefig(buf, format='png', dpi=150, bbox_inches='tight',
                   facecolor='white', edgecolor='none')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close(fig)
        return f"data:image/png;base64,{img_base64}"
    
    # =========================================================================
    # STATISTIQUES DES UTILISATEURS
    # =========================================================================
    
    def get_users_stats(self) -> Dict:
        """Calcule les statistiques des utilisateurs."""
        users = self._read_csv(self.users_file)
        
        stats = {
            'total': len(users),
            'by_role': defaultdict(int),
            'registrations_by_month': defaultdict(int)
        }
        
        for user in users:
            # Par rôle
            stats['by_role'][user.get('role', 'client')] += 1
            
            # Par mois d'inscription
            created_at = user.get('created_at', '')
            if created_at:
                try:
                    date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    month_key = date.strftime('%Y-%m')
                    stats['registrations_by_month'][month_key] += 1
                except:
                    pass
        
        return dict(stats)
    
    def generate_users_by_role_chart(self, save_file: bool = True) -> str:
        """Génère un graphique camembert de la répartition des utilisateurs par rôle."""
        if not MATPLOTLIB_AVAILABLE:
            return ""
        
        stats = self.get_users_stats()
        
        # Données
        labels = {
            'client': 'Clients',
            'seller': 'Vendeurs',
            'admin': 'Administrateurs'
        }
        
        sizes = []
        chart_labels = []
        colors = []
        color_map = {
            'client': self.colors['primary'],
            'seller': self.colors['accent'],
            'admin': self.colors['error']
        }
        
        for role, count in stats['by_role'].items():
            if count > 0:
                sizes.append(count)
                chart_labels.append(f"{labels.get(role, role)} ({count})")
                colors.append(color_map.get(role, self.colors['gray']))
        
        if not sizes:
            return ""
        
        # Création du graphique
        fig, ax = plt.subplots(figsize=(8, 6))
        
        wedges, texts, autotexts = ax.pie(
            sizes, 
            labels=chart_labels,
            colors=colors,
            autopct='%1.1f%%',
            startangle=90,
            explode=[0.02] * len(sizes)
        )
        
        # Style
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')
        
        ax.set_title('Répartition des utilisateurs par rôle', 
                    fontsize=14, fontweight='bold', pad=20)
        
        if save_file:
            return self._save_chart(fig, 'users_by_role.png')
        else:
            return self._chart_to_base64(fig)
    
    def generate_registrations_chart(self, save_file: bool = True) -> str:
        """Génère un graphique d'évolution des inscriptions par mois."""
        if not MATPLOTLIB_AVAILABLE:
            return ""
        
        stats = self.get_users_stats()
        
        # Trier les mois
        months = sorted(stats['registrations_by_month'].keys())
        if not months:
            return ""
        
        values = [stats['registrations_by_month'][m] for m in months]
        
        # Création du graphique
        fig, ax = plt.subplots(figsize=(10, 6))
        
        # Convertir en dates pour l'axe X
        dates = [datetime.strptime(m, '%Y-%m') for m in months]
        
        if SEABORN_AVAILABLE:
            sns.barplot(x=dates, y=values, color=self.colors['primary'], ax=ax)
        else:
            ax.bar(dates, values, color=self.colors['primary'], width=20)
        
        # Configuration des axes
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
        ax.xaxis.set_major_locator(mdates.MonthLocator())
        plt.xticks(rotation=45, ha='right')
        
        ax.yaxis.set_major_locator(MaxNLocator(integer=True))
        
        ax.set_xlabel('Mois', fontsize=12)
        ax.set_ylabel('Nombre d\'inscriptions', fontsize=12)
        ax.set_title('Évolution des inscriptions', fontsize=14, fontweight='bold')
        
        plt.tight_layout()
        
        if save_file:
            return self._save_chart(fig, 'registrations_evolution.png')
        else:
            return self._chart_to_base64(fig)
    
    # =========================================================================
    # STATISTIQUES DES PRODUITS
    # =========================================================================
    
    def get_products_stats(self) -> Dict:
        """Calcule les statistiques des produits."""
        products = self._read_csv(self.products_file)
        
        stats = {
            'total': len(products),
            'active': 0,
            'inactive': 0,
            'by_category': defaultdict(int),
            'stock_distribution': [],
            'price_distribution': []
        }
        
        for product in products:
            # Actif/Inactif
            if product.get('active', 'true') == 'true':
                stats['active'] += 1
            else:
                stats['inactive'] += 1
            
            # Par catégorie
            category = product.get('category', 'Autre')
            stats['by_category'][category] += 1
            
            # Stock
            try:
                stock = int(product.get('stock', 0))
                stats['stock_distribution'].append(stock)
            except:
                pass
            
            # Prix
            try:
                price = float(product.get('price', 0))
                stats['price_distribution'].append(price)
            except:
                pass
        
        return dict(stats)
    
    def generate_products_by_category_chart(self, save_file: bool = True) -> str:
        """Génère un graphique à barres des produits par catégorie."""
        if not MATPLOTLIB_AVAILABLE:
            return ""
        
        stats = self.get_products_stats()
        
        categories = list(stats['by_category'].keys())
        counts = list(stats['by_category'].values())
        
        if not categories:
            return ""
        
        # Tri décroissant
        sorted_data = sorted(zip(counts, categories), reverse=True)
        counts, categories = zip(*sorted_data)
        
        # Création du graphique
        fig, ax = plt.subplots(figsize=(10, 6))
        
        # Dégradé de couleurs
        cmap = plt.cm.get_cmap('Greens')
        colors = [cmap(0.3 + 0.5 * i / len(categories)) for i in range(len(categories))]
        
        if SEABORN_AVAILABLE:
            sns.barplot(x=list(categories), y=list(counts), palette=colors, ax=ax)
        else:
            ax.bar(categories, counts, color=colors)
        
        ax.set_xlabel('Catégorie', fontsize=12)
        ax.set_ylabel('Nombre de produits', fontsize=12)
        ax.set_title('Répartition des produits par catégorie', fontsize=14, fontweight='bold')
        
        plt.xticks(rotation=45, ha='right')
        ax.yaxis.set_major_locator(MaxNLocator(integer=True))
        
        plt.tight_layout()
        
        if save_file:
            return self._save_chart(fig, 'products_by_category.png')
        else:
            return self._chart_to_base64(fig)
    
    def generate_price_distribution_chart(self, save_file: bool = True) -> str:
        """Génère un histogramme de la distribution des prix."""
        if not MATPLOTLIB_AVAILABLE:
            return ""
        
        stats = self.get_products_stats()
        prices = stats['price_distribution']
        
        if not prices:
            return ""
        
        # Création du graphique
        fig, ax = plt.subplots(figsize=(10, 6))
        
        if SEABORN_AVAILABLE:
            sns.histplot(prices, bins=20, color=self.colors['accent'], kde=True, ax=ax)
        else:
            ax.hist(prices, bins=20, color=self.colors['accent'], edgecolor='white')
        
        ax.set_xlabel('Prix (€)', fontsize=12)
        ax.set_ylabel('Nombre de produits', fontsize=12)
        ax.set_title('Distribution des prix des produits', fontsize=14, fontweight='bold')
        
        # Statistiques affichées
        avg_price = sum(prices) / len(prices)
        ax.axvline(avg_price, color=self.colors['error'], linestyle='--', 
                   label=f'Prix moyen: {avg_price:.2f}€')
        ax.legend()
        
        plt.tight_layout()
        
        if save_file:
            return self._save_chart(fig, 'price_distribution.png')
        else:
            return self._chart_to_base64(fig)
    
    def generate_stock_status_chart(self, save_file: bool = True) -> str:
        """Génère un graphique de l'état des stocks."""
        if not MATPLOTLIB_AVAILABLE:
            return ""
        
        products = self._read_csv(self.products_file)
        
        # Catégorisation des stocks
        stock_categories = {
            'Rupture (0)': 0,
            'Critique (1-5)': 0,
            'Faible (6-20)': 0,
            'Normal (21-50)': 0,
            'Élevé (50+)': 0
        }
        
        for product in products:
            if product.get('active', 'true') != 'true':
                continue
            try:
                stock = int(product.get('stock', 0))
                if stock == 0:
                    stock_categories['Rupture (0)'] += 1
                elif stock <= 5:
                    stock_categories['Critique (1-5)'] += 1
                elif stock <= 20:
                    stock_categories['Faible (6-20)'] += 1
                elif stock <= 50:
                    stock_categories['Normal (21-50)'] += 1
                else:
                    stock_categories['Élevé (50+)'] += 1
            except:
                pass
        
        # Création du graphique
        fig, ax = plt.subplots(figsize=(8, 6))
        
        labels = list(stock_categories.keys())
        sizes = list(stock_categories.values())
        colors = [
            self.colors['error'],      # Rupture
            self.colors['warning'],    # Critique
            '#e6c9a8',                 # Faible (accent light)
            self.colors['success'],    # Normal
            self.colors['primary']     # Élevé
        ]
        
        # Filtrer les valeurs nulles
        non_zero = [(l, s, c) for l, s, c in zip(labels, sizes, colors) if s > 0]
        if not non_zero:
            plt.close(fig)
            return ""
        
        labels, sizes, colors = zip(*non_zero)
        
        wedges, texts, autotexts = ax.pie(
            sizes, labels=labels, colors=colors,
            autopct='%1.1f%%', startangle=90,
            explode=[0.02] * len(sizes)
        )
        
        for autotext in autotexts:
            autotext.set_fontweight('bold')
        
        ax.set_title('État des stocks', fontsize=14, fontweight='bold')
        
        if save_file:
            return self._save_chart(fig, 'stock_status.png')
        else:
            return self._chart_to_base64(fig)
    
    # =========================================================================
    # STATISTIQUES DES COMMANDES
    # =========================================================================
    
    def get_orders_stats(self) -> Dict:
        """Calcule les statistiques des commandes."""
        orders = self._read_csv(self.orders_file)
        
        stats = {
            'total': len(orders),
            'by_status': defaultdict(int),
            'revenue_by_month': defaultdict(float),
            'orders_by_month': defaultdict(int),
            'total_revenue': 0,
            'average_order': 0
        }
        
        for order in orders:
            # Par statut
            status = order.get('status', 'pending')
            stats['by_status'][status] += 1
            
            # Revenus
            try:
                total = float(order.get('total', 0))
                stats['total_revenue'] += total
                
                # Par mois
                created_at = order.get('created_at', '')
                if created_at:
                    date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    month_key = date.strftime('%Y-%m')
                    stats['revenue_by_month'][month_key] += total
                    stats['orders_by_month'][month_key] += 1
            except:
                pass
        
        if stats['total'] > 0:
            stats['average_order'] = stats['total_revenue'] / stats['total']
        
        return dict(stats)
    
    def generate_orders_by_status_chart(self, save_file: bool = True) -> str:
        """Génère un graphique des commandes par statut."""
        if not MATPLOTLIB_AVAILABLE:
            return ""
        
        stats = self.get_orders_stats()
        
        status_labels = {
            'pending': 'En attente',
            'confirmed': 'Confirmées',
            'shipped': 'Expédiées',
            'delivered': 'Livrées',
            'cancelled': 'Annulées'
        }
        
        status_colors = {
            'pending': self.colors['warning'],
            'confirmed': self.colors['info'],
            'shipped': self.colors['primary_light'],
            'delivered': self.colors['success'],
            'cancelled': self.colors['error']
        }
        
        statuses = []
        counts = []
        colors = []
        
        for status, count in stats['by_status'].items():
            if count > 0:
                statuses.append(status_labels.get(status, status))
                counts.append(count)
                colors.append(status_colors.get(status, self.colors['gray']))
        
        if not statuses:
            return ""
        
        # Création du graphique
        fig, ax = plt.subplots(figsize=(10, 6))
        
        bars = ax.bar(statuses, counts, color=colors, edgecolor='white', linewidth=1)
        
        # Ajouter les valeurs sur les barres
        for bar, count in zip(bars, counts):
            height = bar.get_height()
            ax.annotate(f'{count}',
                       xy=(bar.get_x() + bar.get_width() / 2, height),
                       xytext=(0, 3),
                       textcoords="offset points",
                       ha='center', va='bottom', fontweight='bold')
        
        ax.set_xlabel('Statut', fontsize=12)
        ax.set_ylabel('Nombre de commandes', fontsize=12)
        ax.set_title('Répartition des commandes par statut', fontsize=14, fontweight='bold')
        
        ax.yaxis.set_major_locator(MaxNLocator(integer=True))
        
        plt.tight_layout()
        
        if save_file:
            return self._save_chart(fig, 'orders_by_status.png')
        else:
            return self._chart_to_base64(fig)
    
    def generate_revenue_evolution_chart(self, save_file: bool = True) -> str:
        """Génère un graphique d'évolution du chiffre d'affaires."""
        if not MATPLOTLIB_AVAILABLE:
            return ""
        
        stats = self.get_orders_stats()
        
        months = sorted(stats['revenue_by_month'].keys())
        if not months:
            return ""
        
        revenues = [stats['revenue_by_month'][m] for m in months]
        orders_count = [stats['orders_by_month'][m] for m in months]
        
        # Création du graphique avec double axe Y
        fig, ax1 = plt.subplots(figsize=(12, 6))
        
        dates = [datetime.strptime(m, '%Y-%m') for m in months]
        
        # Barres pour le CA
        color1 = self.colors['primary']
        ax1.bar(dates, revenues, width=20, color=color1, alpha=0.7, label='Chiffre d\'affaires')
        ax1.set_xlabel('Mois', fontsize=12)
        ax1.set_ylabel('Chiffre d\'affaires (€)', color=color1, fontsize=12)
        ax1.tick_params(axis='y', labelcolor=color1)
        
        # Ligne pour le nombre de commandes
        ax2 = ax1.twinx()
        color2 = self.colors['accent']
        ax2.plot(dates, orders_count, color=color2, marker='o', linewidth=2, 
                label='Nombre de commandes')
        ax2.set_ylabel('Nombre de commandes', color=color2, fontsize=12)
        ax2.tick_params(axis='y', labelcolor=color2)
        ax2.yaxis.set_major_locator(MaxNLocator(integer=True))
        
        # Format des dates
        ax1.xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
        ax1.xaxis.set_major_locator(mdates.MonthLocator())
        plt.xticks(rotation=45, ha='right')
        
        ax1.set_title('Évolution du chiffre d\'affaires et des commandes', 
                     fontsize=14, fontweight='bold')
        
        # Légende combinée
        lines1, labels1 = ax1.get_legend_handles_labels()
        lines2, labels2 = ax2.get_legend_handles_labels()
        ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper left')
        
        plt.tight_layout()
        
        if save_file:
            return self._save_chart(fig, 'revenue_evolution.png')
        else:
            return self._chart_to_base64(fig)
    
    # =========================================================================
    # GÉNÉRATION DE TOUS LES GRAPHIQUES
    # =========================================================================
    
    def generate_all_charts(self, save_files: bool = True) -> Dict[str, str]:
        """
        Génère tous les graphiques disponibles.
        
        Args:
            save_files: Si True, sauvegarde les fichiers PNG.
                       Si False, retourne les images en base64.
        
        Returns:
            Dictionnaire avec les chemins/base64 des graphiques.
        """
        if not MATPLOTLIB_AVAILABLE:
            print("[STATS] matplotlib non disponible, impossible de générer les graphiques")
            return {}
        
        print("[STATS] Génération de tous les graphiques...")
        
        charts = {}
        
        # Utilisateurs
        charts['users_by_role'] = self.generate_users_by_role_chart(save_files)
        charts['registrations_evolution'] = self.generate_registrations_chart(save_files)
        
        # Produits
        charts['products_by_category'] = self.generate_products_by_category_chart(save_files)
        charts['price_distribution'] = self.generate_price_distribution_chart(save_files)
        charts['stock_status'] = self.generate_stock_status_chart(save_files)
        
        # Commandes
        charts['orders_by_status'] = self.generate_orders_by_status_chart(save_files)
        charts['revenue_evolution'] = self.generate_revenue_evolution_chart(save_files)
        
        print(f"[STATS] {len([c for c in charts.values() if c])} graphiques générés")
        
        return charts
    
    def get_summary_stats(self) -> Dict:
        """
        Retourne un résumé de toutes les statistiques.
        """
        return {
            'users': self.get_users_stats(),
            'products': self.get_products_stats(),
            'orders': self.get_orders_stats()
        }


# =========================================================================
# POINT D'ENTRÉE POUR EXÉCUTION DIRECTE
# =========================================================================

if __name__ == '__main__':
    print("=" * 60)
    print("GÉNÉRATION DES STATISTIQUES MARKETFLOW")
    print("=" * 60)
    
    generator = StatisticsGenerator()
    
    # Afficher les statistiques textuelles
    print("\n[STATISTIQUES UTILISATEURS]")
    user_stats = generator.get_users_stats()
    print(f"  - Total: {user_stats['total']}")
    for role, count in user_stats['by_role'].items():
        print(f"  - {role}: {count}")
    
    print("\n[STATISTIQUES PRODUITS]")
    product_stats = generator.get_products_stats()
    print(f"  - Total: {product_stats['total']}")
    print(f"  - Actifs: {product_stats['active']}")
    print(f"  - Inactifs: {product_stats['inactive']}")
    print(f"  - Catégories: {dict(product_stats['by_category'])}")
    
    print("\n[STATISTIQUES COMMANDES]")
    order_stats = generator.get_orders_stats()
    print(f"  - Total: {order_stats['total']}")
    print(f"  - CA Total: {order_stats['total_revenue']:.2f}€")
    print(f"  - Panier moyen: {order_stats['average_order']:.2f}€")
    print(f"  - Par statut: {dict(order_stats['by_status'])}")
    
    # Générer les graphiques
    if MATPLOTLIB_AVAILABLE:
        print("\n[GÉNÉRATION DES GRAPHIQUES]")
        charts = generator.generate_all_charts(save_files=True)
        for name, path in charts.items():
            if path:
                print(f"  - {name}: {path}")
    else:
        print("\n[ATTENTION] matplotlib non installé, graphiques non générés")
        print("  Installation: pip install matplotlib seaborn")
    
    print("\n" + "=" * 60)
    print("TERMINÉ")
    print("=" * 60)
