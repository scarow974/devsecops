/**
 * =============================================================================
 * COMPOSANT HEADER
 * =============================================================================
 * Barre de navigation principale avec gestion du panier et menu utilisateur.
 * =============================================================================
 */

// Declaration of AppState
const AppState = {
  user: null,
  currentPage: "",
  cart: [],
  cartCount: 0,
  isCartOpen: false,
}

// Declaration of getRoleLabel
function getRoleLabel(role) {
  switch (role) {
    case "admin":
      return "Admin"
    case "seller":
      return "Vendeur"
    default:
      return "Client"
  }
}

// Declaration of formatPrice
function formatPrice(price) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price)
}

// Declaration of showToast
function showToast(message, type) {
  console.log(`Toast: ${message} (Type: ${type})`)
}

// Declaration of toggleCart
function toggleCart() {
  AppState.isCartOpen = !AppState.isCartOpen
}

// Declaration of openModal
function openModal(modalId) {
  document.getElementById(modalId).classList.add("show")
}

// Declaration of closeModal
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("show")
}

// Declaration of createOrder
async function createOrder(address) {
  console.log(`Order created with address: ${address}`)
}

/**
 * Rend le header de l'application
 * @returns {string} HTML du header
 */
function renderHeader() {
  const isLoggedIn = AppState.user !== null
  const userRole = AppState.user?.role

  return `
        <header class="header">
            <div class="header-content">
                <!-- Logo -->
                <div class="logo" onclick="navigateTo('landing')" style="cursor: pointer;">
                    <div class="logo-icon">SP</div>
                    <span>ShopPro</span>
                </div>
                
                <!-- Navigation principale -->
                <nav class="nav-menu">
                    <a href="#" class="nav-link ${AppState.currentPage === "shop" ? "active" : ""}" 
                       onclick="event.preventDefault(); navigateTo('shop')">
                        Boutique
                    </a>
                    
                    ${
                      isLoggedIn
                        ? `
                        ${
                          userRole === "seller" || userRole === "admin"
                            ? `
                            <a href="#" class="nav-link ${AppState.currentPage === "seller-dashboard" ? "active" : ""}"
                               onclick="event.preventDefault(); navigateTo('seller-dashboard')">
                                Espace Vendeur
                            </a>
                        `
                            : ""
                        }
                        
                        ${
                          userRole === "admin"
                            ? `
                            <a href="#" class="nav-link ${AppState.currentPage === "admin-dashboard" ? "active" : ""}"
                               onclick="event.preventDefault(); navigateTo('admin-dashboard')">
                                Administration
                            </a>
                        `
                            : ""
                        }
                    `
                        : ""
                    }
                </nav>
                
                <!-- Actions utilisateur -->
                <div class="header-actions">
                    ${
                      isLoggedIn
                        ? `
                        <!-- Bouton Panier -->
                        <button class="cart-button" onclick="toggleCart()">
                            <span class="cart-icon">🛒</span>
                            <span class="cart-badge" style="${AppState.cartCount > 0 ? "" : "display: none;"}">
                                ${AppState.cartCount}
                            </span>
                        </button>
                        
                        <!-- Menu utilisateur -->
                        <div class="user-menu">
                            <button class="user-menu-trigger" onclick="toggleUserMenu()">
                                <div class="user-avatar">
                                    ${AppState.user.firstname[0]}${AppState.user.lastname[0]}
                                </div>
                                <span class="user-name">${AppState.user.firstname}</span>
                                <span class="dropdown-arrow">▼</span>
                            </button>
                            
                            <div class="user-dropdown" id="user-dropdown">
                                <div class="dropdown-header">
                                    <strong>${AppState.user.firstname} ${AppState.user.lastname}</strong>
                                    <span class="badge ${userRole === "admin" ? "badge-error" : userRole === "seller" ? "badge-warning" : "badge-primary"}">
                                        ${getRoleLabel(userRole)}
                                    </span>
                                </div>
                                <div class="dropdown-divider"></div>
                                <a href="#" class="dropdown-item" onclick="event.preventDefault(); navigateTo('client-dashboard')">
                                    👤 Mon compte
                                </a>
                                <a href="#" class="dropdown-item" onclick="event.preventDefault(); navigateTo('client-dashboard', {section: 'orders'})">
                                    📦 Mes commandes
                                </a>
                                <div class="dropdown-divider"></div>
                                <a href="#" class="dropdown-item text-error" onclick="event.preventDefault(); logout()">
                                    🚪 Déconnexion
                                </a>
                            </div>
                        </div>
                    `
                        : `
                        <a href="#" class="btn btn-secondary" onclick="event.preventDefault(); navigateTo('login')">
                            Connexion
                        </a>
                        <a href="#" class="btn btn-primary" onclick="event.preventDefault(); navigateTo('register')">
                            Inscription
                        </a>
                    `
                    }
                </div>
            </div>
        </header>
        
        <!-- Overlay panier -->
        <div class="cart-overlay ${AppState.isCartOpen ? "show" : ""}" onclick="toggleCart()"></div>
        
        <!-- Panneau panier -->
        <div class="cart-panel ${AppState.isCartOpen ? "open" : ""}">
            <div class="cart-header">
                <h3>Mon Panier</h3>
                <button class="cart-close" onclick="toggleCart()">✕</button>
            </div>
            
            <div class="cart-items">
                <!-- Contenu chargé dynamiquement -->
            </div>
            
            <div class="cart-footer">
                <div class="cart-total">
                    <span>Total:</span>
                    <span class="cart-total-value">${formatPrice(0)}</span>
                </div>
                <button class="btn btn-accent w-full btn-lg" onclick="showCheckoutModal()" 
                        ${AppState.cart.length === 0 ? "disabled" : ""}>
                    Valider la commande
                </button>
            </div>
        </div>
        
        <!-- Modal de checkout -->
        <div class="modal-overlay" id="checkout-modal">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Finaliser la commande</h3>
                    <button class="modal-close" onclick="closeModal('checkout-modal')">✕</button>
                </div>
                <div class="modal-body">
                    <form onsubmit="handleCheckout(event)">
                        <div class="form-group">
                            <label class="form-label">Adresse de livraison</label>
                            <textarea id="checkout-address" class="form-input form-textarea" required
                                      placeholder="Numéro, rue, code postal, ville..."></textarea>
                        </div>
                        
                        <div class="checkout-summary">
                            <h4>Récapitulatif</h4>
                            <div id="checkout-items"></div>
                            <div class="checkout-total">
                                <span>Total à payer:</span>
                                <strong id="checkout-total-value"></strong>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary w-full btn-lg mt-lg">
                            Confirmer la commande
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `
}

/**
 * Toggle le menu utilisateur
 */
function toggleUserMenu() {
  const dropdown = document.getElementById("user-dropdown")
  if (dropdown) {
    dropdown.classList.toggle("show")
  }
}

/**
 * Affiche la modal de checkout
 */
function showCheckoutModal() {
  if (AppState.cart.length === 0) {
    showToast("Votre panier est vide", "warning")
    return
  }

  // Remplit le récapitulatif
  const itemsContainer = document.getElementById("checkout-items")
  const totalElement = document.getElementById("checkout-total-value")

  if (itemsContainer) {
    itemsContainer.innerHTML = AppState.cart
      .map(
        (item) => `
            <div style="display: flex; justify-content: space-between; padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--color-gray-100);">
                <span>${item.product.name} x${item.quantity}</span>
                <strong>${formatPrice(item.product.price * item.quantity)}</strong>
            </div>
        `,
      )
      .join("")
  }

  if (totalElement) {
    const total = AppState.cart.reduce((sum, item) => sum + Number.parseFloat(item.product.price) * item.quantity, 0)
    totalElement.textContent = formatPrice(total)
  }

  toggleCart() // Ferme le panier
  openModal("checkout-modal")
}

/**
 * Gère la soumission du checkout
 * @param {Event} event - Événement de soumission
 */
async function handleCheckout(event) {
  event.preventDefault()

  const address = document.getElementById("checkout-address").value

  await createOrder(address)
  closeModal("checkout-modal")
}

// Ferme le menu utilisateur si on clique ailleurs
document.addEventListener("click", (event) => {
  const userMenu = document.querySelector(".user-menu")
  const dropdown = document.getElementById("user-dropdown")

  if (userMenu && dropdown && !userMenu.contains(event.target)) {
    dropdown.classList.remove("show")
  }
})
