/**
 * =============================================================================
 * COMPOSANT FOOTER
 * =============================================================================
 * Pied de page avec liens et informations.
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
                    <!-- À propos -->
                    <div class="footer-section">
                        <div class="logo" style="margin-bottom: var(--spacing-md);">
                            <div class="logo-icon">SP</div>
                            <span>ShopPro</span>
                        </div>
                        <p style="color: var(--color-gray-400); font-size: var(--font-size-sm); line-height: 1.6;">
                            Votre plateforme e-commerce de confiance pour acheter et vendre en toute simplicité.
                        </p>
                    </div>
                    
                    <!-- Liens rapides -->
                    <div class="footer-section">
                        <h4 class="footer-title">Liens rapides</h4>
                        <nav class="footer-nav">
                            <a href="#" onclick="event.preventDefault(); navigateTo('shop')">Boutique</a>
                            <a href="#" onclick="event.preventDefault(); navigateTo('landing')">À propos</a>
                            <a href="#" onclick="event.preventDefault(); showToast('Contactez-nous à contact@shoppro.com', 'info')">Contact</a>
                        </nav>
                    </div>
                    
                    <!-- Compte -->
                    <div class="footer-section">
                        <h4 class="footer-title">Mon compte</h4>
                        <nav class="footer-nav">
                            <a href="#" onclick="event.preventDefault(); navigateTo('login')">Connexion</a>
                            <a href="#" onclick="event.preventDefault(); navigateTo('register')">Inscription</a>
                            <a href="#" onclick="event.preventDefault(); navigateTo('client-dashboard')">Mon profil</a>
                        </nav>
                    </div>
                    
                    <!-- Contact -->
                    <div class="footer-section">
                        <h4 class="footer-title">Contact</h4>
                        <div style="color: var(--color-gray-400); font-size: var(--font-size-sm);">
                            <p>📧 contact@shoppro.com</p>
                            <p>📞 +33 1 23 45 67 89</p>
                            <p>📍 Paris, France</p>
                        </div>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <p>&copy; ${currentYear} ShopPro. Tous droits réservés.</p>
                    <p style="font-size: var(--font-size-xs); color: var(--color-gray-500);">
                        Application créée avec Python et pywebview
                    </p>
                </div>
            </div>
        </footer>
    `
}
