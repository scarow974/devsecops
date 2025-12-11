/**
 * =============================================================================
 * PAGE D'AUTHENTIFICATION - LOGIN / REGISTER
 * =============================================================================
 * Gère la connexion et l'inscription des utilisateurs.
 * =============================================================================
 */

// Déclaration des variables nécessaires
const showNotification = (message, type) => {
  console.log(`Notification (${type}): ${message}`)
}

const navigateTo = (page) => {
  console.log(`Navigating to: ${page}`)
}

/**
 * Rend la page d'authentification
 * @param {string} mode - 'login' ou 'register'
 * @returns {string} HTML de la page
 */
function renderAuthPage(mode = "login") {
  const isLogin = mode === "login"

  return `
        <div class="auth-page">
            <div class="auth-container">
                <!-- Logo -->
                <div class="auth-logo">
                    <div class="logo" style="justify-content: center; cursor: pointer;" onclick="navigateTo('landing')">
                        <div class="logo-icon">SP</div>
                        <span>ShopPro</span>
                    </div>
                </div>
                
                <!-- Titre -->
                <h1 class="auth-title">${isLogin ? "Connexion" : "Créer un compte"}</h1>
                <p class="auth-subtitle">
                    ${
                      isLogin
                        ? "Connectez-vous pour accéder à votre compte"
                        : "Inscrivez-vous pour commencer à acheter ou vendre"
                    }
                </p>
                
                <!-- Tabs -->
                <div class="auth-tabs">
                    <button class="auth-tab ${isLogin ? "active" : ""}" 
                            onclick="navigateTo('login')">Connexion</button>
                    <button class="auth-tab ${!isLogin ? "active" : ""}" 
                            onclick="navigateTo('register')">Inscription</button>
                </div>
                
                <!-- Formulaire -->
                ${isLogin ? renderLoginForm() : renderRegisterForm()}
                
                <!-- Lien alternatif -->
                <p class="auth-switch mt-lg">
                    ${
                      isLogin
                        ? 'Pas encore de compte ? <a href="#" onclick="event.preventDefault(); navigateTo(\'register\')">S\'inscrire</a>'
                        : 'Déjà un compte ? <a href="#" onclick="event.preventDefault(); navigateTo(\'login\')">Se connecter</a>'
                    }
                </p>
                
                <!-- Retour accueil -->
                <div class="text-center mt-lg">
                    <a href="#" onclick="event.preventDefault(); navigateTo('landing')" 
                       style="color: var(--color-gray-500); font-size: var(--font-size-sm);">
                        ← Retour à l'accueil
                    </a>
                </div>
            </div>
        </div>
    `
}

/**
 * Rend le formulaire de connexion
 * @returns {string} HTML du formulaire
 */
function renderLoginForm() {
  return `
        <form class="auth-form" onsubmit="handleLogin(event)">
            <div class="form-group">
                <label class="form-label" for="login-email">Email</label>
                <input type="email" id="login-email" class="form-input" 
                       placeholder="votre@email.com" required>
            </div>
            
            <div class="form-group">
                <label class="form-label" for="login-password">Mot de passe</label>
                <input type="password" id="login-password" class="form-input" 
                       placeholder="••••••••" required>
            </div>
            
            <button type="submit" class="btn btn-primary w-full btn-lg">
                Se connecter
            </button>
        </form>
        
        <div class="auth-divider">ou</div>
        
        <!-- Connexion rapide avec comptes démo -->
        <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
            <button class="btn btn-secondary w-full" onclick="quickLogin('client')">
                Connexion Client (démo)
            </button>
            <button class="btn btn-secondary w-full" onclick="quickLogin('seller')">
                Connexion Vendeur (démo)
            </button>
            <button class="btn btn-secondary w-full" onclick="quickLogin('admin')">
                Connexion Admin (démo)
            </button>
        </div>
    `
}

/**
 * Rend le formulaire d'inscription
 * @returns {string} HTML du formulaire
 */
function renderRegisterForm() {
  return `
        <form class="auth-form" onsubmit="handleRegister(event)">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
                <div class="form-group">
                    <label class="form-label" for="register-firstname">Prénom</label>
                    <input type="text" id="register-firstname" class="form-input" 
                           placeholder="Jean" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="register-lastname">Nom</label>
                    <input type="text" id="register-lastname" class="form-input" 
                           placeholder="Dupont" required>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label" for="register-email">Email</label>
                <input type="email" id="register-email" class="form-input" 
                       placeholder="votre@email.com" required>
            </div>
            
            <div class="form-group">
                <label class="form-label" for="register-password">Mot de passe</label>
                <input type="password" id="register-password" class="form-input" 
                       placeholder="Minimum 6 caractères" required minlength="6">
            </div>
            
            <div class="form-group">
                <label class="form-label" for="register-role">Type de compte</label>
                <select id="register-role" class="form-input form-select">
                    <option value="client">Client - Je veux acheter</option>
                    <option value="seller">Vendeur - Je veux vendre</option>
                </select>
            </div>
            
            <button type="submit" class="btn btn-accent w-full btn-lg">
                Créer mon compte
            </button>
        </form>
    `
}

/**
 * Gère la soumission du formulaire de connexion
 * @param {Event} event - Événement de soumission
 */
async function handleLogin(event) {
  event.preventDefault()

  const email = document.getElementById("login-email").value
  const password = document.getElementById("login-password").value

  try {
    // Appel à l'API Python via pywebview
    const result = await window.pywebview.api.login(email, password)

    if (result.success) {
      // Stocker les informations de session
      window.currentUser = result.user
      showNotification("Connexion réussie ! Bienvenue " + result.user.firstname, "success")

      // Redirection selon le rôle
      setTimeout(() => {
        switch (result.user.role) {
          case "admin":
            navigateTo("admin")
            break
          case "seller":
            navigateTo("seller")
            break
          default:
            navigateTo("client")
        }
      }, 1000)
    } else {
      showNotification(result.error || "Identifiants incorrects", "error")
    }
  } catch (error) {
    console.error("Erreur de connexion:", error)
    showNotification("Erreur de connexion au serveur", "error")
  }
}

/**
 * Gère la soumission du formulaire d'inscription
 * @param {Event} event - Événement de soumission
 */
async function handleRegister(event) {
  event.preventDefault()

  const userData = {
    email: document.getElementById("register-email").value,
    password: document.getElementById("register-password").value,
    firstname: document.getElementById("register-firstname").value,
    lastname: document.getElementById("register-lastname").value,
    role: document.getElementById("register-role").value,
  }

  try {
    // Appel à l'API Python via pywebview
    const result = await window.pywebview.api.register(
      userData.email,
      userData.password,
      userData.firstname,
      userData.lastname,
      userData.role,
    )

    if (result.success) {
      showNotification("Compte créé avec succès ! Vous pouvez maintenant vous connecter.", "success")
      setTimeout(() => navigateTo("login"), 1500)
    } else {
      showNotification(result.error || "Erreur lors de la création du compte", "error")
    }
  } catch (error) {
    console.error("Erreur d'inscription:", error)
    showNotification("Erreur de connexion au serveur", "error")
  }
}

/**
 * Connexion rapide avec un compte de démonstration
 * @param {string} role - Rôle du compte (client, seller, admin)
 */
async function quickLogin(role) {
  const credentials = {
    client: { email: "client@shoppro.com", password: "client123" },
    seller: { email: "vendeur@shoppro.com", password: "vendeur123" },
    admin: { email: "admin@shoppro.com", password: "admin123" },
  }

  const cred = credentials[role]
  if (cred) {
    document.getElementById("login-email").value = cred.email
    document.getElementById("login-password").value = cred.password

    // Déclencher la connexion
    const form = document.querySelector(".auth-form")
    if (form) {
      form.dispatchEvent(new Event("submit", { cancelable: true }))
    }
  }
}
