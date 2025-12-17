"""
=============================================================================
APPLICATION E-COMMERCE PYWEBVIEW - MARKETFLOW
=============================================================================
Point d'entrée principal de l'application.
Lance l'interface graphique avec pywebview.

Auteur: v0
Date: 2025
=============================================================================
"""

import webview
import os
import sys

# Ajout du répertoire courant au path pour les imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import DatabaseManager
from api import Api


def main():
    """
    Fonction principale qui initialise et lance l'application.
    """
    # Initialisation de la base de données
    db = DatabaseManager()
    db.initialize_database()
    
    # Création de l'API pour communiquer entre Python et JavaScript
    api = Api(db)
    
    # Chemin vers le fichier HTML principal
    html_path = os.path.join(os.path.dirname(__file__), 'templates', 'index.html')
    
    # Vérification que le fichier existe
    if not os.path.exists(html_path):
        print(f"Erreur: Le fichier {html_path} n'existe pas")
        sys.exit(1)
    
    print(f"[APP] Démarrage de MarketFlow...")
    print(f"[APP] Fichier HTML: {html_path}")
    
    # Création de la fenêtre pywebview
    # js_api expose l'objet api au JavaScript via window.pywebview.api
    window = webview.create_window(
        title='MarketFlow - Votre Marketplace',  # Nouveau nom
        url=html_path,
        width=1400,
        height=900,
        resizable=True,
        min_size=(1024, 768),
        js_api=api,
        text_select=True
    )
    
    # Stockage de la référence de la fenêtre dans l'API
    api.set_window(window)
    
    # Démarrage de l'application avec debug=True pour voir les erreurs
    # Mettre debug=False en production
    webview.start(debug=True)


if __name__ == '__main__':
    main()
