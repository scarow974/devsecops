/**
 * =============================================================================
 * COMPOSANT FOOTER - MARKETFLOW
 * =============================================================================
 * Pied de page avec liens et informations.
 * Design: Moderne & Vibrant avec couleurs sobres
 * =============================================================================
 */

/**
 * Rend le footer de l'application
 * @returns {string} HTML du footer
 */
function renderFooter() {
  const currentYear = new Date().getFullYear()

  return `
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-grid">
                    <!-- Logo et nom mis à jour pour MarketFlow -->
                    <div class="footer-section">
                        <div class="logo" style="margin-bottom: var(--spacing-md);">
                            <div class="logo-icon"><i class="bi bi-shop"></i></div>
                            <span style="color: white;">MarketFlow</span>
                        </div>
                        <p style="color: rgba(255, 255, 255, 0.7); font-size: var(--font-size-sm); line-height: 1.6;">
                            Une sélection curée de produits d'exception pour les amateurs de qualité et d'élégance.
                        </p>
                    </div>
                    
                    <!-- Liens rapides -->
                    <div class="footer-section">
                        <h4 class="footer-title">Navigation</h4>
                        <nav class="footer-nav">
                            <a href="#" onclick="event.preventDefault(); navigateTo('shop')"><i class="bi bi-grid"></i> Boutique</a>
                            <a href="#" onclick="event.preventDefault(); navigateTo('landing')"><i class="bi bi-house"></i> À propos</a>
                            <a href="#" onclick="event.preventDefault(); showToast('Contactez-nous à contact@marketflow.com', 'info')"><i class="bi bi-envelope"></i> Contact</a>
                        </nav>
                    </div>
                    
                    <!-- Compte -->
                    <div class="footer-section">
                        <h4 class="footer-title">Mon espace</h4>
                        <nav class="footer-nav">
                            <a href="#" onclick="event.preventDefault(); navigateTo('login')"><i class="bi bi-box-arrow-in-right"></i> Connexion</a>
                            <a href="#" onclick="event.preventDefault(); navigateTo('register')"><i class="bi bi-person-plus"></i> Inscription</a>
                            <a href="#" onclick="event.preventDefault(); navigateTo('client-dashboard')"><i class="bi bi-person"></i> Mon profil</a>
                        </nav>
                    </div>
                    
                    <!-- Contact -->
                    <div class="footer-section">
                        <h4 class="footer-title">Contact</h4>
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: var(--font-size-sm);">
                            <p><i class="bi bi-envelope"></i> contact@marketflow.com</p>
                            <p><i class="bi bi-telephone"></i> +33 1 23 45 67 89</p>
                            <p><i class="bi bi-geo-alt"></i> Paris, France</p>
                        </div>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <p>&copy; ${currentYear} MarketFlow. Tous droits réservés.</p>
                    <p style="font-size: var(--font-size-xs); color: rgba(255, 255, 255, 0.4);">
                        Application créée avec Python et pywebview
                    </p>
                </div>
            </div>
        </footer>
    `
}
