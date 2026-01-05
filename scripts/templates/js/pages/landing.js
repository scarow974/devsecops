/**
 * =============================================================================
 * PAGE D'ACCUEIL - MARKETFLOW LANDING PAGE
 * =============================================================================
 * Page de présentation élégante avec les features principales.
 * =============================================================================
 */

// Declaration of AppState
const AppState = {
  user: null,
  currentPage: "landing",
  cart: [],
  cartCount: 0,
}

// Declaration of formatPrice
function formatPrice(price) {
  return price.toFixed(2) + " €"
}

// Declaration of showToast
function showToast(message, type) {
  console.log(`Toast: ${message} (${type})`)
}

// Declaration of toggleCart
function toggleCart() {
  const cartPanel = document.querySelector(".cart-panel")
  cartPanel.classList.toggle("hidden")
}

// Declaration of openModal
function openModal(modalId) {
  const modal = document.getElementById(modalId)
  modal.classList.remove("hidden")
}

// Declaration of createOrder
async function createOrder(address) {
  console.log(`Order created with address: ${address}`)
}

// Declaration of closeModal
function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  modal.classList.add("hidden")
}

/**
 * Rend la page d'accueil
 * @returns {string} HTML de la page
 */
function renderLandingPage() {
  return `
        <div class="page">
            <!-- Header -->
            ${renderHeader()}
            
            <!-- Hero Section redesigné pour MarketFlow -->
            <section class="hero">
                <div class="hero-content">
                    <h1 class="hero-title">Découvrez l'élégance sur <span style="color: var(--accent-light);">MarketFlow</span></h1>
                    <p class="hero-subtitle">
                        Une sélection curée de produits uniques, conçus pour inspirer et ravir.
                        Explorez un monde de qualité et de style.
                    </p>
                    <div class="hero-actions">
                        <button class="btn btn-accent hero-btn" onclick="navigateTo('shop')">
                            <i class="bi bi-grid"></i> Découvrir la collection
                        </button>
                        <button class="btn btn-outline hero-btn" style="color: white; border-color: rgba(255,255,255,0.4);" onclick="navigateTo('register')">
                            <i class="bi bi-spark"></i> Devenir membre
                        </button>
                    </div>
                </div>
            </section>
            
            <!-- Features Section redesigné -->
            <section class="features">
                <h2 class="section-title">Pourquoi MarketFlow ?</h2>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon"><i class="bi bi-gem"></i></div>
                        <h3 class="feature-title">Qualité Exceptionnelle</h3>
                        <p class="feature-description">
                            Nous sélectionnons des produits d'exception pour leur design et leur durabilité.
                        </p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon"><i class="bi bi-shield-check"></i></div>
                        <h3 class="feature-title">Transactions Sécurisées</h3>
                        <p class="feature-description">
                            Profitez d'un environnement d'achat et de vente protégé et fiable.
                        </p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon"><i class="bi bi-broadcast"></i></div>
                        <h3 class="feature-title">Découvertes Uniques</h3>
                        <p class="feature-description">
                            Trouvez des articles rares et originaux, loin des sentiers battus.
                        </p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon"><i class="bi bi-headset"></i></div>
                        <h3 class="feature-title">Support Dédié</h3>
                        <p class="feature-description">
                            Notre équipe est là pour vous accompagner à chaque étape.
                        </p>
                    </div>
                </div>
            </section>
            
            <!-- CTA Section redesigné avec nouvelle palette -->
            <section style="background: var(--color-gray-100); padding: var(--spacing-3xl) var(--spacing-lg); text-align: center;">
                <h2 style="font-family: var(--font-family-display); font-size: var(--font-size-2xl); margin-bottom: var(--spacing-md); color: var(--color-gray-800);">
                    Prêt à rejoindre MarketFlow ?
                </h2>
                <p style="color: var(--color-gray-500); margin-bottom: var(--spacing-xl); max-width: 600px; margin-left: auto; margin-right: auto;">
                    Rejoignez notre communauté de passionnés. 
                    Créez votre compte gratuitement et commencez à explorer dès maintenant.
                </p>
                <div style="display: flex; gap: var(--spacing-md); justify-content: center; flex-wrap: wrap;">
                    <button class="btn btn-primary btn-lg" onclick="navigateTo('register')">
                        <i class="bi bi-person-plus"></i> Créer un compte gratuit
                    </button>
                    <button class="btn btn-outline btn-lg" onclick="navigateTo('shop')">
                        <i class="bi bi-grid"></i> Explorer la collection
                    </button>
                </div>
            </section>
            
            <!-- Comptes de démonstration -->
            <section style="padding: var(--spacing-2xl) var(--spacing-lg); max-width: 800px; margin: 0 auto;">
                <div class="card" style="padding: var(--spacing-xl);">
                    <h3 style="margin-bottom: var(--spacing-lg); text-align: center; font-family: var(--font-family-display);">
                        <i class="bi bi-key" style="color: var(--color-primary);"></i> Comptes de démonstration
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-lg);">
                        <div style="text-align: center; padding: var(--spacing-md); background: var(--color-gray-50); border-radius: var(--border-radius-lg);">
                            <span class="badge badge-primary" style="margin-bottom: var(--spacing-sm);">Client</span>
                            <p style="font-weight: 500;">client@marketflow.com</p>
                            <p style="color: var(--color-gray-500); font-size: var(--font-size-sm);">client123</p>
                        </div>
                        <div style="text-align: center; padding: var(--spacing-md); background: var(--color-gray-50); border-radius: var(--border-radius-lg);">
                            <span class="badge badge-warning" style="margin-bottom: var(--spacing-sm);">Vendeur</span>
                            <p style="font-weight: 500;">vendeur@marketflow.com</p>
                            <p style="color: var(--color-gray-500); font-size: var(--font-size-sm);">vendeur123</p>
                        </div>
                        <div style="text-align: center; padding: var(--spacing-md); background: var(--color-gray-50); border-radius: var(--border-radius-lg);">
                            <span class="badge badge-danger" style="margin-bottom: var(--spacing-sm);">Admin</span>
                            <p style="font-weight: 500;">admin@marketflow.com</p>
                            <p style="color: var(--color-gray-500); font-size: var(--font-size-sm);">admin123</p>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Footer -->
            ${renderFooter()}
        </div>
    `
}

/**
 * Rend le header de l'application
 * @returns {string} HTML du header
 */
function renderHeader() {
  const isLoggedIn = AppState.user !== null
  const userInitials = isLoggedIn ? `${AppState.user.firstname[0]}${AppState.user.lastname[0]}`.toUpperCase() : ""

  return `
        <header class="header">
            <div class="header-content">
                <!-- Logo -->
                <div class="logo" style="cursor: pointer;" onclick="navigateTo('landing')">
                    <div class="logo-icon">SP</div>
                    <span>MarketFlow</span>
                </div>
                
                <!-- Navigation -->
                <nav class="nav-menu">
                    <a href="#" class="nav-link ${AppState.currentPage === "landing" ? "active" : ""}" 
                       onclick="event.preventDefault(); navigateTo('landing')">Accueil</a>
                    <a href="#" class="nav-link ${AppState.currentPage === "shop" ? "active" : ""}" 
                       onclick="event.preventDefault(); navigateTo('shop')">Collection</a>
                    ${
                      isLoggedIn && AppState.user.role === "seller"
                        ? `
                        <a href="#" class="nav-link ${AppState.currentPage === "seller-dashboard" ? "active" : ""}" 
                           onclick="event.preventDefault(); navigateTo('seller-dashboard')">Espace Vendeur</a>
                    `
                        : ""
                    }
                    ${
                      isLoggedIn && AppState.user.role === "admin"
                        ? `
                        <a href="#" class="nav-link ${AppState.currentPage === "admin-dashboard" ? "active" : ""}" 
                           onclick="event.preventDefault(); navigateTo('admin-dashboard')">Administration</a>
                    `
                        : ""
                    }
                </nav>
                
                <!-- Actions -->
                <div class="header-actions">
                    <!-- Barre de recherche -->
                    <div class="search-bar">
                        <input type="text" placeholder="Rechercher un produit..." 
                               id="header-search" onkeypress="if(event.key === 'Enter') { navigateTo('shop'); searchProducts(this.value); }">
                        <button onclick="navigateTo('shop'); searchProducts(document.getElementById('header-search').value);">
                            🔍
                        </button>
                    </div>
                    
                    <!-- Panier -->
                    ${
                      isLoggedIn
                        ? `
                        <button class="cart-button" onclick="toggleCart()">
                            🛒
                            <span class="cart-badge" style="${AppState.cartCount > 0 ? "" : "display: none"}">${AppState.cartCount}</span>
                        </button>
                    `
                        : ""
                    }
                    
                    <!-- Utilisateur -->
                    ${
                      isLoggedIn
                        ? `
                        <div class="user-menu">
                            <button class="user-button">
                                <div class="user-avatar">${userInitials}</div>
                                <span>${AppState.user.firstname}</span>
                            </button>
                            <div class="user-dropdown">
                                <div class="dropdown-item" onclick="navigateTo('client-dashboard')">
                                    👤 Mon compte
                                </div>
                                <div class="dropdown-item" onclick="navigateTo('client-dashboard', {section: 'orders'})">
                                    📦 Mes commandes
                                </div>
                                ${
                                  AppState.user.role === "seller"
                                    ? `
                                    <div class="dropdown-item" onclick="navigateTo('seller-dashboard')">
                                        🏪 Espace vendeur
                                    </div>
                                `
                                    : ""
                                }
                                ${
                                  AppState.user.role === "admin"
                                    ? `
                                    <div class="dropdown-item" onclick="navigateTo('admin-dashboard')">
                                        ⚙️ Administration
                                    </div>
                                `
                                    : ""
                                }
                                <div class="dropdown-divider"></div>
                                <div class="dropdown-item" style="color: var(--color-error);" onclick="logout()">
                                    🚪 Déconnexion
                                </div>
                            </div>
                        </div>
                    `
                        : `
                        <button class="btn btn-primary" onclick="navigateTo('auth')">
                            Connexion
                        </button>
                    `
                    }
                </div>
            </div>
        </header>
        
        <!-- Panneau du panier -->
        <div class="cart-overlay" onclick="toggleCart()"></div>
        <div class="cart-panel hidden">
            <div class="cart-header">
                <h3 class="cart-title">Mon Panier</h3>
                <button class="btn btn-ghost btn-icon" onclick="toggleCart()">✕</button>
            </div>
            <div class="cart-items">
                <!-- Contenu chargé dynamiquement -->
            </div>
            <div class="cart-footer">
                <div class="cart-total">
                    <span>Total</span>
                    <span class="cart-total-value">${formatPrice(0)}</span>
                </div>
                <button class="btn btn-primary w-full" onclick="openCheckoutModal()">
                    Passer commande
                </button>
            </div>
        </div>
        
        <!-- Modal de checkout -->
        <div class="modal-overlay hidden" id="checkout-modal">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Finaliser la commande</h3>
                    <button class="modal-close" onclick="closeModal('checkout-modal')">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Adresse de livraison</label>
                        <textarea class="form-input form-textarea" id="shipping-address" 
                                  placeholder="Entrez votre adresse complète..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('checkout-modal')">Annuler</button>
                    <button class="btn btn-accent" onclick="submitOrder()">
                        Confirmer la commande
                    </button>
                </div>
            </div>
        </div>
    `
}

/**
 * Ouvre la modal de checkout
 */
function openCheckoutModal() {
  if (AppState.cart.length === 0) {
    showToast("Votre panier est vide", "warning")
    return
  }
  toggleCart()
  openModal("checkout-modal")
}

/**
 * Soumet la commande
 */
async function submitOrder() {
  const address = document.getElementById("shipping-address").value
  await createOrder(address)
  closeModal("checkout-modal")
}

/**
 * Rend le footer de l'application
 * @returns {string} HTML du footer
 */
function renderFooter() {
  return `
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>MarketFlow</h4>
                    <p style="color: var(--color-gray-400); margin-bottom: var(--spacing-md);">
                        Votre marketplace de confiance pour acheter et vendre des produits de qualité.
                    </p>
                </div>
                <div class="footer-section">
                    <h4>Navigation</h4>
                    <div class="footer-links">
                        <a href="#" onclick="event.preventDefault(); navigateTo('landing')">Accueil</a>
                        <a href="#" onclick="event.preventDefault(); navigateTo('shop')">Collection</a>
                        <a href="#" onclick="event.preventDefault(); navigateTo('auth')">Connexion</a>
                    </div>
                </div>
                <div class="footer-section">
                    <h4>Aide</h4>
                    <div class="footer-links">
                        <a href="#">FAQ</a>
                        <a href="#">Contact</a>
                        <a href="#">Livraison</a>
                        <a href="#">Retours</a>
                    </div>
                </div>
                <div class="footer-section">
                    <h4>Légal</h4>
                    <div class="footer-links">
                        <a href="#">CGV</a>
                        <a href="#">Mentions légales</a>
                        <a href="#">Confidentialité</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>© 2025 MarketFlow. Tous droits réservés. Application créée avec pywebview.</p>
            </div>
        </footer>
    `
}
