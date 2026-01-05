/**
 * =============================================================================
 * ESPACE CLIENT
 * =============================================================================
 * Gère l'affichage du catalogue, les détails produit et les commandes client.
 * =============================================================================
 */

// Declare variables
let apiCall
let AppState
let renderHeader
let formatPrice
let renderFooter
let addToCart
let getRoleLabel
let formatDate
let getStatusLabel

/**
 * Rend la page boutique avec le catalogue de produits
 * @returns {Promise<string>} HTML de la page
 */
async function renderShopPage() {
  // Charge les produits et catégories
  const [productsResult, categoriesResult] = await Promise.all([apiCall("get_products"), apiCall("get_categories")])

  if (productsResult.success) {
    AppState.products = productsResult.products
  }
  if (categoriesResult.success) {
    AppState.categories = categoriesResult.categories
  }

  return `
        <div class="page">
            ${renderHeader()}
            
            <main style="flex: 1; display: flex; max-width: 1400px; margin: 0 auto; padding: var(--spacing-lg); gap: var(--spacing-xl); width: 100%;">
                <!-- Sidebar Filtres -->
                <aside class="sidebar">
                    <h3 class="sidebar-title">Filtres</h3>
                    
                    <div class="filter-group">
                        <span class="filter-label">Catégories</span>
                        <div class="filter-options">
                            <div class="filter-option ${!AppState.selectedCategory ? "active" : ""}" 
                                 data-category="" onclick="filterByCategory(null)">
                                Toutes les catégories
                            </div>
                            ${AppState.categories
                              .map(
                                (cat) => `
                                <div class="filter-option ${AppState.selectedCategory === cat ? "active" : ""}" 
                                     data-category="${cat}" onclick="filterByCategory('${cat}')">
                                    ${cat}
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                </aside>
                
                <!-- Contenu principal -->
                <div style="flex: 1;">
                    <!-- Barre de recherche et tri -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                        <div>
                            <h1 style="font-size: var(--font-size-2xl); font-weight: 700;">
                                ${AppState.selectedCategory || "Tous les produits"}
                            </h1>
                            <p style="color: var(--color-gray-500);">
                                ${AppState.products.length} produit(s) trouvé(s)
                            </p>
                        </div>
                        
                        <div class="search-bar" style="width: 300px;">
                            <input type="text" placeholder="Rechercher..." 
                                   value="${AppState.searchQuery}"
                                   onkeypress="if(event.key === 'Enter') searchProducts(this.value)">
                            <button onclick="searchProducts(this.previousElementSibling.value)">🔍</button>
                        </div>
                    </div>
                    
                    <!-- Grille de produits -->
                    <div class="products-grid">
                        ${
                          AppState.products.length > 0
                            ? AppState.products
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
                                            ${Number.parseInt(product.stock) > 0 ? product.stock + " en stock" : "Rupture"}
                                        </span>
                                    </div>
                                </div>
                                <div class="card-footer">
                                    <button class="btn btn-accent w-full" 
                                            onclick="event.stopPropagation(); addToCart('${product.id}')"
                                            ${Number.parseInt(product.stock) === 0 ? "disabled" : ""}>
                                        ${Number.parseInt(product.stock) > 0 ? "🛒 Ajouter au panier" : "Indisponible"}
                                    </button>
                                </div>
                            </div>
                        `,
                                )
                                .join("")
                            : `
                            <div style="grid-column: 1/-1; text-align: center; padding: var(--spacing-3xl);">
                                <p style="color: var(--color-gray-400); font-size: var(--font-size-lg);">
                                    Aucun produit trouvé
                                </p>
                            </div>
                        `
                        }
                    </div>
                </div>
            </main>
            
            ${renderFooter()}
        </div>
    `
}

/**
 * Rend la page de détail d'un produit
 * @param {string} productId - ID du produit
 * @returns {Promise<string>} HTML de la page
 */
async function renderProductPage(productId) {
  const result = await apiCall("get_product", productId)

  if (!result.success) {
    return `
            <div class="page">
                ${renderHeader()}
                <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
                    <div class="text-center">
                        <h1>Produit non trouvé</h1>
                        <button class="btn btn-primary mt-lg" onclick="navigateTo('shop')">
                            Retour à la boutique
                        </button>
                    </div>
                </div>
                ${renderFooter()}
            </div>
        `
  }

  const product = result.product
  const inStock = Number.parseInt(product.stock) > 0

  return `
        <div class="page">
            ${renderHeader()}
            
            <main style="flex: 1; max-width: 1200px; margin: 0 auto; padding: var(--spacing-xl);">
                <!-- Breadcrumb -->
                <nav style="margin-bottom: var(--spacing-xl);">
                    <a href="#" onclick="event.preventDefault(); navigateTo('shop')" style="color: var(--color-gray-500);">
                        Boutique
                    </a>
                    <span style="margin: 0 var(--spacing-sm); color: var(--color-gray-400);">/</span>
                    <a href="#" onclick="event.preventDefault(); filterByCategory('${product.category}'); navigateTo('shop');" 
                       style="color: var(--color-gray-500);">
                        ${product.category}
                    </a>
                    <span style="margin: 0 var(--spacing-sm); color: var(--color-gray-400);">/</span>
                    <span style="color: var(--color-gray-700);">${product.name}</span>
                </nav>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-3xl);">
                    <!-- Image -->
                    <div>
                        <div class="card" style="overflow: hidden;">
                            <img src="${product.image_url}" alt="${product.name}" 
                                 style="width: 100%; height: 400px; object-fit: cover;"
                                 onerror="this.src='https://via.placeholder.com/600x400?text=Image'">
                        </div>
                    </div>
                    
                    <!-- Informations -->
                    <div>
                        <span class="badge badge-primary mb-md">${product.category}</span>
                        <h1 style="font-size: var(--font-size-3xl); font-weight: 700; margin-bottom: var(--spacing-md);">
                            ${product.name}
                        </h1>
                        
                        <p style="color: var(--color-gray-600); line-height: 1.8; margin-bottom: var(--spacing-xl);">
                            ${product.description}
                        </p>
                        
                        <div style="font-size: var(--font-size-3xl); font-weight: 700; color: var(--color-primary); margin-bottom: var(--spacing-lg);">
                            ${formatPrice(product.price)}
                        </div>
                        
                        <!-- Stock -->
                        <div style="display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-xl);">
                            <span style="width: 12px; height: 12px; border-radius: 50%; background: ${inStock ? "var(--color-success)" : "var(--color-error)"}"></span>
                            <span style="color: ${inStock ? "var(--color-success)" : "var(--color-error)"};">
                                ${inStock ? `${product.stock} en stock` : "Rupture de stock"}
                            </span>
                        </div>
                        
                        <!-- Quantité et ajout panier -->
                        <div style="display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-xl);">
                            <div style="display: flex; align-items: center; border: 2px solid var(--color-gray-200); border-radius: var(--border-radius-md);">
                                <button class="btn btn-ghost" onclick="updateProductQuantity(-1)" style="padding: var(--spacing-md);">−</button>
                                <input type="number" id="product-quantity" value="1" min="1" max="${product.stock}" 
                                       style="width: 60px; text-align: center; border: none; font-weight: 600;"
                                       onchange="validateQuantity(this, ${product.stock})">
                                <button class="btn btn-ghost" onclick="updateProductQuantity(1)" style="padding: var(--spacing-md);">+</button>
                            </div>
                            
                            <button class="btn btn-accent btn-lg" style="flex: 1;" 
                                    onclick="addToCartWithQuantity('${product.id}')"
                                    ${!inStock ? "disabled" : ""}>
                                ${inStock ? "🛒 Ajouter au panier" : "Indisponible"}
                            </button>
                        </div>
                        
                        <!-- Infos supplémentaires -->
                        <div class="card" style="padding: var(--spacing-lg);">
                            <div style="display: flex; gap: var(--spacing-xl);">
                                <div style="text-align: center;">
                                    <div style="font-size: 24px; margin-bottom: var(--spacing-xs);">🚚</div>
                                    <div style="font-size: var(--font-size-sm); color: var(--color-gray-600);">Livraison rapide</div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-size: 24px; margin-bottom: var(--spacing-xs);">🔒</div>
                                    <div style="font-size: var(--font-size-sm); color: var(--color-gray-600);">Paiement sécurisé</div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-size: 24px; margin-bottom: var(--spacing-xs);">↩️</div>
                                    <div style="font-size: var(--font-size-sm); color: var(--color-gray-600);">Retour 30 jours</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            ${renderFooter()}
        </div>
    `
}

/**
 * Met à jour la quantité sur la page produit
 * @param {number} delta - Modification (+1 ou -1)
 */
function updateProductQuantity(delta) {
  const input = document.getElementById("product-quantity")
  const newValue = Number.parseInt(input.value) + delta
  const max = Number.parseInt(input.max)

  if (newValue >= 1 && newValue <= max) {
    input.value = newValue
  }
}

/**
 * Valide la quantité entrée
 * @param {HTMLInputElement} input - Champ de saisie
 * @param {number} max - Maximum autorisé
 */
function validateQuantity(input, max) {
  let value = Number.parseInt(input.value)
  if (isNaN(value) || value < 1) value = 1
  if (value > max) value = max
  input.value = value
}

/**
 * Ajoute au panier avec la quantité spécifiée
 * @param {string} productId - ID du produit
 */
async function addToCartWithQuantity(productId) {
  const quantity = Number.parseInt(document.getElementById("product-quantity").value)
  await addToCart(productId, quantity)
}

/**
 * Rend le dashboard client
 * @param {string} section - Section active (orders, profile)
 * @returns {Promise<string>} HTML de la page
 */
async function renderClientDashboard(section = "orders") {
  return `
        <div class="page">
            ${renderHeader()}
            
            <div class="dashboard">
                <!-- Sidebar -->
                <aside class="dashboard-sidebar">
                    <div style="margin-bottom: var(--spacing-xl);">
                        <div class="user-avatar" style="width: 64px; height: 64px; font-size: var(--font-size-xl); margin-bottom: var(--spacing-md);">
                            ${AppState.user.firstname[0]}${AppState.user.lastname[0]}
                        </div>
                        <h3 style="color: white;">${AppState.user.firstname} ${AppState.user.lastname}</h3>
                        <p style="color: var(--color-gray-400); font-size: var(--font-size-sm);">${AppState.user.email}</p>
                        <span class="badge badge-primary mt-sm">${getRoleLabel(AppState.user.role)}</span>
                    </div>
                    
                    <nav class="dashboard-nav">
                        <a href="#" class="dashboard-nav-item ${section === "orders" ? "active" : ""}"
                           onclick="event.preventDefault(); navigateTo('client-dashboard', {section: 'orders'})">
                            📦 Mes commandes
                        </a>
                        <a href="#" class="dashboard-nav-item ${section === "profile" ? "active" : ""}"
                           onclick="event.preventDefault(); navigateTo('client-dashboard', {section: 'profile'})">
                            👤 Mon profil
                        </a>
                        <a href="#" class="dashboard-nav-item" onclick="event.preventDefault(); navigateTo('shop')">
                            🛍️ Boutique
                        </a>
                        <div style="margin-top: auto; padding-top: var(--spacing-xl);">
                            <a href="#" class="dashboard-nav-item" style="color: var(--color-error);"
                               onclick="event.preventDefault(); logout()">
                                🚪 Déconnexion
                            </a>
                        </div>
                    </nav>
                </aside>
                
                <!-- Contenu principal -->
                <main class="dashboard-main">
                    ${section === "orders" ? await renderClientOrders() : ""}
                    ${section === "profile" ? renderClientProfile() : ""}
                </main>
            </div>
        </div>
    `
}

/**
 * Rend la liste des commandes du client
 * @returns {Promise<string>} HTML de la section
 */
async function renderClientOrders() {
  const result = await apiCall("get_my_orders")
  const orders = result.orders || []

  return `
        <div class="dashboard-header">
            <h1 class="dashboard-title">Mes commandes</h1>
        </div>
        
        ${
          orders.length === 0
            ? `
            <div class="card" style="text-align: center; padding: var(--spacing-3xl);">
                <div style="font-size: 64px; margin-bottom: var(--spacing-lg);">📦</div>
                <h3 style="margin-bottom: var(--spacing-md);">Aucune commande</h3>
                <p style="color: var(--color-gray-500); margin-bottom: var(--spacing-lg);">
                    Vous n'avez pas encore passé de commande.
                </p>
                <button class="btn btn-primary" onclick="navigateTo('shop')">
                    Découvrir nos produits
                </button>
            </div>
        `
            : `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>N° Commande</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Statut</th>
                            <th>Adresse</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders
                          .map(
                            (order) => `
                            <tr>
                                <td><strong>#${order.id}</strong></td>
                                <td>${formatDate(order.created_at)}</td>
                                <td><strong>${formatPrice(order.total)}</strong></td>
                                <td>
                                    <span class="badge status-${order.status}">
                                        ${getStatusLabel(order.status)}
                                    </span>
                                </td>
                                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    ${order.shipping_address}
                                </td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        `
        }
    `
}

/**
 * Rend le profil du client
 * @returns {string} HTML de la section
 */
function renderClientProfile() {
  return `
        <div class="dashboard-header">
            <h1 class="dashboard-title">Mon profil</h1>
        </div>
        
        <div class="card" style="max-width: 600px; padding: var(--spacing-xl);">
            <div style="display: flex; align-items: center; gap: var(--spacing-lg); margin-bottom: var(--spacing-xl);">
                <div class="user-avatar" style="width: 80px; height: 80px; font-size: var(--font-size-2xl);">
                    ${AppState.user.firstname[0]}${AppState.user.lastname[0]}
                </div>
                <div>
                    <h2>${AppState.user.firstname} ${AppState.user.lastname}</h2>
                    <p style="color: var(--color-gray-500);">${AppState.user.email}</p>
                </div>
            </div>
            
            <div style="display: grid; gap: var(--spacing-md);">
                <div style="padding: var(--spacing-md); background: var(--color-gray-50); border-radius: var(--border-radius-md);">
                    <span style="color: var(--color-gray-500); font-size: var(--font-size-sm);">Type de compte</span>
                    <p style="font-weight: 500;">${getRoleLabel(AppState.user.role)}</p>
                </div>
                <div style="padding: var(--spacing-md); background: var(--color-gray-50); border-radius: var(--border-radius-md);">
                    <span style="color: var(--color-gray-500); font-size: var(--font-size-sm);">Membre depuis</span>
                    <p style="font-weight: 500;">${formatDate(AppState.user.created_at)}</p>
                </div>
                <div style="padding: var(--spacing-md); background: var(--color-gray-50); border-radius: var(--border-radius-md);">
                    <span style="color: var(--color-gray-500); font-size: var(--font-size-sm);">Dernière connexion</span>
                    <p style="font-weight: 500;">${formatDate(AppState.user.last_login)}</p>
                </div>
            </div>
        </div>
    `
}
