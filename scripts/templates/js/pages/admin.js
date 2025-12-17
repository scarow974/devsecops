/**
 * =============================================================================
 * ESPACE ADMINISTRATEUR
 * =============================================================================
 * Dashboard complet pour l'administration du système.
 * Accès à toutes les fonctionnalités : utilisateurs, produits, commandes, stats.
 * =============================================================================
 */

// Variables declaration
const renderHeader = () => "<header>Admin Header</header>"
const AppState = { user: { firstname: "John", lastname: "Doe", role: "admin" } }
const apiCall = async (endpoint, id) => {
  // Mock API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        users: [
          {
            id: "1",
            firstname: "John",
            lastname: "Doe",
            email: "john@example.com",
            role: "admin",
            created_at: "2023-10-01",
          },
        ],
        products: [
          {
            id: "1",
            name: "Product 1",
            category: "Category 1",
            price: "100",
            stock: "10",
            seller_name: "Seller 1",
            active: "true",
            image_url: "https://via.placeholder.com/40x40",
          },
        ],
        orders: [
          {
            id: "1",
            user_name: "John Doe",
            user_email: "john@example.com",
            created_at: "2023-10-01",
            total: "100",
            shipping_address: "123 Main St",
            status: "pending",
          },
        ],
        categories: ["Category 1", "Category 2"],
      })
    }, 1000)
  })
}
const formatPrice = (price) => `$${Number.parseFloat(price).toFixed(2)}`
const formatDate = (date) => new Date(date).toLocaleDateString()
const getStatusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1)
const getRoleLabel = (role) => role.charAt(0).toUpperCase() + role.slice(1)
const showToast = (message, type) => console.log(`${type}: ${message}`)
const openModal = (modalId) => (document.getElementById(modalId).style.display = "block")
const closeModal = (modalId) => (document.getElementById(modalId).style.display = "none")
const navigateTo = (page, params) => console.log(`Navigating to ${page} with params`, params)

/**
 * Rend le dashboard administrateur
 * @param {string} section - Section active
 * @returns {Promise<string>} HTML de la page
 */
async function renderAdminDashboard(section = "overview") {
  return `
        <div class="page">
            ${renderHeader()}
            
            <div class="dashboard">
                <!-- Sidebar -->
                <aside class="dashboard-sidebar">
                    <div style="margin-bottom: var(--spacing-xl);">
                        <div class="user-avatar" style="width: 64px; height: 64px; font-size: var(--font-size-xl); margin-bottom: var(--spacing-md); background: linear-gradient(135deg, var(--color-error), var(--color-accent));">
                            ${AppState.user.firstname[0]}${AppState.user.lastname[0]}
                        </div>
                        <h3 style="color: white;">${AppState.user.firstname} ${AppState.user.lastname}</h3>
                        <p style="color: var(--color-gray-400); font-size: var(--font-size-sm);">Administrateur</p>
                        <span class="badge badge-error mt-sm">Admin</span>
                    </div>
                    
                    <nav class="dashboard-nav">
                        <a href="#" class="dashboard-nav-item ${section === "overview" ? "active" : ""}"
                           onclick="event.preventDefault(); navigateTo('admin-dashboard', {section: 'overview'})">
                            📊 Vue d'ensemble
                        </a>
                        <a href="#" class="dashboard-nav-item ${section === "users" ? "active" : ""}"
                           onclick="event.preventDefault(); navigateTo('admin-dashboard', {section: 'users'})">
                            👥 Utilisateurs
                        </a>
                        <a href="#" class="dashboard-nav-item ${section === "products" ? "active" : ""}"
                           onclick="event.preventDefault(); navigateTo('admin-dashboard', {section: 'products'})">
                            📦 Produits
                        </a>
                        <a href="#" class="dashboard-nav-item ${section === "orders" ? "active" : ""}"
                           onclick="event.preventDefault(); navigateTo('admin-dashboard', {section: 'orders'})">
                            🛒 Commandes
                        </a>
                        <a href="#" class="dashboard-nav-item ${section === "categories" ? "active" : ""}"
                           onclick="event.preventDefault(); navigateTo('admin-dashboard', {section: 'categories'})">
                            🏷️ Catégories
                        </a>
                        
                        <div style="border-top: 1px solid var(--color-gray-700); margin: var(--spacing-lg) 0;"></div>
                        
                        <a href="#" class="dashboard-nav-item" onclick="event.preventDefault(); navigateTo('shop')">
                            🛍️ Voir la boutique
                        </a>
                        <a href="#" class="dashboard-nav-item" onclick="event.preventDefault(); navigateTo('seller-dashboard')">
                            🏪 Espace vendeur
                        </a>
                        <a href="#" class="dashboard-nav-item" onclick="event.preventDefault(); navigateTo('client-dashboard')">
                            👤 Espace client
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
                    ${section === "overview" ? await renderAdminOverview() : ""}
                    ${section === "users" ? await renderAdminUsers() : ""}
                    ${section === "products" ? await renderAdminProducts() : ""}
                    ${section === "orders" ? await renderAdminOrders() : ""}
                    ${section === "categories" ? await renderAdminCategories() : ""}
                </main>
            </div>
            
            <!-- Modal de confirmation -->
            <div class="modal-overlay" id="admin-confirm-modal">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title" id="admin-modal-title">Confirmation</h3>
                        <button class="modal-close" onclick="closeModal('admin-confirm-modal')">✕</button>
                    </div>
                    <div class="modal-body" id="admin-modal-body">
                        <p>Êtes-vous sûr ?</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="closeModal('admin-confirm-modal')">Annuler</button>
                        <button class="btn btn-danger" id="admin-confirm-btn">Confirmer</button>
                    </div>
                </div>
            </div>
            
            <!-- Modal d'édition utilisateur -->
            <div class="modal-overlay" id="edit-user-modal">
                <div class="modal" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3 class="modal-title">Modifier l'utilisateur</h3>
                        <button class="modal-close" onclick="closeModal('edit-user-modal')">✕</button>
                    </div>
                    <div class="modal-body" id="edit-user-form-container">
                        <!-- Formulaire injecté dynamiquement -->
                    </div>
                </div>
            </div>
        </div>
    `
}

/**
 * Rend la vue d'ensemble admin
 * @returns {Promise<string>} HTML de la section
 */
async function renderAdminOverview() {
  // Récupère toutes les données nécessaires
  const [usersResult, productsResult, ordersResult, categoriesResult] = await Promise.all([
    apiCall("get_all_users"),
    apiCall("get_products"),
    apiCall("get_all_orders"),
    apiCall("get_categories"),
  ])

  const users = usersResult.users || []
  const products = productsResult.products || []
  const orders = ordersResult.orders || []
  const categories = categoriesResult.categories || []

  // Calcul des statistiques
  const totalUsers = users.length
  const totalClients = users.filter((u) => u.role === "client").length
  const totalSellers = users.filter((u) => u.role === "seller").length
  const totalAdmins = users.filter((u) => u.role === "admin").length

  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.active === "true").length

  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number.parseFloat(o.total || 0), 0)

  return `
        <div class="dashboard-header">
            <h1 class="dashboard-title">Vue d'ensemble</h1>
            <p style="color: var(--color-gray-500);">Bienvenue dans le panneau d'administration</p>
        </div>
        
        <!-- Statistiques principales -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon" style="background: var(--color-primary-light);">👥</div>
                <div class="stat-info">
                    <span class="stat-value">${totalUsers}</span>
                    <span class="stat-label">Utilisateurs</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon" style="background: var(--color-accent-light);">📦</div>
                <div class="stat-info">
                    <span class="stat-value">${totalProducts}</span>
                    <span class="stat-label">Produits</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon" style="background: var(--color-warning-light);">🛒</div>
                <div class="stat-info">
                    <span class="stat-value">${totalOrders}</span>
                    <span class="stat-label">Commandes</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon" style="background: var(--color-success-light);">💰</div>
                <div class="stat-info">
                    <span class="stat-value">${formatPrice(totalRevenue)}</span>
                    <span class="stat-label">Chiffre d'affaires</span>
                </div>
            </div>
        </div>
        
        <!-- Répartition utilisateurs -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-xl); margin-top: var(--spacing-xl);">
            <div class="card" style="padding: var(--spacing-xl);">
                <h3 style="margin-bottom: var(--spacing-lg);">Répartition des utilisateurs</h3>
                <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>👤 Clients</span>
                        <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                            <div style="width: 100px; height: 8px; background: var(--color-gray-200); border-radius: 4px; overflow: hidden;">
                                <div style="width: ${totalUsers > 0 ? (totalClients / totalUsers) * 100 : 0}%; height: 100%; background: var(--color-primary);"></div>
                            </div>
                            <strong>${totalClients}</strong>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>🏪 Vendeurs</span>
                        <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                            <div style="width: 100px; height: 8px; background: var(--color-gray-200); border-radius: 4px; overflow: hidden;">
                                <div style="width: ${totalUsers > 0 ? (totalSellers / totalUsers) * 100 : 0}%; height: 100%; background: var(--color-warning);"></div>
                            </div>
                            <strong>${totalSellers}</strong>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>⚙️ Admins</span>
                        <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                            <div style="width: 100px; height: 8px; background: var(--color-gray-200); border-radius: 4px; overflow: hidden;">
                                <div style="width: ${totalUsers > 0 ? (totalAdmins / totalUsers) * 100 : 0}%; height: 100%; background: var(--color-error);"></div>
                            </div>
                            <strong>${totalAdmins}</strong>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card" style="padding: var(--spacing-xl);">
                <h3 style="margin-bottom: var(--spacing-lg);">État des commandes</h3>
                <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="badge status-pending">En attente</span>
                        <strong>${pendingOrders}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="badge status-confirmed">Confirmées</span>
                        <strong>${orders.filter((o) => o.status === "confirmed").length}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="badge status-shipped">Expédiées</span>
                        <strong>${orders.filter((o) => o.status === "shipped").length}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="badge status-delivered">Livrées</span>
                        <strong>${orders.filter((o) => o.status === "delivered").length}</strong>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Dernières activités -->
        <div class="card" style="margin-top: var(--spacing-xl); padding: var(--spacing-xl);">
            <h3 style="margin-bottom: var(--spacing-lg);">Dernières commandes</h3>
            ${
              orders.length === 0
                ? `
                <p style="color: var(--color-gray-500); text-align: center;">Aucune commande</p>
            `
                : `
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Client</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders
                              .slice(0, 5)
                              .map(
                                (order) => `
                                <tr>
                                    <td><strong>#${order.id}</strong></td>
                                    <td>${order.user_name || "Client"}</td>
                                    <td>${formatDate(order.created_at)}</td>
                                    <td><strong>${formatPrice(order.total)}</strong></td>
                                    <td><span class="badge status-${order.status}">${getStatusLabel(order.status)}</span></td>
                                </tr>
                            `,
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
            `
            }
        </div>
    `
}

/**
 * Rend la gestion des utilisateurs
 * @returns {Promise<string>} HTML de la section
 */
async function renderAdminUsers() {
  const result = await apiCall("get_all_users")
  const users = result.users || []

  return `
        <div class="dashboard-header">
            <h1 class="dashboard-title">Gestion des utilisateurs</h1>
            <div style="display: flex; gap: var(--spacing-md);">
                <input type="text" class="form-input" placeholder="Rechercher..." 
                       style="width: 250px;" id="user-search"
                       onkeyup="filterUsersTable(this.value)">
            </div>
        </div>
        
        <div class="table-container">
            <table class="table" id="users-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Utilisateur</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Inscrit le</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users
                      .map(
                        (user) => `
                        <tr data-user-name="${user.firstname} ${user.lastname}".toLowerCase() data-user-email="${user.email.toLowerCase()}">
                            <td><code>${user.id.substring(0, 8)}...</code></td>
                            <td>
                                <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                                    <div class="user-avatar" style="width: 36px; height: 36px; font-size: var(--font-size-sm);">
                                        ${user.firstname[0]}${user.lastname[0]}
                                    </div>
                                    <strong>${user.firstname} ${user.lastname}</strong>
                                </div>
                            </td>
                            <td>${user.email}</td>
                            <td>
                                <span class="badge ${user.role === "admin" ? "badge-error" : user.role === "seller" ? "badge-warning" : "badge-primary"}">
                                    ${getRoleLabel(user.role)}
                                </span>
                            </td>
                            <td>${formatDate(user.created_at)}</td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn btn-ghost btn-sm" onclick="showEditUserModal('${user.id}')" title="Modifier">
                                        ✏️
                                    </button>
                                    ${
                                      user.role !== "admin"
                                        ? `
                                        <button class="btn btn-ghost btn-sm" onclick="confirmDeleteUser('${user.id}')" title="Supprimer">
                                            🗑️
                                        </button>
                                    `
                                        : ""
                                    }
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

/**
 * Rend la gestion des produits (admin)
 * @returns {Promise<string>} HTML de la section
 */
async function renderAdminProducts() {
  const result = await apiCall("get_products")
  const products = result.products || []

  return `
        <div class="dashboard-header">
            <h1 class="dashboard-title">Gestion des produits</h1>
            <div style="display: flex; gap: var(--spacing-md);">
                <input type="text" class="form-input" placeholder="Rechercher..." 
                       style="width: 250px;" onkeyup="filterProductsTable(this.value)">
                <button class="btn btn-primary" onclick="navigateTo('seller-dashboard', {section: 'add-product'})">
                    ➕ Ajouter
                </button>
            </div>
        </div>
        
        <div class="table-container">
            <table class="table" id="products-table">
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th>Catégorie</th>
                        <th>Prix</th>
                        <th>Stock</th>
                        <th>Vendeur</th>
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
                                         style="width: 40px; height: 40px; border-radius: var(--border-radius-sm); object-fit: cover;"
                                         onerror="this.src='https://via.placeholder.com/40x40?text=?'">
                                    <div>
                                        <strong>${product.name}</strong>
                                    </div>
                                </div>
                            </td>
                            <td><span class="badge badge-gray">${product.category}</span></td>
                            <td><strong>${formatPrice(product.price)}</strong></td>
                            <td>
                                <span class="${Number.parseInt(product.stock) < 5 ? "text-error" : Number.parseInt(product.stock) === 0 ? "text-error" : ""}">
                                    ${product.stock}
                                </span>
                            </td>
                            <td>${product.seller_name || "-"}</td>
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

/**
 * Rend la gestion des commandes (admin)
 * @returns {Promise<string>} HTML de la section
 */
async function renderAdminOrders() {
  const result = await apiCall("get_all_orders")
  const orders = result.orders || []

  return `
        <div class="dashboard-header">
            <h1 class="dashboard-title">Gestion des commandes</h1>
            <div style="display: flex; gap: var(--spacing-md);">
                <select class="form-input form-select" style="width: 200px;" onchange="filterOrdersByStatus(this.value)">
                    <option value="">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmées</option>
                    <option value="shipped">Expédiées</option>
                    <option value="delivered">Livrées</option>
                    <option value="cancelled">Annulées</option>
                </select>
            </div>
        </div>
        
        <div class="table-container">
            <table class="table" id="orders-table">
                <thead>
                    <tr>
                        <th>N° Commande</th>
                        <th>Client</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Adresse</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders
                      .map(
                        (order) => `
                        <tr data-status="${order.status}">
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
                            <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${order.shipping_address}">
                                ${order.shipping_address}
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
                            <td>
                                <button class="btn btn-ghost btn-sm" onclick="viewOrderDetails('${order.id}')" title="Voir détails">
                                    👁️
                                </button>
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

/**
 * Rend la gestion des catégories
 * @returns {Promise<string>} HTML de la section
 */
async function renderAdminCategories() {
  const result = await apiCall("get_categories")
  const categories = result.categories || []

  return `
        <div class="dashboard-header">
            <h1 class="dashboard-title">Catégories</h1>
        </div>
        
        <div class="card" style="padding: var(--spacing-xl); max-width: 600px;">
            <h3 style="margin-bottom: var(--spacing-lg);">Catégories existantes (${categories.length})</h3>
            
            <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-sm); margin-bottom: var(--spacing-xl);">
                ${
                  categories.length === 0
                    ? `
                    <p style="color: var(--color-gray-500);">Aucune catégorie</p>
                `
                    : categories
                        .map(
                          (cat) => `
                    <span class="badge badge-primary" style="font-size: var(--font-size-base); padding: var(--spacing-sm) var(--spacing-md);">
                        ${cat}
                    </span>
                `,
                        )
                        .join("")
                }
            </div>
            
            <p style="color: var(--color-gray-500); font-size: var(--font-size-sm);">
                Les catégories sont créées automatiquement lors de l'ajout de produits.
            </p>
        </div>
    `
}

// ============================================================================
// FONCTIONS UTILITAIRES ADMIN
// ============================================================================

/**
 * Filtre le tableau des utilisateurs
 * @param {string} query - Terme de recherche
 */
function filterUsersTable(query) {
  const rows = document.querySelectorAll("#users-table tbody tr")
  const lowerQuery = query.toLowerCase()

  rows.forEach((row) => {
    const name = row.dataset.userName || ""
    const email = row.dataset.userEmail || ""
    const visible = name.includes(lowerQuery) || email.includes(lowerQuery)
    row.style.display = visible ? "" : "none"
  })
}

/**
 * Filtre le tableau des produits
 * @param {string} query - Terme de recherche
 */
function filterProductsTable(query) {
  const rows = document.querySelectorAll("#products-table tbody tr")
  const lowerQuery = query.toLowerCase()

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase()
    row.style.display = text.includes(lowerQuery) ? "" : "none"
  })
}

/**
 * Filtre les commandes par statut
 * @param {string} status - Statut à filtrer
 */
function filterOrdersByStatus(status) {
  const rows = document.querySelectorAll("#orders-table tbody tr")

  rows.forEach((row) => {
    if (!status || row.dataset.status === status) {
      row.style.display = ""
    } else {
      row.style.display = "none"
    }
  })
}

/**
 * Affiche la modal d'édition utilisateur
 * @param {string} userId - ID de l'utilisateur
 */
async function showEditUserModal(userId) {
  const result = await apiCall("get_user", userId)

  if (!result.success) {
    showToast("Utilisateur non trouvé", "error")
    return
  }

  const user = result.user

  const formContainer = document.getElementById("edit-user-form-container")
  formContainer.innerHTML = `
        <form onsubmit="handleUpdateUser(event, '${userId}')">
            <div class="form-group">
                <label class="form-label">Prénom</label>
                <input type="text" class="form-input" id="edit-user-firstname" value="${user.firstname}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Nom</label>
                <input type="text" class="form-input" id="edit-user-lastname" value="${user.lastname}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" id="edit-user-email" value="${user.email}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Rôle</label>
                <select class="form-input form-select" id="edit-user-role">
                    <option value="client" ${user.role === "client" ? "selected" : ""}>Client</option>
                    <option value="seller" ${user.role === "seller" ? "selected" : ""}>Vendeur</option>
                    <option value="admin" ${user.role === "admin" ? "selected" : ""}>Administrateur</option>
                </select>
            </div>
            <div style="display: flex; gap: var(--spacing-md); margin-top: var(--spacing-xl);">
                <button type="submit" class="btn btn-primary">Enregistrer</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal('edit-user-modal')">Annuler</button>
            </div>
        </form>
    `

  openModal("edit-user-modal")
}

/**
 * Met à jour un utilisateur
 * @param {Event} event - Événement de soumission
 * @param {string} userId - ID de l'utilisateur
 */
async function handleUpdateUser(event, userId) {
  event.preventDefault()

  const userData = {
    firstname: document.getElementById("edit-user-firstname").value,
    lastname: document.getElementById("edit-user-lastname").value,
    email: document.getElementById("edit-user-email").value,
    role: document.getElementById("edit-user-role").value,
  }

  const result = await apiCall("update_user", userId, JSON.stringify(userData))

  closeModal("edit-user-modal")

  if (result.success) {
    showToast("Utilisateur mis à jour", "success")
    navigateTo("admin-dashboard", { section: "users" })
  } else {
    showToast(result.message || "Erreur lors de la mise à jour", "error")
  }
}

/**
 * Confirme la suppression d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 */
function confirmDeleteUser(userId) {
  document.getElementById("admin-modal-title").textContent = "Supprimer l'utilisateur"
  document.getElementById("admin-modal-body").innerHTML = `
        <p>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
        <p style="color: var(--color-gray-500); font-size: var(--font-size-sm); margin-top: var(--spacing-sm);">
            Cette action supprimera également toutes ses données associées.
        </p>
    `

  document.getElementById("admin-confirm-btn").onclick = () => deleteUser(userId)

  openModal("admin-confirm-modal")
}

/**
 * Supprime un utilisateur
 * @param {string} userId - ID de l'utilisateur
 */
async function deleteUser(userId) {
  const result = await apiCall("delete_user", userId)

  closeModal("admin-confirm-modal")

  if (result.success) {
    showToast("Utilisateur supprimé", "success")
    navigateTo("admin-dashboard", { section: "users" })
  } else {
    showToast(result.message || "Erreur lors de la suppression", "error")
  }
}

/**
 * Affiche les détails d'une commande
 * @param {string} orderId - ID de la commande
 */
async function viewOrderDetails(orderId) {
  const result = await apiCall("get_order", orderId)

  if (!result.success) {
    showToast("Commande non trouvée", "error")
    return
  }

  const order = result.order

  document.getElementById("admin-modal-title").textContent = `Commande #${order.id}`
  document.getElementById("admin-modal-body").innerHTML = `
        <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
            <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--color-gray-500);">Client:</span>
                <strong>${order.user_name || "Client"}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--color-gray-500);">Email:</span>
                <span>${order.user_email || "-"}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--color-gray-500);">Date:</span>
                <span>${formatDate(order.created_at)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--color-gray-500);">Adresse:</span>
                <span style="text-align: right; max-width: 200px;">${order.shipping_address}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--color-gray-500);">Statut:</span>
                <span class="badge status-${order.status}">${getStatusLabel(order.status)}</span>
            </div>
            <hr style="border: none; border-top: 1px solid var(--color-gray-200); margin: var(--spacing-sm) 0;">
            <div style="display: flex; justify-content: space-between;">
                <strong>Total:</strong>
                <strong style="color: var(--color-primary); font-size: var(--font-size-lg);">${formatPrice(order.total)}</strong>
            </div>
        </div>
    `

  document.getElementById("admin-confirm-btn").style.display = "none"
  openModal("admin-confirm-modal")

  // Restaure le bouton après fermeture
  document.querySelector("#admin-confirm-modal .modal-close").onclick = () => {
    document.getElementById("admin-confirm-btn").style.display = ""
    closeModal("admin-confirm-modal")
  }
}
