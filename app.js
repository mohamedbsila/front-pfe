// Login functionality
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('Login attempt:', username, password); // Debug
    
    // Demo credentials (in production, this would be handled by backend)
    if (username === 'admin' && password === 'admin123') {
        console.log('Login successful!'); // Debug
        
        // Play success sound (with error handling)
        try {
            playSuccessSound();
        } catch(e) {
            console.log('Sound error:', e);
        }
        
        // Hide login page
        document.getElementById('loginPage').style.display = 'none';
        
        // Show main app
        document.querySelector('.app-container').style.display = 'flex';
        
        // Load dashboard
        if (typeof loadPage === 'function') {
            loadPage('dashboard');
        }
    } else {
        console.log('Login failed!'); // Debug
        
        // Play error sound (with error handling)
        try {
            playErrorSound();
        } catch(e) {
            console.log('Sound error:', e);
        }
        
        // Show error via custom modal or alert
        if (typeof showCustomAlert === 'function') {
            showCustomAlert('Nom d\'utilisateur ou mot de passe incorrect', 'error');
        } else {
            alert('Nom d\'utilisateur ou mot de passe incorrect');
        }
    }
}

// Navigation functionality
function showSection(sectionId) {
    // Play navigation sound
    try {
        playNavigationSound();
    } catch(e) {
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
        'settings': 'Paramètres Système'
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
    showCustomConfirm('Êtes-vous sûr de vouloir vous déconnecter ?', () => {
        // Play click sound
        try {
            playClickSound();
        } catch(e) {
            console.log('Sound error:', e);
        }
        
        // Hide main app
        document.querySelector('.app-container').style.display = 'none';
        
        // Show login page
        document.getElementById('loginPage').style.display = 'block';
        
        // Reset form
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
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
        'success': { icon: '✓', color: '#28a745', title: 'Succès' },
        'error': { icon: '✕', color: '#dc3545', title: 'Erreur' },
        'warning': { icon: '⚠', color: '#ffc107', title: 'Attention' },
        'info': { icon: 'ℹ', color: '#17a2b8', title: 'Information' }
    };
    
    const settings = config[type] || config['info'];
    
    icon.textContent = settings.icon;
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
    } catch(e) {
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
    
    icon.textContent = '?';
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
    } catch(e) {
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
document.addEventListener('DOMContentLoaded', function() {
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
        searchInput.addEventListener('keypress', function(event) {
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
        notificationBtn.addEventListener('click', function() {
            try {
                playNotificationSound();
            } catch(e) {
                console.log('Sound error:', e);
            }
            alert('5 nouvelles notifications:\n\n1. Nouvelle demande de subvention\n2. Permis approuvé\n3. Document en attente de validation\n4. Rapport mensuel disponible\n5. Mise à jour système');
        });
    }

    // Add sound effects to primary buttons
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('click', function() {
            try {
                playClickSound();
            } catch(e) {
                console.log('Sound error:', e);
            }
        });
    });

    // Add sound effects to action buttons
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function() {
            try {
                playClickSound();
            } catch(e) {
                console.log('Sound error:', e);
            }
        });
    });

    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            try {
                playEditSound();
            } catch(e) {
                console.log('Sound error:', e);
            }
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            try {
                playDeleteSound();
            } catch(e) {
                console.log('Sound error:', e);
            }
        });
    });

    // Add hover sounds to navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                try {
                    playHoverSound();
                } catch(e) {
                    console.log('Sound error:', e);
                }
            }
        });
    });

    // Handle link clicks to prevent default navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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
window.addEventListener('resize', function() {
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
        if (document.getElementById('soundToggle')) {
            document.getElementById('soundToggle').checked = soundEnabled;
            document.getElementById('soundLabel').textContent = soundEnabled ? 'Activé' : 'Désactivé';
        }
    }
    
    // Apply volume
    if (savedVolume !== null) {
        soundVolume = parseFloat(savedVolume);
        if (document.getElementById('volumeSlider')) {
            document.getElementById('volumeSlider').value = soundVolume * 100;
            document.getElementById('volumeValue').textContent = Math.round(soundVolume * 100) + '%';
        }
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
    } catch(e) {
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
    } catch(e) {
        console.log('Sound error:', e);
    }
}

// Update theme icon
function updateThemeIcon(theme) {
    const themeButton = document.getElementById('themeToggle');
    if (themeButton) {
        themeButton.textContent = theme === 'dark' ? '☀️' : '🌙';
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
        } catch(e) {
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
        } catch(e) {
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
        } catch(e) {
            console.log('Sound error:', e);
        }
    }
}

// Save settings
function saveSettings() {
    localStorage.setItem('settingsSaved', new Date().toISOString());
    
    try {
        playSuccessSound();
    } catch(e) {
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
        } catch(e) {
            console.log('Sound error:', e);
        }
        
        showCustomAlert('Paramètres réinitialisés avec succès!', 'success');
    });
}

// Override sound functions to respect settings
const originalPlayClickSound = typeof playClickSound !== 'undefined' ? playClickSound : () => {};
const originalPlaySuccessSound = typeof playSuccessSound !== 'undefined' ? playSuccessSound : () => {};
const originalPlayErrorSound = typeof playErrorSound !== 'undefined' ? playErrorSound : () => {};
const originalPlayNavigationSound = typeof playNavigationSound !== 'undefined' ? playNavigationSound : () => {};

// Wrap sound functions to check settings
if (typeof window !== 'undefined') {
    const wrapSoundFunction = (originalFunc) => {
        return function() {
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
        initSettings
    };
}
