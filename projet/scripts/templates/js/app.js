/**
 * =============================================================================
 * APPLICATION PRINCIPALE - SHOPPRO
 * =============================================================================
 * Gère la navigation, l'état global et l'initialisation de l'application.
 * Point d'entrée principal de l'application frontend.
 * =============================================================================
 */

// État global de l'application
const AppState = {
  currentPage: "landing",
  user: null,
  cart: [],
  cartCount: 0,
  isCartOpen: false,
  products: [],
  categories: [],
  selectedCategory: null,
  searchQuery: "",
}

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Attend que l'API pywebview soit disponible
 * @returns {Promise} Résolu quand l'API est prête
 */
function waitForApi() {
  return new Promise((resolve) => {
    if (window.pywebview && window.pywebview.api) {
      resolve()
    } else {
      window.addEventListener("pywebviewready", resolve)
    }
  })
}

/**
 * Appelle une méthode de l'API Python
 * @param {string} method - Nom de la méthode
 * @param {...any} args - Arguments de la méthode
 * @returns {Promise<Object>} Résultat parsé en JSON
 */
async function apiCall(method, ...args) {
  try {
    const result = await window.pywebview.api[method](...args)
    return JSON.parse(result)
  } catch (error) {
    console.error(`Erreur API ${method}:`, error)
    showToast("Erreur de connexion", "error")
    return { success: false, message: "Erreur de connexion" }
  }
}

/**
 * Affiche une notification toast
 * @param {string} message - Message à afficher
 * @param {string} type - Type (success, error, info, warning)
 */
function showToast(message, type = "info") {
  let container = document.querySelector(".toast-container")
  if (!container) {
    container = document.createElement("div")
    container.className = "toast-container"
    document.body.appendChild(container)
  }

  const toast = document.createElement("div")
  toast.className = `toast ${type}`
  toast.innerHTML = `
        <span>${getToastIcon(type)}</span>
        <span>${message}</span>
    `

  container.appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = "0"
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

/**
 * Retourne l'icône appropriée pour le toast
 * @param {string} type - Type de toast
 * @returns {string} Caractère icône
 */
function getToastIcon(type) {
  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  }
  return icons[type] || icons.info
}

/**
 * Formate un prix en euros
 * @param {number|string} price - Prix à formater
 * @returns {string} Prix formaté
 */
function formatPrice(price) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number.parseFloat(price))
}

/**
 * Formate une date ISO en format français
 * @param {string} isoDate - Date ISO
 * @returns {string} Date formatée
 */
function formatDate(isoDate) {
  if (!isoDate) return "-"
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Retourne le libellé du statut de commande
 * @param {string} status - Code du statut
 * @returns {string} Libellé
 */
function getStatusLabel(status) {
  const labels = {
    pending: "En attente",
    confirmed: "Confirmée",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
  }
  return labels[status] || status
}

/**
 * Retourne le libellé du rôle utilisateur
 * @param {string} role - Code du rôle
 * @returns {string} Libellé
 */
function getRoleLabel(role) {
  const labels = {
    client: "Client",
    seller: "Vendeur",
    admin: "Administrateur",
  }
  return labels[role] || role
}

// ============================================================================
// NAVIGATION
// ============================================================================

/**
 * Navigue vers une page
 * @param {string} page - Nom de la page
 * @param {Object} params - Paramètres optionnels
 */
async function navigateTo(page, params = {}) {
  console.log(`Navigation vers: ${page}`, params)

  // Pages publiques accessibles sans connexion
  const publicPages = ["landing", "auth", "login", "register", "shop", "product"]

  if (!publicPages.includes(page) && !AppState.user) {
    navigateTo("login")
    return
  }

  // Vérification des permissions par rôle
  const rolePermissions = {
    "client-dashboard": ["client", "seller", "admin"],
    "seller-dashboard": ["seller", "admin"],
    "admin-dashboard": ["admin"],
  }

  if (rolePermissions[page]) {
    const userRole = AppState.user?.role
    if (!rolePermissions[page].includes(userRole)) {
      showToast("Accès non autorisé", "error")
      return
    }
  }

  AppState.currentPage = page

  const app = document.getElementById("app")

  // Rendu de la page appropriée
  switch (page) {
    case "landing":
      app.innerHTML = renderLandingPage()
      break
    case "auth":
    case "login":
      app.innerHTML = renderAuthPage("login")
      break
    case "register":
      app.innerHTML = renderAuthPage("register")
      break
    case "shop":
      app.innerHTML = await renderShopPage()
      break
    case "product":
      app.innerHTML = await renderProductPage(params.id)
      break
    case "client":
    case "client-dashboard":
      app.innerHTML = await renderClientDashboard(params.section || "orders")
      break
    case "seller":
    case "seller-dashboard":
      app.innerHTML = await renderSellerDashboard(params.section || "products")
      break
    case "admin":
    case "admin-dashboard":
      app.innerHTML = await renderAdminDashboard(params.section || "overview")
      break
    default:
      app.innerHTML = renderLandingPage()
  }

  window.scrollTo(0, 0)
}

// ============================================================================
// COMPOSANTS COMMUNS
// ============================================================================

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
                <div class="logo" onclick="navigateTo('landing')" style="cursor: pointer;">
                    <div class="logo-icon">SP</div>
                    <span>ShopPro</span>
                </div>
                
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
                            <a href="#" class="nav-link ${AppState.currentPage.includes("seller") ? "active" : ""}"
                               onclick="event.preventDefault(); navigateTo('seller-dashboard')">
                                Espace Vendeur
                            </a>
                        `
                            : ""
                        }
                        
                        ${
                          userRole === "admin"
                            ? `
                            <a href="#" class="nav-link ${AppState.currentPage.includes("admin") ? "active" : ""}"
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
                
                <div class="header-actions">
                    ${
                      isLoggedIn
                        ? `
                        <button class="cart-button" onclick="toggleCart()">
                            <span class="cart-icon">🛒</span>
                            <span class="cart-badge" style="${AppState.cartCount > 0 ? "" : "display: none;"}">
                                ${AppState.cartCount}
                            </span>
                        </button>
                        
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
                                    Mon compte
                                </a>
                                <a href="#" class="dropdown-item" onclick="event.preventDefault(); navigateTo('client-dashboard', {section: 'orders'})">
                                    Mes commandes
                                </a>
                                <div class="dropdown-divider"></div>
                                <a href="#" class="dropdown-item text-error" onclick="event.preventDefault(); logout()">
                                    Déconnexion
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
            <div class="cart-items"></div>
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
 * Rend le footer de l'application
 * @returns {string} HTML du footer
 */
function renderFooter() {
  const currentYear = new Date().getFullYear()

  return `
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-grid">
                    <div class="footer-section">
                        <div class="logo" style="margin-bottom: var(--spacing-md);">
                            <div class="logo-icon">SP</div>
                            <span>ShopPro</span>
                        </div>
                        <p style="color: var(--color-gray-400); font-size: var(--font-size-sm); line-height: 1.6;">
                            Votre plateforme e-commerce de confiance pour acheter et vendre en toute simplicité.
                        </p>
                    </div>
                    
                    <div class="footer-section">
                        <h4 class="footer-title">Liens rapides</h4>
                        <nav class="footer-nav">
                            <a href="#" onclick="event.preventDefault(); navigateTo('shop')">Boutique</a>
                            <a href="#" onclick="event.preventDefault(); navigateTo('landing')">À propos</a>
                            <a href="#" onclick="event.preventDefault(); showToast('contact@shoppro.com', 'info')">Contact</a>
                        </nav>
                    </div>
                    
                    <div class="footer-section">
                        <h4 class="footer-title">Mon compte</h4>
                        <nav class="footer-nav">
                            <a href="#" onclick="event.preventDefault(); navigateTo('login')">Connexion</a>
                            <a href="#" onclick="event.preventDefault(); navigateTo('register')">Inscription</a>
                            <a href="#" onclick="event.preventDefault(); navigateTo('client-dashboard')">Mon profil</a>
                        </nav>
                    </div>
                    
                    <div class="footer-section">
                        <h4 class="footer-title">Contact</h4>
                        <div style="color: var(--color-gray-400); font-size: var(--font-size-sm);">
                            <p>contact@shoppro.com</p>
                            <p>+33 1 23 45 67 89</p>
                            <p>Paris, France</p>
                        </div>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <p>© ${currentYear} ShopPro. Tous droits réservés.</p>
                    <p style="font-size: var(--font-size-xs); color: var(--color-gray-500);">
                        Application créée avec Python et pywebview
                    </p>
                </div>
            </div>
        </footer>
    `
}

// ============================================================================
// GESTION DE L'AUTHENTIFICATION
// ============================================================================

/**
 * Connecte un utilisateur
 * @param {string} email - Email
 * @param {string} password - Mot de passe
 */
async function login(email, password) {
  const result = await apiCall("login", email, password)

  if (result.success) {
    AppState.user = result.user
    showToast("Connexion réussie", "success")

    switch (result.user.role) {
      case "admin":
        navigateTo("admin-dashboard")
        break
      case "seller":
        navigateTo("seller-dashboard")
        break
      default:
        navigateTo("shop")
    }

    await updateCartState()
  } else {
    showToast(result.message, "error")
  }

  return result
}

/**
 * Inscrit un nouvel utilisateur
 * @param {Object} userData - Données utilisateur
 */
async function register(userData) {
  const result = await apiCall(
    "register",
    userData.email,
    userData.password,
    userData.firstname,
    userData.lastname,
    userData.role || "client",
  )

  if (result.success) {
    AppState.user = result.user
    showToast("Inscription réussie", "success")
    navigateTo("shop")
  } else {
    showToast(result.message, "error")
  }

  return result
}

/**
 * Déconnecte l'utilisateur
 */
async function logout() {
  await apiCall("logout")
  AppState.user = null
  AppState.cart = []
  AppState.cartCount = 0
  showToast("Déconnexion réussie", "success")
  navigateTo("landing")
}

/**
 * Récupère l'utilisateur actuellement connecté
 */
async function checkCurrentUser() {
  const result = await apiCall("get_current_user")
  if (result.user) {
    AppState.user = result.user
    await updateCartState()
  }
}

// ============================================================================
// GESTION DU PANIER
// ============================================================================

/**
 * Met à jour l'état du panier
 */
async function updateCartState() {
  if (!AppState.user) return

  const result = await apiCall("get_cart")
  if (result.success) {
    AppState.cart = result.cart
    AppState.cartCount = result.count
    updateCartBadge()
  }
}

/**
 * Met à jour le badge du panier
 */
function updateCartBadge() {
  const badge = document.querySelector(".cart-badge")
  if (badge) {
    badge.textContent = AppState.cartCount
    badge.style.display = AppState.cartCount > 0 ? "flex" : "none"
  }
}

/**
 * Ajoute un produit au panier
 * @param {string} productId - ID du produit
 * @param {number} quantity - Quantité
 */
async function addToCart(productId, quantity = 1) {
  if (!AppState.user) {
    showToast("Veuillez vous connecter", "warning")
    navigateTo("login")
    return
  }

  const result = await apiCall("add_to_cart", productId, quantity)

  if (result.success) {
    showToast("Produit ajouté au panier", "success")
    await updateCartState()
  } else {
    showToast(result.message, "error")
  }
}

/**
 * Met à jour la quantité d'un produit dans le panier
 * @param {string} productId - ID du produit
 * @param {number} quantity - Nouvelle quantité
 */
async function updateCartQuantity(productId, quantity) {
  const result = await apiCall("update_cart_quantity", productId, quantity)

  if (result.success) {
    await updateCartState()
    if (AppState.isCartOpen) {
      renderCartPanel()
    }
  } else {
    showToast(result.message, "error")
  }
}

/**
 * Supprime un produit du panier
 * @param {string} productId - ID du produit
 */
async function removeFromCart(productId) {
  const result = await apiCall("remove_from_cart", productId)

  if (result.success) {
    showToast("Produit retiré du panier", "success")
    await updateCartState()
    if (AppState.isCartOpen) {
      renderCartPanel()
    }
  } else {
    showToast(result.message, "error")
  }
}

/**
 * Ouvre/ferme le panneau du panier
 */
function toggleCart() {
  AppState.isCartOpen = !AppState.isCartOpen

  const panel = document.querySelector(".cart-panel")
  const overlay = document.querySelector(".cart-overlay")

  if (panel) panel.classList.toggle("open", AppState.isCartOpen)
  if (overlay) overlay.classList.toggle("show", AppState.isCartOpen)

  if (AppState.isCartOpen) {
    renderCartPanel()
  }
}

/**
 * Rend le contenu du panneau panier
 */
async function renderCartPanel() {
  await updateCartState()

  const cartItems = document.querySelector(".cart-items")
  const cartTotal = document.querySelector(".cart-total-value")

  if (!cartItems) return

  if (AppState.cart.length === 0) {
    cartItems.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <p>Votre panier est vide</p>
                <button class="btn btn-primary mt-lg" onclick="toggleCart(); navigateTo('shop');">
                    Découvrir nos produits
                </button>
            </div>
        `
  } else {
    cartItems.innerHTML = AppState.cart
      .map(
        (item) => `
            <div class="cart-item">
                <img src="${item.product.image_url}" alt="${item.product.name}" class="cart-item-image"
                     onerror="this.src='https://via.placeholder.com/80x80?text=Image'">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.product.name}</div>
                    <div class="cart-item-price">${formatPrice(item.product.price)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateCartQuantity('${item.product_id}', ${item.quantity - 1})">−</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateCartQuantity('${item.product_id}', ${item.quantity + 1})">+</button>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart('${item.product_id}')">
                        Supprimer
                    </button>
                </div>
            </div>
        `,
      )
      .join("")
  }

  const total = AppState.cart.reduce((sum, item) => sum + Number.parseFloat(item.product.price) * item.quantity, 0)

  if (cartTotal) {
    cartTotal.textContent = formatPrice(total)
  }
}

// ============================================================================
// GESTION DES COMMANDES
// ============================================================================

/**
 * Affiche la modal de checkout
 */
function showCheckoutModal() {
  if (AppState.cart.length === 0) {
    showToast("Votre panier est vide", "warning")
    return
  }

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

  toggleCart()
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

/**
 * Crée une commande à partir du panier
 * @param {string} address - Adresse de livraison
 */
async function createOrder(address) {
  if (!address.trim()) {
    showToast("Veuillez entrer une adresse de livraison", "warning")
    return
  }

  const result = await apiCall("create_order", address)

  if (result.success) {
    showToast("Commande créée avec succès !", "success")
    AppState.cart = []
    AppState.cartCount = 0
    updateCartBadge()
    navigateTo("client-dashboard", { section: "orders" })
  } else {
    showToast(result.message, "error")
  }
}

// ============================================================================
// RECHERCHE ET FILTRES
// ============================================================================

/**
 * Recherche des produits
 * @param {string} query - Terme de recherche
 */
async function searchProducts(query) {
  AppState.searchQuery = query
  const result = await apiCall("get_products", null, query)

  if (result.success) {
    AppState.products = result.products
    renderProductsGrid()
  }
}

/**
 * Filtre par catégorie
 * @param {string} category - Catégorie sélectionnée
 */
async function filterByCategory(category) {
  AppState.selectedCategory = category

  let result
  if (category) {
    result = await apiCall("get_products", category, null)
  } else {
    result = await apiCall("get_products", null, null)
  }

  if (result.success) {
    AppState.products = result.products
    renderProductsGrid()
  }

  document.querySelectorAll(".filter-option").forEach((el) => {
    el.classList.toggle("active", el.dataset.category === (category || ""))
  })
}

/**
 * Rend la grille de produits
 */
function renderProductsGrid() {
  const grid = document.querySelector(".products-grid")
  if (!grid) return

  if (AppState.products.length === 0) {
    grid.innerHTML = `
            <div class="text-center" style="grid-column: 1/-1; padding: 3rem;">
                <p class="text-muted">Aucun produit trouvé</p>
            </div>
        `
    return
  }

  grid.innerHTML = AppState.products
    .map(
      (product) => `
        <div class="card product-card" onclick="navigateTo('product', {id: '${product.id}'})">
            ${Number.parseInt(product.stock) < 5 && Number.parseInt(product.stock) > 0 ? '<span class="product-badge">Stock limité</span>' : ""}
            ${Number.parseInt(product.stock) === 0 ? '<span class="product-badge" style="background: var(--color-error)">Rupture</span>' : ""}
            <img src="${product.image_url}" alt="${product.name}" class="card-image"
                 onerror="this.src='https://via.placeholder.com/400x200?text=Image'">
            <div class="card-body">
                <h3 class="card-title">${product.name}</h3>
                <p class="card-description">${product.description}</p>
                <div class="flex-between">
                    <span class="card-price">${formatPrice(product.price)}</span>
                    <span class="product-stock ${Number.parseInt(product.stock) < 5 ? "low" : ""} ${Number.parseInt(product.stock) === 0 ? "out" : ""}">
                        ${Number.parseInt(product.stock) > 0 ? `${product.stock} en stock` : "Rupture de stock"}
                    </span>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-accent w-full" onclick="event.stopPropagation(); addToCart('${product.id}')" 
                        ${Number.parseInt(product.stock) === 0 ? "disabled" : ""}>
                    ${Number.parseInt(product.stock) > 0 ? "Ajouter au panier" : "Indisponible"}
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

// ============================================================================
// MODALES ET UI
// ============================================================================

/**
 * Ouvre une modale
 * @param {string} modalId - ID de la modale
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) modal.classList.add("show")
}

/**
 * Ferme une modale
 * @param {string} modalId - ID de la modale
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) modal.classList.remove("show")
}

/**
 * Toggle le menu utilisateur
 */
function toggleUserMenu() {
  const dropdown = document.getElementById("user-dropdown")
  if (dropdown) dropdown.classList.toggle("show")
}

// Ferme le menu utilisateur si on clique ailleurs
document.addEventListener("click", (event) => {
  const userMenu = document.querySelector(".user-menu")
  const dropdown = document.getElementById("user-dropdown")

  if (userMenu && dropdown && !userMenu.contains(event.target)) {
    dropdown.classList.remove("show")
  }
})

// ============================================================================
// INITIALISATION
// ============================================================================

/**
 * Initialise l'application
 */
async function initApp() {
  console.log("Initialisation de ShopPro...")

  await waitForApi()
  console.log("API pywebview disponible")

  await checkCurrentUser()

  const catResult = await apiCall("get_categories")
  if (catResult.success) {
    AppState.categories = catResult.categories
  }

  navigateTo("landing")

  console.log("ShopPro initialisé avec succès")
}

document.addEventListener("DOMContentLoaded", initApp)

// Declaration of missing functions
function renderLandingPage() {
  return `<div>Landing Page Content</div>`
}

function renderAuthPage(pageType) {
  return `<div>Auth Page Content (${pageType})</div>`
}

async function renderShopPage() {
  return `<div>Shop Page Content</div>`
}

async function renderProductPage(productId) {
  return `<div>Product Page Content (${productId})</div>`
}

async function renderClientDashboard(section) {
  return `<div>Client Dashboard Content (${section})</div>`
}

async function renderSellerDashboard(section) {
  return `<div>Seller Dashboard Content (${section})</div>`
}

async function renderAdminDashboard(section) {
  return `<div>Admin Dashboard Content (${section})</div>`
}
