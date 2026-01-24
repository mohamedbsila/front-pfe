// Login functionality
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const loginBtn = event.target.querySelector('button');
    const originalBtnText = loginBtn.textContent;
    loginBtn.disabled = true;
    loginBtn.textContent = 'Connexion...';

    try {
        console.log('Login attempt:', email);
        await authClient.login(email, password);
        console.log('Login successful!');
        try { playSuccessSound(); } catch (e) { }
        
        // Refresh app state (load sidebar, topbar, dashboard)
        if (typeof initApp === 'function') {
            await initApp();
        } else {
            // Fallback if initApp is not global
            location.reload();
        }
    } catch (error) {
        console.error('Login failed:', error);
        try { playErrorSound(); } catch (e) { }
        const message = error.message || 'Identifiants incorrects';
        if (typeof showCustomAlert === 'function') {
            showCustomAlert(message, 'error');
        } else {
            alert(message);
        }
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = originalBtnText;
    }
}

// Toggle between Login and Register
let isLoginMode = true;
function toggleAuthMode(event) {
    if (event) event.preventDefault();
    isLoginMode = !isLoginMode;

    const title = document.querySelector('.login-title');
    const form = document.querySelector('.login-form');
    const toggleLink = document.querySelector('a[onclick="toggleAuthMode(event)"]');

    if (isLoginMode) {
        title.textContent = 'Bureau de Contrôle';
        form.innerHTML = `
            <div class="form-group">
                <label for="username">Nom d'utilisateur (Email)</label>
                <input type="text" id="username" class="form-input" placeholder="Entrez votre email" required>
            </div>
            <div class="form-group">
                <label for="password">Mot de passe</label>
                <input type="password" id="password" class="form-input" placeholder="Entrez votre mot de passe" required>
            </div>
            <button type="submit" class="btn-login">Se connecter</button>
            <div style="text-align: center; margin-top: 1rem; font-size: 0.9rem;">
                <p>Nouveau ? <a href="#" onclick="toggleAuthMode(event)" style="color: #2c3e50; font-weight: bold;">Créer un compte</a></p>
            </div>
        `;
        form.onsubmit = handleLogin;
    } else {
        title.textContent = 'Création de Compte';
        form.innerHTML = `
            <div class="form-group">
                <label for="regName">Nom Complet</label>
                <input type="text" id="regName" class="form-input" placeholder="Votre nom" required>
            </div>
            <div class="form-group">
                <label for="regEmail">Email</label>
                <input type="email" id="regEmail" class="form-input" placeholder="votre@email.com" required>
            </div>
            <div class="form-group">
                <label for="regPassword">Mot de passe</label>
                <input type="password" id="regPassword" class="form-input" placeholder="Min. 6 caractères" required minlength="6">
            </div>
            <button type="submit" class="btn-login">S'enregistrer</button>
            <div style="text-align: center; margin-top: 1rem; font-size: 0.9rem;">
                <p>Déjà un compte ? <a href="#" onclick="toggleAuthMode(event)" style="color: #2c3e50; font-weight: bold;">Se connecter</a></p>
            </div>
        `;
        form.onsubmit = handleRegister;
    }
}

// Handle Registration
async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    const btn = event.target.querySelector('button');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Enregistrement...';

    try {
        await authClient.register(name, email, password);
        showCustomAlert('Compte créé ! Vous pouvez maintenant vous connecter.', 'success');
        toggleAuthMode();
    } catch (error) {
        console.error('Registration error:', error);
        showCustomAlert(error.message || 'Erreur lors de la création du compte', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

// Navigation functionality
function showSection(sectionId) {
    // Play navigation sound
    try {
        playNavigationSound();
    } catch (e) {
        console.log('Sound error:', e);
    }

    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }

    // Update nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });

    // Set active nav item
    const activeNavItem = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }

    // Update page title and breadcrumb
    const titles = {
        'dashboard': 'Tableau de Bord',
        'farmers': 'Gestion des Agriculteurs',
        'subsidies': 'Gestion des Subventions',
        'permits': 'Permis & Autorisations',
        'programs': 'Programmes Agricoles',
        'reports': 'Rapports et Statistiques',
        'resources': 'Ressources',
        'users': 'Gestion des Utilisateurs',
        'settings': 'Paramètres Système',
        'production': 'Saisie Production Laitière',
        'production-reports': 'Rapports Production Laitière'
    };

    const pageTitle = document.getElementById('page-title');
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');

    if (pageTitle && titles[sectionId]) {
        pageTitle.textContent = titles[sectionId];
    }

    if (breadcrumbCurrent && titles[sectionId]) {
        breadcrumbCurrent.textContent = titles[sectionId];
    }
}

// Logout functionality
function logout() {
    showCustomConfirm('Êtes-vous sûr de vouloir vous déconnecter ?', async () => {
        // Play click sound
        try { playClickSound(); } catch (e) { }

        // Use authClient to clear tokens and reload
        await authClient.logout();
    });
}

// Custom Alert Modal
function showCustomAlert(message, type = 'info') {
    const modal = document.getElementById('customModal');
    const icon = document.getElementById('modalIcon');
    const title = document.getElementById('modalTitle');
    const messageEl = document.getElementById('modalMessage');
    const buttons = document.getElementById('modalButtons');

    // Set icon and color based on type
    const config = {
        'success': { 
            icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>', 
            color: '#28a745', 
            title: 'Succès' 
        },
        'error': { 
            icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>', 
            color: '#dc3545', 
            title: 'Erreur' 
        },
        'warning': { 
            icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>', 
            color: '#ffc107', 
            title: 'Attention' 
        },
        'info': { 
            icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>', 
            color: '#17a2b8', 
            title: 'Information' 
        }
    };

    const settings = config[type] || config['info'];

    icon.innerHTML = settings.icon;
    icon.style.background = settings.color;
    title.textContent = settings.title;
    messageEl.textContent = message;

    // Create OK button
    buttons.innerHTML = `
        <button class="modal-btn modal-btn-primary" onclick="closeCustomModal()">
            OK
        </button>
    `;

    modal.classList.add('show');

    try {
        if (type === 'success') playSuccessSound();
        else if (type === 'error') playErrorSound();
        else playClickSound();
    } catch (e) {
        console.log('Sound error:', e);
    }
}

// Custom Confirm Modal
function showCustomConfirm(message, onConfirm) {
    const modal = document.getElementById('customModal');
    const icon = document.getElementById('modalIcon');
    const title = document.getElementById('modalTitle');
    const messageEl = document.getElementById('modalMessage');
    const buttons = document.getElementById('modalButtons');

    icon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M11.07 12.85c.77-1.39 2.25-2.21 3.11-3.44.91-1.29.4-3.7-2.18-3.7-1.69 0-2.52 1.28-2.87 2.34L6.54 6.96C7.25 4.83 9.18 3 11.99 3c2.35 0 3.96 1.07 4.78 2.41.7 1.15 1.11 3.3.03 4.9-1.2 1.77-2.35 2.31-3.17 3.89h-2.56zm1.1 6.35c-1.16 0-2.11-.93-2.11-2.09 0-1.15.95-2.09 2.11-2.09 1.16 0 2.11.94 2.11 2.09 0 1.16-.95 2.09-2.11 2.09z"/></svg>';
    icon.style.background = '#17a2b8';
    title.textContent = 'Confirmation';
    messageEl.textContent = message;

    // Create Cancel and Confirm buttons
    buttons.innerHTML = `
        <button class="modal-btn modal-btn-secondary" onclick="closeCustomModal()">
            Annuler
        </button>
        <button class="modal-btn modal-btn-primary" onclick="confirmAction()">
            Confirmer
        </button>
    `;

    modal.classList.add('show');

    // Store callback
    window._confirmCallback = onConfirm;

    try {
        playClickSound();
    } catch (e) {
        console.log('Sound error:', e);
    }
}

// Confirm action
function confirmAction() {
    if (typeof window._confirmCallback === 'function') {
        window._confirmCallback();
        window._confirmCallback = null;
    }
    closeCustomModal();
}

// Close modal
function closeCustomModal() {
    const modal = document.getElementById('customModal');
    modal.classList.remove('show');
}

// Show modal (placeholder for future functionality)
function showModal() {
    alert('Fonctionnalité de modal à implémenter');
}

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
    // Initialize settings (theme, sound, volume)
    initSettings();

    // Hide main app on load, show login page
    document.querySelector('.app-container').style.display = 'none';

    // Show dashboard by default (when logged in)
    showSection('dashboard');

    // Add smooth scrolling to content sections
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach(section => {
        section.style.scrollBehavior = 'smooth';
    });

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                const searchTerm = this.value.trim();
                if (searchTerm) {
                    alert(`Recherche de: ${searchTerm}\n(Fonctionnalité à implémenter)`);
                }
            }
        });
    }

    // Notification button functionality
    const notificationBtn = document.querySelector('.btn-notification');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function () {
            try {
                playNotificationSound();
            } catch (e) {
                console.log('Sound error:', e);
            }
            alert('5 nouvelles notifications:\n\n1. Nouvelle demande de subvention\n2. Permis approuvé\n3. Document en attente de validation\n4. Rapport mensuel disponible\n5. Mise à jour système');
        });
    }

    // Add sound effects to primary buttons
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('click', function () {
            try {
                playClickSound();
            } catch (e) {
                console.log('Sound error:', e);
            }
        });
    });

    // Add sound effects to action buttons
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function () {
            try {
                playClickSound();
            } catch (e) {
                console.log('Sound error:', e);
            }
        });
    });

    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function () {
            try {
                playEditSound();
            } catch (e) {
                console.log('Sound error:', e);
            }
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function () {
            try {
                playDeleteSound();
            } catch (e) {
                console.log('Sound error:', e);
            }
        });
    });

    // Add hover sounds to navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('mouseenter', function () {
            if (!this.classList.contains('active')) {
                try {
                    playHoverSound();
                } catch (e) {
                    console.log('Sound error:', e);
                }
            }
        });
    });

    // Handle link clicks to prevent default navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
        });
    });
});

// Auto-update time display (for demonstration)
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // You can add a time display element in your HTML and update it here
    // For now, this is a placeholder for future functionality
}

// Update time every minute
setInterval(updateTime, 60000);

// Handle window resize for responsive behavior
window.addEventListener('resize', function () {
    // Add responsive logic here if needed
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth < 768 && sidebar) {
        // Handle mobile sidebar behavior if needed
    }
});

// Settings Management
let soundEnabled = true;
let soundVolume = 0.5; // 0 to 1 scale

// Initialize settings from localStorage
function initSettings() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedSound = localStorage.getItem('soundEnabled');
    const savedVolume = localStorage.getItem('soundVolume');

    // Apply theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    if (document.getElementById('themeSelect')) {
        document.getElementById('themeSelect').value = savedTheme;
    }

    // Initialize sidebar state
    initSidebar();

    // Apply sound settings
    if (savedSound !== null) {
        soundEnabled = savedSound === 'true';
        const soundToggle = document.getElementById('soundToggle');
        const soundLabel = document.getElementById('soundLabel');
        if (soundToggle) {
            soundToggle.checked = soundEnabled;
        }
        if (soundLabel) {
            soundLabel.textContent = soundEnabled ? 'Activé' : 'Désactivé';
        }
    }

    // Apply volume
    if (savedVolume !== null) {
        soundVolume = parseFloat(savedVolume);
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeValue = document.getElementById('volumeValue');
        if (volumeSlider) {
            volumeSlider.value = soundVolume * 100;
        }
        if (volumeValue) {
            volumeValue.textContent = Math.round(soundVolume * 100) + '%';
        }
    }

    // Initialize other settings toggles if they exist
    const notificationsToggle = document.getElementById('notificationsToggle');
    const autosaveToggle = document.getElementById('autosaveToggle');
    const updatesToggle = document.getElementById('updatesToggle');
    const languageSelect = document.getElementById('languageSelect');

    if (notificationsToggle) {
        const savedNotifications = localStorage.getItem('notificationsEnabled');
        notificationsToggle.checked = savedNotifications !== 'false';
    }

    if (autosaveToggle) {
        const savedAutosave = localStorage.getItem('autosaveEnabled');
        autosaveToggle.checked = savedAutosave !== 'false';
    }

    if (updatesToggle) {
        const savedUpdates = localStorage.getItem('autoUpdatesEnabled');
        updatesToggle.checked = savedUpdates !== 'false';
    }

    if (languageSelect) {
        const savedLanguage = localStorage.getItem('language') || 'fr';
        languageSelect.value = savedLanguage;
    }
}

// Change theme from settings page
function changeThemeFromSettings(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update theme button icon
    updateThemeIcon(theme);

    try {
        playClickSound();
    } catch (e) {
        console.log('Sound error:', e);
    }

    // Show confirmation
    showCustomAlert('Thème changé avec succès!', 'success');
}

// Toggle theme from topbar button
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Update theme button icon
    updateThemeIcon(newTheme);

    // Update settings dropdown if on settings page
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = newTheme;
    }

    try {
        playClickSound();
    } catch (e) {
        console.log('Sound error:', e);
    }
}

// Update theme icon
function updateThemeIcon(theme) {
    const themeButton = document.getElementById('themeToggle');
    if (themeButton) {
        if (theme === 'dark') {
            themeButton.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37a.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06a.996.996 0 000-1.41zM5.99 18.01l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41a.996.996 0 00-1.41 0z"/></svg>';
        } else {
            themeButton.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>';
        }
    }
}

// Toggle sidebar collapse/expand
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');

    if (sidebar && mainContent) {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');

        // Save state to localStorage
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);

        try {
            playClickSound();
        } catch (e) {
            console.log('Sound error:', e);
        }
    }
}

// Initialize sidebar state
function initSidebar() {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        if (sidebar) sidebar.classList.add('collapsed');
        if (mainContent) mainContent.classList.add('expanded');
    }
}

// Toggle sound on/off
function toggleSound(enabled) {
    soundEnabled = enabled;
    localStorage.setItem('soundEnabled', enabled);

    const label = document.getElementById('soundLabel');
    if (label) {
        label.textContent = enabled ? 'Activé' : 'Désactivé';
    }

    // Play sound if enabling
    if (enabled) {
        try {
            playClickSound();
        } catch (e) {
            console.log('Sound error:', e);
        }
    }
}

// Update volume
function updateVolume(value) {
    soundVolume = value / 100;
    localStorage.setItem('soundVolume', soundVolume);

    const volumeValue = document.getElementById('volumeValue');
    if (volumeValue) {
        volumeValue.textContent = Math.round(value) + '%';
    }

    // Test the new volume
    if (soundEnabled) {
        try {
            playClickSound();
        } catch (e) {
            console.log('Sound error:', e);
        }
    }
}

// Save settings
function saveSettings() {
    localStorage.setItem('settingsSaved', new Date().toISOString());

    try {
        playSuccessSound();
    } catch (e) {
        console.log('Sound error:', e);
    }

    showCustomAlert('Paramètres sauvegardés avec succès!', 'success');
}

// Reset settings to default
function resetSettings() {
    showCustomConfirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres?', () => {
        // Reset to defaults
        localStorage.setItem('theme', 'light');
        localStorage.setItem('soundEnabled', 'true');
        localStorage.setItem('soundVolume', '0.5');

        // Apply defaults
        document.documentElement.setAttribute('data-theme', 'light');
        soundEnabled = true;
        soundVolume = 0.5;

        // Update UI
        if (document.getElementById('themeSelect')) {
            document.getElementById('themeSelect').value = 'light';
        }
        if (document.getElementById('soundToggle')) {
            document.getElementById('soundToggle').checked = true;
            document.getElementById('soundLabel').textContent = 'Activé';
        }
        if (document.getElementById('volumeSlider')) {
            document.getElementById('volumeSlider').value = 50;
            document.getElementById('volumeValue').textContent = '50%';
        }

        try {
            playSuccessSound();
        } catch (e) {
            console.log('Sound error:', e);
        }

        showCustomAlert('Paramètres réinitialisés avec succès!', 'success');
    });
}

// Language change
function changeLanguage(lang) {
    localStorage.setItem('language', lang);
    showCustomAlert(`Langue changée en ${lang === 'fr' ? 'Français' : lang === 'ar' ? 'العربية' : 'English'}`, 'success');
    // In a real app, this would reload the UI with translated strings
}

// Toggle notifications
function toggleNotifications(enabled) {
    localStorage.setItem('notificationsEnabled', enabled);
    if (enabled && 'Notification' in window) {
        Notification.requestPermission();
    }
    showCustomAlert(enabled ? 'Notifications activées' : 'Notifications désactivées', 'info');
}

// Toggle autosave
function toggleAutosave(enabled) {
    localStorage.setItem('autosaveEnabled', enabled);
    showCustomAlert(enabled ? 'Sauvegarde automatique activée' : 'Sauvegarde automatique désactivée', 'info');
}

// Clear cache
function clearCache() {
    showCustomConfirm('Êtes-vous sûr de vouloir vider le cache?', () => {
        // Clear localStorage except for essential settings
        const essentialKeys = ['theme', 'language', 'soundEnabled', 'soundVolume'];
        const backup = {};
        essentialKeys.forEach(key => {
            backup[key] = localStorage.getItem(key);
        });

        localStorage.clear();

        essentialKeys.forEach(key => {
            if (backup[key]) localStorage.setItem(key, backup[key]);
        });

        showCustomAlert('Cache vidé avec succès!', 'success');
    });
}

// Export data
function exportData() {
    const data = {
        settings: {
            theme: localStorage.getItem('theme'),
            language: localStorage.getItem('language'),
            soundEnabled: localStorage.getItem('soundEnabled'),
            soundVolume: localStorage.getItem('soundVolume')
        },
        exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bureau-controle-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showCustomAlert('Données exportées avec succès!', 'success');
}

// Toggle auto updates
function toggleAutoUpdates(enabled) {
    localStorage.setItem('autoUpdatesEnabled', enabled);
    showCustomAlert(enabled ? 'Mises à jour automatiques activées' : 'Mises à jour automatiques désactivées', 'info');
}

// Check for updates
function checkUpdates() {
    showCustomAlert('Vous utilisez la dernière version (v1.0.0)', 'info');
    // In a real app, this would check a server for updates
}

// Override sound functions to respect settings
const originalPlayClickSound = typeof playClickSound !== 'undefined' ? playClickSound : () => { };
const originalPlaySuccessSound = typeof playSuccessSound !== 'undefined' ? playSuccessSound : () => { };
const originalPlayErrorSound = typeof playErrorSound !== 'undefined' ? playErrorSound : () => { };
const originalPlayNavigationSound = typeof playNavigationSound !== 'undefined' ? playNavigationSound : () => { };

// Wrap sound functions to check settings
if (typeof window !== 'undefined') {
    const wrapSoundFunction = (originalFunc) => {
        return function () {
            if (soundEnabled && originalFunc) {
                // Apply volume (if the sound function supports it)
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const gainNode = audioContext.createGain();
                gainNode.gain.value = soundVolume;
                originalFunc.call(this, ...arguments);
            }
        };
    };

    // Note: This wrapping approach is simplified. The actual volume control
    // would need to be integrated into the sound generation functions in sounds.js
}

// Initialize dashboard (called when dashboard page loads)
function initDashboard(silent = false) {
    if (!document.querySelector('.stats-grid')) return; // Not on dashboard
    
    // In a real app, this would fetch stats from the backend
    // For now, if users.js is loaded, we can update some stats there
    if (typeof loadUsers === 'function') {
        loadUsers(true);
    }
}

// Export functions for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showSection,
        logout,
        showModal,
        changeThemeFromSettings,
        toggleSound,
        updateVolume,
        saveSettings,
        resetSettings,
        initSettings,
        initDashboard
    };
} else {
    window.initDashboard = initDashboard;
}
