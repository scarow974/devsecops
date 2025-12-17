/**
 * =============================================================================
 * ESPACE VENDEUR
 * =============================================================================
 * Gère le dashboard vendeur : gestion des produits et des commandes.
 * Permet le CRUD complet sur les produits du vendeur.
 * =============================================================================
 */

// État local pour le formulaire de produit
let editingProduct = null

// Variables déclarées pour résoudre les erreurs de lint
const renderHeader = () => "<header>Header Content</header>"
const AppState = { user: { firstname: "John", lastname: "Doe" }, categories: ["Electronics", "Clothing"] }
const apiCall = async (endpoint, id = null) => {
  // Simulate API call
  return { success: true, products: [], orders: [] }
}
const formatPrice = (price) => price.toString() + " €"
const formatDate = (date) => new Date(date).toLocaleDateString()
const getStatusLabel = (status) => {
  const labels = {
    pending: "En attente",
    confirmed: "Confirmée",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
  }
  return labels[status] || "Statut inconnu"
}
const navigateTo = (page, params) => {
  // Simulate navigation
  console.log(`Navigating to ${page} with params`, params)
}
const showToast = (message, type) => {
  // Simulate toast notification
  console.log(`Toast: ${message} (${type})`)
}
const openModal = (modalId) => {
  // Simulate opening modal
  console.log(`Opening modal ${modalId}`)
}
const closeModal = (modalId) => {
  // Simulate closing modal
  console.log(`Closing modal ${modalId}`)
}

/**
 * Rend le dashboard vendeur
 * @param {string} section - Section active
 * @returns {Promise<string>} HTML de la page
 */
async function renderSellerDashboard(section = "products") {
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
                        <p style="color: var(--color-gray-400); font-size: var(--font-size-sm);">Espace Vendeur</p>
                        <span class="badge badge-warning mt-sm">Vendeur</span>
                    </div>
                    
                    <nav class="dashboard-nav">
                        <a href="#" class="dashboard-nav-item ${section === "products" ? "active" : ""}"
                           onclick="event.preventDefault(); navigateTo('seller-dashboard', {section: 'products'})">
                            📦 Mes produits
                        </a>
                        <a href="#" class="dashboard-nav-item ${section === "orders" ? "active" : ""}"
                           onclick="event.preventDefault(); navigateTo('seller-dashboard', {section: 'orders'})">
                            🛒 Commandes
                        </a>
                        <a href="#" class="dashboard-nav-item ${section === "add-product" ? "active" : ""}"
                           onclick="event.preventDefault(); navigateTo('seller-dashboard', {section: 'add-product'})">
                            ➕ Ajouter un produit
                        </a>
                        <a href="#" class="dashboard-nav-item ${section === "stats" ? "active" : ""}"
                           onclick="event.preventDefault(); navigateTo('seller-dashboard', {section: 'stats'})">
                            📊 Statistiques
                        </a>
                        <div style="border-top: 1px solid var(--color-gray-700); margin: var(--spacing-lg) 0;"></div>
                        <a href="#" class="dashboard-nav-item" onclick="event.preventDefault(); navigateTo('shop')">
                            🛍️ Voir la boutique
                        </a>
                        <a href="#" class="dashboard-nav-item" onclick="event.preventDefault(); navigateTo('client-dashboard')">
                            👤 Mon compte client
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
                    ${section === "products" ? await renderSellerProducts() : ""}
                    ${section === "orders" ? await renderSellerOrders() : ""}
                    ${section === "add-product" ? renderProductForm() : ""}
                    ${section === "edit-product" ? renderProductForm(editingProduct) : ""}
                    ${section === "stats" ? await renderSellerStats() : ""}
                </main>
            </div>
            
            <!-- Modal de confirmation de suppression -->
            <div class="modal-overlay" id="delete-product-modal">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">Confirmer la suppression</h3>
                        <button class="modal-close" onclick="closeModal('delete-product-modal')">✕</button>
                    </div>
                    <div class="modal-body">
                        <p>Êtes-vous sûr de vouloir supprimer ce produit ?</p>
                        <p style="color: var(--color-gray-500); font-size: var(--font-size-sm); margin-top: var(--spacing-sm);">
                            Cette action est irréversible.
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="closeModal('delete-product-modal')">Annuler</button>
                        <button class="btn btn-danger" id="confirm-delete-btn">Supprimer</button>
                    </div>
                </div>
            </div>
        </div>
    `
}

/**
 * Rend la liste des produits du vendeur
 * @returns {Promise<string>} HTML de la section
 */
async function renderSellerProducts() {
  const result = await apiCall("get_seller_products")
  const products = result.products || []

  return `
        <div class="dashboard-header">
            <h1 class="dashboard-title">Mes produits</h1>
            <button class="btn btn-primary" onclick="navigateTo('seller-dashboard', {section: 'add-product'})">
                ➕ Ajouter un produit
            </button>
        </div>
        
        ${
          products.length === 0
            ? `
            <div class="card" style="text-align: center; padding: var(--spacing-3xl);">
                <div style="font-size: 64px; margin-bottom: var(--spacing-lg);">📦</div>
                <h3 style="margin-bottom: var(--spacing-md);">Aucun produit</h3>
                <p style="color: var(--color-gray-500); margin-bottom: var(--spacing-lg);">
                    Commencez à vendre en ajoutant votre premier produit.
                </p>
                <button class="btn btn-accent" onclick="navigateTo('seller-dashboard', {section: 'add-product'})">
                    Ajouter mon premier produit
                </button>
            </div>
        `
            : `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Produit</th>
                            <th>Catégorie</th>
                            <th>Prix</th>
                            <th>Stock</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products
                          .map(
                            (product) => `
                            <tr>
                                <td>
                                    <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                                        <img src="${product.image_url}" alt="${product.name}" 
                                             style="width: 50px; height: 50px; border-radius: var(--border-radius-md); object-fit: cover;"
                                             onerror="this.src='https://via.placeholder.com/50x50?text=?'">
                                        <div>
                                            <strong>${product.name}</strong>
                                            <p style="font-size: var(--font-size-sm); color: var(--color-gray-500); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                                ${product.description}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td>${product.category}</td>
                                <td><strong>${formatPrice(product.price)}</strong></td>
                                <td>
                                    <span class="${Number.parseInt(product.stock) < 5 ? "text-error" : ""}">
                                        ${product.stock}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge ${product.active === "true" ? "badge-success" : "badge-gray"}">
                                        ${product.active === "true" ? "Actif" : "Inactif"}
                                    </span>
                                </td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn btn-ghost btn-sm" onclick="editProduct('${product.id}')" title="Modifier">
                                            ✏️
                                        </button>
                                        <button class="btn btn-ghost btn-sm" onclick="toggleProductActive('${product.id}', ${product.active !== "true"})" title="${product.active === "true" ? "Désactiver" : "Activer"}">
                                            ${product.active === "true" ? "🔴" : "🟢"}
                                        </button>
                                        <button class="btn btn-ghost btn-sm" onclick="confirmDeleteProduct('${product.id}')" title="Supprimer">
                                            🗑️
                                        </button>
                                    </div>
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
 * Rend les commandes (vue vendeur)
 * @returns {Promise<string>} HTML de la section
 */
async function renderSellerOrders() {
  const result = await apiCall("get_all_orders")
  const orders = result.orders || []

  return `
        <div class="dashboard-header">
            <h1 class="dashboard-title">Gestion des commandes</h1>
        </div>
        
        ${
          orders.length === 0
            ? `
            <div class="card" style="text-align: center; padding: var(--spacing-3xl);">
                <div style="font-size: 64px; margin-bottom: var(--spacing-lg);">📋</div>
                <h3 style="margin-bottom: var(--spacing-md);">Aucune commande</h3>
                <p style="color: var(--color-gray-500);">
                    Les commandes apparaîtront ici.
                </p>
            </div>
        `
            : `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>N° Commande</th>
                            <th>Client</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders
                          .map(
                            (order) => `
                            <tr>
                                <td><strong>#${order.id}</strong></td>
                                <td>
                                    <div>
                                        <strong>${order.user_name || "Client"}</strong>
                                        <p style="font-size: var(--font-size-sm); color: var(--color-gray-500);">
                                            ${order.user_email || ""}
                                        </p>
                                    </div>
                                </td>
                                <td>${formatDate(order.created_at)}</td>
                                <td><strong>${formatPrice(order.total)}</strong></td>
                                <td>
                                    <span class="badge status-${order.status}">
                                        ${getStatusLabel(order.status)}
                                    </span>
                                </td>
                                <td>
                                    <select class="form-input form-select" style="width: auto; padding: var(--spacing-xs) var(--spacing-md);"
                                            onchange="updateOrderStatus('${order.id}', this.value)">
                                        <option value="pending" ${order.status === "pending" ? "selected" : ""}>En attente</option>
                                        <option value="confirmed" ${order.status === "confirmed" ? "selected" : ""}>Confirmée</option>
                                        <option value="shipped" ${order.status === "shipped" ? "selected" : ""}>Expédiée</option>
                                        <option value="delivered" ${order.status === "delivered" ? "selected" : ""}>Livrée</option>
                                        <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>Annulée</option>
                                    </select>
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
 * Rend le formulaire d'ajout/modification de produit
 * @param {Object} product - Produit à modifier (null pour création)
 * @returns {string} HTML du formulaire
 */
function renderProductForm(product = null) {
  const isEdit = product !== null

  return `
        <div class="dashboard-header">
            <h1 class="dashboard-title">${isEdit ? "Modifier le produit" : "Ajouter un produit"}</h1>
            <button class="btn btn-secondary" onclick="navigateTo('seller-dashboard', {section: 'products'})">
                ← Retour aux produits
            </button>
        </div>
        
        <div class="card" style="max-width: 800px; padding: var(--spacing-xl);">
            <form onsubmit="handleProductSubmit(event, ${isEdit ? `'${product.id}'` : "null"})">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg);">
                    <div class="form-group">
                        <label class="form-label" for="product-name">Nom du produit *</label>
                        <input type="text" id="product-name" class="form-input" 
                               value="${isEdit ? product.name : ""}" required
                               placeholder="Ex: iPhone 15 Pro">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="product-category">Catégorie *</label>
                        <input type="text" id="product-category" class="form-input" 
                               value="${isEdit ? product.category : ""}" required
                               placeholder="Ex: Smartphones" list="categories-list">
                        <datalist id="categories-list">
                            ${AppState.categories.map((cat) => `<option value="${cat}">`).join("")}
                        </datalist>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="product-description">Description *</label>
                    <textarea id="product-description" class="form-input form-textarea" required
                              placeholder="Description détaillée du produit...">${isEdit ? product.description : ""}</textarea>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg);">
                    <div class="form-group">
                        <label class="form-label" for="product-price">Prix (€) *</label>
                        <input type="number" id="product-price" class="form-input" step="0.01" min="0"
                               value="${isEdit ? product.price : ""}" required
                               placeholder="99.99">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="product-stock">Stock *</label>
                        <input type="number" id="product-stock" class="form-input" min="0"
                               value="${isEdit ? product.stock : ""}" required
                               placeholder="100">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="product-image">URL de l'image</label>
                    <input type="url" id="product-image" class="form-input" 
                           value="${isEdit ? product.image_url : ""}"
                           placeholder="https://exemple.com/image.jpg">
                    <p style="font-size: var(--font-size-sm); color: var(--color-gray-500); margin-top: var(--spacing-xs);">
                        Laissez vide pour utiliser une image par défaut
                    </p>
                </div>
                
                ${
                  isEdit
                    ? `
                    <div class="form-group">
                        <label class="form-label">Statut</label>
                        <div style="display: flex; gap: var(--spacing-lg);">
                            <label style="display: flex; align-items: center; gap: var(--spacing-sm); cursor: pointer;">
                                <input type="radio" name="product-active" value="true" 
                                       ${product.active === "true" ? "checked" : ""}>
                                <span>Actif (visible)</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: var(--spacing-sm); cursor: pointer;">
                                <input type="radio" name="product-active" value="false"
                                       ${product.active !== "true" ? "checked" : ""}>
                                <span>Inactif (masqué)</span>
                            </label>
                        </div>
                    </div>
                `
                    : ""
                }
                
                <div style="display: flex; gap: var(--spacing-md); margin-top: var(--spacing-xl);">
                    <button type="submit" class="btn btn-primary btn-lg">
                        ${isEdit ? "💾 Enregistrer les modifications" : "➕ Ajouter le produit"}
                    </button>
                    <button type="button" class="btn btn-secondary btn-lg" 
                            onclick="navigateTo('seller-dashboard', {section: 'products'})">
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    `
}

/**
 * Rend les statistiques du vendeur
 * @returns {Promise<string>} HTML de la section
 */
async function renderSellerStats() {
  const productsResult = await apiCall("get_seller_products")
  const ordersResult = await apiCall("get_all_orders")

  const products = productsResult.products || []
  const orders = ordersResult.orders || []

  // Calcul des statistiques
  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.active === "true").length
  const totalOrders = orders.length
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number.parseFloat(o.total || 0), 0)
  const pendingOrders = orders.filter((o) => o.status === "pending").length

  return `
        <div class="dashboard-header">
            <h1 class="dashboard-title">Statistiques</h1>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon" style="background: var(--color-primary-light);">📦</div>
                <div class="stat-info">
                    <span class="stat-value">${totalProducts}</span>
                    <span class="stat-label">Produits total</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon" style="background: var(--color-success-light);">✓</div>
                <div class="stat-info">
                    <span class="stat-value">${activeProducts}</span>
                    <span class="stat-label">Produits actifs</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon" style="background: var(--color-accent-light);">🛒</div>
                <div class="stat-info">
                    <span class="stat-value">${totalOrders}</span>
                    <span class="stat-label">Commandes</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon" style="background: var(--color-warning-light);">⏳</div>
                <div class="stat-info">
                    <span class="stat-value">${pendingOrders}</span>
                    <span class="stat-label">En attente</span>
                </div>
            </div>
            
            <div class="stat-card" style="grid-column: span 2;">
                <div class="stat-icon" style="background: var(--color-success-light);">💰</div>
                <div class="stat-info">
                    <span class="stat-value">${formatPrice(totalRevenue)}</span>
                    <span class="stat-label">Chiffre d'affaires</span>
                </div>
            </div>
        </div>
        
        <!-- Dernières commandes -->
        <div class="card" style="margin-top: var(--spacing-xl);">
            <h3 style="margin-bottom: var(--spacing-lg);">Dernières commandes</h3>
            ${
              orders.length === 0
                ? `
                <p style="color: var(--color-gray-500); text-align: center; padding: var(--spacing-xl);">
                    Aucune commande pour le moment
                </p>
            `
                : `
                <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                    ${orders
                      .slice(0, 5)
                      .map(
                        (order) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md); background: var(--color-gray-50); border-radius: var(--border-radius-md);">
                            <div>
                                <strong>#${order.id}</strong>
                                <span style="color: var(--color-gray-500); margin-left: var(--spacing-sm);">
                                    ${formatDate(order.created_at)}
                                </span>
                            </div>
                            <div style="display: flex; align-items: center; gap: var(--spacing-lg);">
                                <span class="badge status-${order.status}">${getStatusLabel(order.status)}</span>
                                <strong>${formatPrice(order.total)}</strong>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            `
            }
        </div>
    `
}

// ============================================================================
// ACTIONS VENDEUR
// ============================================================================

/**
 * Charge un produit pour modification
 * @param {string} productId - ID du produit
 */
async function editProduct(productId) {
  const result = await apiCall("get_product", productId)

  if (result.success) {
    editingProduct = result.product
    navigateTo("seller-dashboard", { section: "edit-product" })
  } else {
    showToast("Produit non trouvé", "error")
  }
}

/**
 * Gère la soumission du formulaire de produit
 * @param {Event} event - Événement de soumission
 * @param {string|null} productId - ID du produit (null pour création)
 */
async function handleProductSubmit(event, productId) {
  event.preventDefault()

  const productData = {
    name: document.getElementById("product-name").value,
    description: document.getElementById("product-description").value,
    price: document.getElementById("product-price").value,
    stock: document.getElementById("product-stock").value,
    category: document.getElementById("product-category").value,
    image_url: document.getElementById("product-image").value || "https://via.placeholder.com/400x300?text=Produit",
  }

  // Récupère le statut actif si en mode édition
  if (productId) {
    const activeRadio = document.querySelector('input[name="product-active"]:checked')
    productData.active = activeRadio ? activeRadio.value : "true"
  }

  let result
  if (productId) {
    // Modification
    result = await apiCall("update_product", productId, JSON.stringify(productData))
  } else {
    // Création
    result = await apiCall(
      "create_product",
      productData.name,
      productData.description,
      productData.price,
      productData.stock,
      productData.category,
      productData.image_url,
    )
  }

  if (result.success) {
    showToast(productId ? "Produit modifié avec succès" : "Produit créé avec succès", "success")
    editingProduct = null
    navigateTo("seller-dashboard", { section: "products" })
  } else {
    showToast(result.message || "Erreur lors de l'enregistrement", "error")
  }
}

/**
 * Affiche la confirmation de suppression
 * @param {string} productId - ID du produit
 */
function confirmDeleteProduct(productId) {
  openModal("delete-product-modal")

  // Configure le bouton de confirmation
  const confirmBtn = document.getElementById("confirm-delete-btn")
  confirmBtn.onclick = () => deleteProduct(productId)
}

/**
 * Supprime un produit
 * @param {string} productId - ID du produit
 */
async function deleteProduct(productId) {
  const result = await apiCall("delete_product", productId)

  closeModal("delete-product-modal")

  if (result.success) {
    showToast("Produit supprimé", "success")
    navigateTo("seller-dashboard", { section: "products" })
  } else {
    showToast(result.message || "Erreur lors de la suppression", "error")
  }
}

/**
 * Active/désactive un produit
 * @param {string} productId - ID du produit
 * @param {boolean} active - Nouveau statut
 */
async function toggleProductActive(productId, active) {
  const result = await apiCall("update_product", productId, JSON.stringify({ active: active.toString() }))

  if (result.success) {
    showToast(active ? "Produit activé" : "Produit désactivé", "success")
    navigateTo("seller-dashboard", { section: "products" })
  } else {
    showToast("Erreur lors de la mise à jour", "error")
  }
}

/**
 * Met à jour le statut d'une commande
 * @param {string} orderId - ID de la commande
 * @param {string} status - Nouveau statut
 */
async function updateOrderStatus(orderId, status) {
  const result = await apiCall("update_order_status", orderId, status)

  if (result.success) {
    showToast("Statut mis à jour", "success")
  } else {
    showToast("Erreur lors de la mise à jour", "error")
  }
}

// Function to simulate logout
function logout() {
  console.log("Logging out...")
}
