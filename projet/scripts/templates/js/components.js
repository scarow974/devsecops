/**
 * =============================================================================
 * COMPOSANTS RÉUTILISABLES
 * =============================================================================
 * Contient les composants UI partagés entre les différentes pages.
 * =============================================================================
 */

// Déclaration de la fonction showToast
function showToast(message, type) {
  console.log(`[${type.toUpperCase()}] ${message}`)
}

// ============================================================================
// COMPOSANTS DE NOTIFICATION
// ============================================================================

/**
 * Affiche une notification toast
 * @param {string} message - Message à afficher
 * @param {string} type - Type (success, error, info, warning)
 */
function showNotification(message, type = "info") {
  showToast(message, type)
}

// ============================================================================
// COMPOSANTS DE MODAL
// ============================================================================

/**
 * Crée une modal de confirmation
 * @param {string} title - Titre de la modal
 * @param {string} message - Message de confirmation
 * @param {Function} onConfirm - Callback lors de la confirmation
 * @param {string} confirmText - Texte du bouton de confirmation
 */
function showConfirmModal(title, message, onConfirm, confirmText = "Confirmer") {
  const modalId = "confirm-modal-" + Date.now()

  const modalHtml = `
        <div class="modal-overlay show" id="${modalId}">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="document.getElementById('${modalId}').remove()">
                        Annuler
                    </button>
                    <button class="btn btn-danger" id="${modalId}-confirm">
                        ${confirmText}
                    </button>
                </div>
            </div>
        </div>
    `

  document.body.insertAdjacentHTML("beforeend", modalHtml)

  document.getElementById(`${modalId}-confirm`).onclick = () => {
    onConfirm()
    document.getElementById(modalId).remove()
  }
}

/**
 * Affiche une modal d'information
 * @param {string} title - Titre de la modal
 * @param {string} content - Contenu HTML de la modal
 */
function showInfoModal(title, content) {
  const modalId = "info-modal-" + Date.now()

  const modalHtml = `
        <div class="modal-overlay show" id="${modalId}">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">✕</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="document.getElementById('${modalId}').remove()">
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    `

  document.body.insertAdjacentHTML("beforeend", modalHtml)
}

// ============================================================================
// COMPOSANTS DE CHARGEMENT
// ============================================================================

/**
 * Affiche un indicateur de chargement
 * @param {string} containerId - ID du conteneur où afficher le loader
 * @param {string} message - Message optionnel
 */
function showLoader(containerId, message = "Chargement...") {
  const container = document.getElementById(containerId)
  if (!container) return

  container.innerHTML = `
        <div class="loading-container">
            <div class="loader"></div>
            <p>${message}</p>
        </div>
    `
}

/**
 * Masque l'indicateur de chargement
 * @param {string} containerId - ID du conteneur
 */
function hideLoader(containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  const loader = container.querySelector(".loading-container")
  if (loader) {
    loader.remove()
  }
}

// ============================================================================
// COMPOSANTS DE PAGINATION
// ============================================================================

/**
 * Génère une pagination
 * @param {number} currentPage - Page actuelle
 * @param {number} totalPages - Nombre total de pages
 * @param {Function} onPageChange - Callback lors du changement de page
 * @returns {string} HTML de la pagination
 */
function renderPagination(currentPage, totalPages, onPageChange) {
  if (totalPages <= 1) return ""

  const pages = []

  // Première page
  pages.push(1)

  // Pages autour de la page actuelle
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    if (!pages.includes(i)) {
      if (i > pages[pages.length - 1] + 1) {
        pages.push("...")
      }
      pages.push(i)
    }
  }

  // Dernière page
  if (totalPages > 1 && !pages.includes(totalPages)) {
    if (totalPages > pages[pages.length - 1] + 1) {
      pages.push("...")
    }
    pages.push(totalPages)
  }

  return `
        <div class="pagination">
            <button class="btn btn-ghost btn-sm" 
                    onclick="${onPageChange.name}(${currentPage - 1})"
                    ${currentPage === 1 ? "disabled" : ""}>
                ← Précédent
            </button>
            
            <div class="pagination-pages">
                ${pages
                  .map((page) =>
                    page === "..."
                      ? `<span class="pagination-ellipsis">...</span>`
                      : `<button class="pagination-page ${page === currentPage ? "active" : ""}"
                               onclick="${onPageChange.name}(${page})">
                            ${page}
                        </button>`,
                  )
                  .join("")}
            </div>
            
            <button class="btn btn-ghost btn-sm" 
                    onclick="${onPageChange.name}(${currentPage + 1})"
                    ${currentPage === totalPages ? "disabled" : ""}>
                Suivant →
            </button>
        </div>
    `
}

// ============================================================================
// COMPOSANTS DE FORMULAIRE
// ============================================================================

/**
 * Valide un email
 * @param {string} email - Email à valider
 * @returns {boolean} True si valide
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Valide un mot de passe
 * @param {string} password - Mot de passe à valider
 * @param {number} minLength - Longueur minimale
 * @returns {object} Objet avec valid (boolean) et message (string)
 */
function validatePassword(password, minLength = 6) {
  if (password.length < minLength) {
    return { valid: false, message: `Le mot de passe doit contenir au moins ${minLength} caractères` }
  }
  return { valid: true, message: "" }
}

/**
 * Affiche une erreur de validation sous un champ
 * @param {string} inputId - ID du champ
 * @param {string} message - Message d'erreur
 */
function showFieldError(inputId, message) {
  const input = document.getElementById(inputId)
  if (!input) return

  // Supprime l'erreur existante
  clearFieldError(inputId)

  // Ajoute la classe d'erreur
  input.classList.add("error")

  // Ajoute le message d'erreur
  const errorEl = document.createElement("span")
  errorEl.className = "form-error"
  errorEl.id = `${inputId}-error`
  errorEl.textContent = message

  input.parentNode.appendChild(errorEl)
}

/**
 * Supprime une erreur de validation
 * @param {string} inputId - ID du champ
 */
function clearFieldError(inputId) {
  const input = document.getElementById(inputId)
  if (!input) return

  input.classList.remove("error")

  const errorEl = document.getElementById(`${inputId}-error`)
  if (errorEl) {
    errorEl.remove()
  }
}

// ============================================================================
// COMPOSANTS UTILITAIRES
// ============================================================================

/**
 * Copie du texte dans le presse-papier
 * @param {string} text - Texte à copier
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    showToast("Copié dans le presse-papier", "success")
  } catch (err) {
    showToast("Erreur lors de la copie", "error")
  }
}

/**
 * Formate un nombre en devises
 * @param {number} amount - Montant
 * @param {string} currency - Devise (EUR par défaut)
 * @returns {string} Montant formaté
 */
function formatCurrency(amount, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

/**
 * Formate une date relative (il y a X temps)
 * @param {string} dateString - Date ISO
 * @returns {string} Date relative
 */
function formatRelativeDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `il y a ${days} jour${days > 1 ? "s" : ""}`
  if (hours > 0) return `il y a ${hours} heure${hours > 1 ? "s" : ""}`
  if (minutes > 0) return `il y a ${minutes} minute${minutes > 1 ? "s" : ""}`
  return "à l'instant"
}

/**
 * Tronque un texte
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur max
 * @returns {string} Texte tronqué
 */
function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

/**
 * Génère un ID unique
 * @returns {string} ID unique
 */
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Debounce une fonction
 * @param {Function} func - Fonction à debouncer
 * @param {number} wait - Délai en ms
 * @returns {Function} Fonction debouncée
 */
function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// ============================================================================
// EXPORT POUR UTILISATION GLOBALE
// ============================================================================

// Les fonctions sont automatiquement disponibles globalement car le script
// est chargé sans modules ES6
console.log("[Components] Composants chargés avec succès")
