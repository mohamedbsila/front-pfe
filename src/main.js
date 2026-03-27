/**
 * Main Entry Point - Modular Architecture
 * Replaces the old monolithic app.js, api-client.js, auth-client.js, users.js, mutuelle.js
 */

// Import all modules
import { authService, authStore, LoginForm, RegisterForm, AuthToggle } from './Auth/index.js';
import { usersStore, UserTable, userModal, userDetails, userStats } from './Users/index.js';
import { mutuelleStore, laborDataStore, workshopDataStore, MutuelleList, MutuelleDetails, SubSelection, LaborForceTable, WorkshopTable, addMutuelleModal, YearSelector, initPlantProduction } from './Mutuelle/index.js';
import { plantsApi, plantVarietiesApi, productionRecordsApi, addPlantModal } from './PlantProd/index.js';
import { employesStore, EmployesTable } from './Employes/index.js';
import { apiClient, CustomModal, wsManager } from './shared/index.js';
import './config.js';

// Make available globally for backward compatibility
window.authService = authService;
window.authStore = authStore;
window.usersStore = usersStore;
window.mutuelleStore = mutuelleStore;
window.laborDataStore = laborDataStore;
window.workshopDataStore = workshopDataStore;
window.apiClient = apiClient;
window.plantsApi = plantsApi;
window.plantVarietiesApi = plantVarietiesApi;
window.productionRecordsApi = productionRecordsApi;
window.employesStore = employesStore;

// Export components to window for DOM access
window.LoginForm = LoginForm;
window.RegisterForm = RegisterForm;
window.AuthToggle = AuthToggle;
window.UserTable = UserTable;
window.userModal = userModal;
window.userDetails = userDetails;
window.userStats = userStats;
window.MutuelleList = MutuelleList;
window.MutuelleDetails = MutuelleDetails;
window.SubSelection = SubSelection;
window.LaborForceTable = LaborForceTable;
window.WorkshopTable = WorkshopTable;
window.addMutuelleModal = addMutuelleModal;
window.YearSelector = YearSelector;
window.CustomModal = CustomModal;

/**
 * Sub-section configuration map.
 * Each entry describes a Mutuelle sub-view that shares the same layout logic.
 */
const PAGE_MAPPING = {
    'dashboard': 'src/pages/dashboard.html',
    'mutuelle/mutuelle': 'src/Mutuelle/pages/mutuelle.html',
    'mutuelle': 'src/Mutuelle/pages/mutuelle.html',
    'employees': 'src/Employes/pages/employees.html',
    'programs': 'src/shared/pages/programs.html',
    'reports': 'src/shared/pages/reports.html',
    'resources': 'src/shared/pages/resources.html',
    'users': 'src/Users/pages/users.html',
    'settings': 'src/shared/pages/settings.html'
};

const SUB_SECTIONS = {
    'الأعلاف': {
        template: 'src/Mutuelle/pages/fodder.html',
        headerText: "Indicateurs d'Alimentation / الأعلاف",
        stateKey: 'isFodderOpen'
    },
    'قطيع الأبقار': {
        template: 'src/Mutuelle/pages/cattle_herd.html',
        headerText: 'Indicateurs de Production / قطيع الأبقار',
        stateKey: 'isCattleHerdOpen'
    },
    'الإنتاج النباتي': {
        template: 'src/Mutuelle/pages/plant_production.html',
        headerText: 'Indicateurs de Production / الإنتاج النباتي',
        stateKey: 'isPlantProductionOpen'
    }
};

// App initialization
class App {
    constructor() {
        this.authToggle = null;
        this.userTable = null;
        this.mutuelleList = null;
        this.socket = null;

        // Listen for unauthorized events from ApiClient
        window.addEventListener('auth:unauthorized', () => {
            console.warn('🔒 Session expired — redirecting to login');
            this.handleSessionExpired();
        });

        // Listen for logout events from AuthService
        window.addEventListener('auth:logout', () => {
            console.log('🔓 Logged out — showing login');
            this.closeWebSockets();
            this.initLogin();
        });
    }

    async init() {
        console.log('🚀 Initializing Modular App...');
        
        try {
            // Check authentication status (now validates token expiry)
            const isAuth = authService.isAuthenticated();
            console.log('🔐 Authentication status:', isAuth);
            
            if (isAuth) {
                console.log('✅ Already authenticated, loading main app...');
                await this.initMainApp();
            } else {
                // Token is missing or expired — clean up and show login
                if (localStorage.getItem('access_token')) {
                    console.log('⏰ Token expired, clearing session...');
                    authService.clearTokens();
                }
                console.log('🔓 Not authenticated, showing login...');
                await this.initLogin();
            }
        } catch (error) {
            console.error('❌ Error during initialization:', error);
            // Show login anyway as fallback
            await this.initLogin();
        }
    }

    /**
     * Handle session expiration triggered by a 401 API response.
     * Cleans up state and redirects to login without a full page reload.
     */
    async handleSessionExpired() {
        this.closeWebSockets();
        authService.clearTokens();
        await this.initLogin();
    }

    async initLogin() {
        console.log('📝 Initializing Auth Module...');
        
        // Hide main app
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.style.display = 'none';
        }
        
        const loginPage = document.getElementById('loginPage');
        
        // Load login page HTML
        try {
            const response = await fetch('src/Auth/pages/login.html');
            if (response.ok) {
                const html = await response.text();
                loginPage.innerHTML = html;
                loginPage.style.display = 'block';
                console.log('✅ Login page loaded');
            } else {
                throw new Error('Failed to load login page');
            }
        } catch (error) {
            console.error('Error loading login page:', error);
            // Show fallback login form directly
            loginPage.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5;">
                    <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 400px; width: 100%;">
                        <h2 style="text-align: center; color: #c41a14; margin-bottom: 1.5rem;">Bureau de Contrôle</h2>
                        <form onsubmit="event.preventDefault(); app.onLoginSuccess();">
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Email</label>
                                <input type="email" id="username" required style="width: 100%; padding: 0.75rem; border: 2px solid #e9ecef; border-radius: 8px;">
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Mot de passe</label>
                                <input type="password" id="password" required style="width: 100%; padding: 0.75rem; border: 2px solid #e9ecef; border-radius: 8px;">
                            </div>
                            <button type="submit" style="width: 100%; padding: 0.875rem; background: #c41a14; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Se connecter</button>
                        </form>
                    </div>
                </div>
            `;
            loginPage.style.display = 'block';
        }

        // Initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Initialize Auth Toggle if form exists
        const loginTitle = document.querySelector('.login-title');
        const loginForm = document.querySelector('.login-form');
        
        if (loginTitle && loginForm) {
            this.authToggle = new AuthToggle({
                titleSelector: '.login-title',
                formSelector: '.login-form',
                onSuccess: () => this.onLoginSuccess()
            });
            this.authToggle.init();
        }
    }

    async onLoginSuccess() {
        console.log('✅ Login successful!');
        
        try { playSuccessSound(); } catch (e) {}
        
        // Hide login page
        const loginPage = document.getElementById('loginPage');
        if (loginPage) {
            loginPage.style.display = 'none';
        }
        
        // Show main app
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.style.display = 'flex';
        }
        
        this.updateSidebarFooter();
        await this.initMainApp();
    }

    async initMainApp() {
        console.log('🏠 Initializing Main App...');
        
        // Ensure login page is hidden and app container is shown
        const loginPage = document.getElementById('loginPage');
        if (loginPage) loginPage.style.display = 'none';
        
        const appContainer = document.querySelector('.app-container');
        if (appContainer) appContainer.style.display = 'flex';
        
        try {
            // Load sidebar and topbar components
            await this.loadComponents();
            
            // Initialize settings
            this.initSettings();
            
            // Initialize sidebar click handlers
            this.initSidebar();
            
            // Initialize WebSockets
            this.initWebSockets();
            
            // Load the last visited page or default to dashboard
            const lastPage = localStorage.getItem('lastPage') || 'dashboard';
            await this.loadPage(lastPage);
            
            console.log('✅ Main app initialized');
        } catch (error) {
            console.error('Error initializing main app:', error);
        }
        
        // Initialize modules based on current page
        // Wrapped in try/catch so a section error doesn't crash the whole app
        try {
            await this.initCurrentSection();
        } catch (sectionError) {
            console.warn('⚠️ Section init failed (non-fatal):', sectionError.message);
        }
    }

    async loadComponents() {
        console.log('📦 Loading components...');
        
        try {
            // Load sidebar
            const sidebarResponse = await fetch('src/shared/pages/layout/sidebar.html');
            const sidebarHtml = await sidebarResponse.text();
            document.getElementById('sidebarContainer').innerHTML = sidebarHtml;
            this.updateSidebarFooter();
            
            // Load topbar
            const topbarResponse = await fetch('src/shared/pages/layout/topbar.html');
            const topbarHtml = await topbarResponse.text();
            document.getElementById('topbarContainer').innerHTML = topbarHtml;
            
            console.log('✅ Components loaded');
            
            // Initialize Lucide icons after loading components
            if (window.lucide) {
                window.lucide.createIcons();
            }
        } catch (error) {
            console.error('Error loading components:', error);
        }
    }

    async loadPage(pageName) {
        console.log('📄 Loading page:', pageName);
        
        try {
            // Save to localStorage
            localStorage.setItem('lastPage', pageName);
            
            // Determine page path from mapping
            const pagePath = PAGE_MAPPING[pageName] || `pages/${pageName}.html`;
            
            // Load page content
            const response = await fetch(pagePath);
            const html = await response.text();
            document.getElementById('contentArea').innerHTML = html;
            
            // Update active nav item
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            const activeItem = document.querySelector(`[onclick*="loadPage('${pageName}')"]`);
            if (activeItem) {
                activeItem.classList.add('active');
            }
            
            // Update page title and breadcrumb
            const titles = {
                'dashboard': 'Tableau de Bord',
                'mutuelle/mutuelle': 'Gestion des Mutuelles',
                'mutuelle': 'Gestion des Mutuelles',
                'employees': 'Gestion des Employés',
                'programs': 'Programmes Agricoles',
                'reports': 'Rapports et Statistiques',
                'resources': 'Ressources',
                'users': 'Gestion des Utilisateurs',
                'settings': 'Paramètres Système'
            };
            
            const pageTitle = document.getElementById('page-title');
            const breadcrumbCurrent = document.getElementById('breadcrumb-current');
            
            if (pageTitle) pageTitle.textContent = titles[pageName] || pageName;
            if (breadcrumbCurrent) breadcrumbCurrent.textContent = titles[pageName] || pageName;
            
            // Play navigation sound
            try { playNavigationSound(); } catch(e) {}
            
            // Initialize Lucide icons
            if (window.lucide) {
                window.lucide.createIcons();
            }
            
            console.log('✅ Page loaded:', pageName);
        } catch (error) {
            console.error('Error loading page:', error);
            document.getElementById('contentArea').innerHTML = `
                <div style="text-align: center; padding: 4rem;">
                    <h3>Erreur de Chargement</h3>
                    <p style="color: #666; margin-top: 1rem;">Impossible de charger la page: ${pageName}</p>
                </div>
            `;
        }
    }

    // ---------- WebSocket Management ----------

    initWebSockets() {
        wsManager.connect();
        
        wsManager.on('user_changed', (data) => {
            console.log('Real-time user update received:', data);
            this.handleUserChange();
        });

        wsManager.on('plant_changed', (data) => {
            console.log('Real-time plant update received:', data);
            if (document.getElementById('plantCardsContainer')) {
                this.initPlantProductionSection();
            }
        });
    }

    closeWebSockets() {
        wsManager.disconnect();
    }

    async handleUserChange() {
        // Refresh users table if currently visible
        if (this.userTable) {
            try {
                await usersStore.loadUsers();
                const filteredUsers = usersStore.getFilteredUsers();
                this.userTable.render(filteredUsers);
            } catch (e) {
                console.warn('Could not refresh users on real-time update:', e);
            }
        }
    }

    // ---------- Settings & Sidebar ----------

    initSettings() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
        
        // Initialize sidebar state
        const savedSidebar = localStorage.getItem('sidebarCollapsed');
        if (savedSidebar === 'true') {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.querySelector('.main-content');
            if (sidebar) sidebar.classList.add('collapsed');
            if (mainContent) mainContent.classList.add('expanded');
        }
    }

    initSidebar() {
        // Add click handlers for nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                }
            });
        });
    }

    async showSection(sectionId) {
        console.log('📄 Showing section:', sectionId);
        
        // Play navigation sound
        try { playNavigationSound(); } catch (e) {}

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
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeNavItem = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Update page title
        const titles = {
            'dashboard': 'Tableau de Bord',
            'mutuelle': 'Gestion des Mutuelles',
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

        // Initialize section-specific functionality
        await this.initSection(sectionId);
    }

    async initSection(sectionId) {
        switch (sectionId) {
            case 'users':
                await this.initUsersPage();
                break;
            case 'mutuelle':
                await this.initMutuellePage();
                break;
            case 'employees':
                await this.initEmployeesPage();
                break;
            case 'dashboard':
                await this.initDashboard();
                break;
            default:
                console.log('Section not yet implemented:', sectionId);
        }
    }

    // ---------- Employes ----------

    async initEmployeesPage() {
        console.log('👷 Initializing Employees Page...');
        
        const filterEl = document.getElementById('employeeMutuelleFilter');
        if (!filterEl) return;

        // Load all mutuelles to populate filter
        await mutuelleStore.loadMutuelles();
        const mutuelles = mutuelleStore.getState().mutuelles;
        
        filterEl.innerHTML = '<option value="">Sélectionner une Mutuelle</option>' + 
            mutuelles.map(m => `<option value="${m._id}">${m.name}</option>`).join('');

        // Initialize table component
        this.employesTable = new EmployesTable('#employeesTableContainer');
        
        // Expose global callback
        window.onEmployeeMutuelleChange = async (mutuelleId) => {
            if (!mutuelleId) {
                document.getElementById('employeesTablePlaceholder').style.display = 'block';
                document.getElementById('employeesTableContainer').style.display = 'none';
                return;
            }

            document.getElementById('employeesTablePlaceholder').style.display = 'none';
            document.getElementById('employeesTableContainer').style.display = 'block';
            
            await employesStore.loadEmployes(mutuelleId);
            this.employesTable.render();
        };

        window.enrollEmployeeFace = (empId, empType) => {
            CustomModal.show(`L'interface d'enrôlement facial (FaceID) pour l'employé ${empId} est en cours de développement.`, 'info');
        };

        window.editEmployee = (empId, empType) => {
            CustomModal.show("L'interface de modification de l'employé est en cours de développement.", 'info');
        };
    }

    // ---------- Users ----------

    async initUsersPage() {
        console.log('👥 Initializing Users Page...');
        
        const tableContainer = document.querySelector('#usersTableBody');
        if (!tableContainer) return;

        // Initialize User Table
        this.userTable = new UserTable('.users-table-container');
        this.userTable.setCallbacks({
            onViewUser: async (userId) => {
                await userDetails.open(userId);
            },
            onEditUser: async (userId) => {
                await userModal.openEditModal(userId);
            }
        });

        // Load users
        await usersStore.loadUsers();
        
        // Render table
        const filteredUsers = usersStore.getFilteredUsers();
        this.userTable.render(filteredUsers);

        // Update stats
        const stats = usersStore.getStats();
        userStats.update(stats);
    }

    // ---------- Mutuelle ----------

    async initMutuellePage() {
        console.log('🌾 Initializing Mutuelle Page...');
        
        const content = document.getElementById('mutuelleMainContent');
        if (!content) return;

        // Initialize Mutuelle List
        this.mutuelleList = new MutuelleList('#mutuelleMainContent');
        this.mutuelleList.setOnSelectMutuelle(async (id) => {
            await this.showMutuelleDetails(id);
        });

        // Load mutuelles
        await mutuelleStore.loadMutuelles();
        
        // Render list
        await this.mutuelleList.render();
    }

    async showMutuelleDetails(mutuelleId) {
        console.log('📋 Showing Mutuelle Details:', mutuelleId);
        
        const content = document.getElementById('mutuelleMainContent');
        if (!content) return;

        // Select mutuelle
        await mutuelleStore.selectMutuelle(mutuelleId);
        
        // Render details view
        const details = new MutuelleDetails('#mutuelleMainContent');
        await details.render();
        
        // Initialize SubSelection
        const subSelection = new SubSelection('#mutuelleMainContent');
        subSelection.setOnOptionClick(async (label) => {
            await this.handleMutuelleOption(label);
        });
        subSelection.render();
    }

    async handleMutuelleOption(label) {
        console.log('🔧 Handling option:', label);
        
        if (label === 'اليد العاملة') {
            await this.showLaborForce();
        } else if (label === 'الورشة') {
            await this.showWorkshop();
        } else if (SUB_SECTIONS[label]) {
            await this.showSubSection(SUB_SECTIONS[label]);
        } else {
            CustomModal.show(`Ouverture de: ${label}`, 'info');
        }
    }

    /**
     * Generic method for sub-section views (workshop, fodder, cattle, plant production).
     * Eliminates the 4 near-identical show* methods.
     */
    async showSubSection({ template, headerText, stateKey }) {
        const content = document.getElementById('mutuelleMainContent');
        if (!content) return;

        if (stateKey) {
            mutuelleStore.saveDashboardState({ [stateKey]: true });
        }

        const grid = document.getElementById('selectionGrid');
        const laborContainer = document.getElementById('laborForceContainer');
        const sidebar = document.getElementById('dashboardSidebar');
        const searchGroup = document.getElementById('actionSearchGroup');

        if (grid && laborContainer) {
            try {
                const response = await fetch(template);
                laborContainer.innerHTML = await response.text();
                grid.style.display = 'none';
                if (sidebar) sidebar.style.display = 'none';
                if (searchGroup) searchGroup.style.display = 'none';
                laborContainer.style.display = 'block';
                
                const headerSub = document.querySelector('.header-sub-title');
                if (headerSub) headerSub.textContent = headerText;
                
                if (window.lucide) window.lucide.createIcons();

                if (template.includes('plant_production')) {
                    await this.initPlantProductionSection();
                }
            } catch (e) {
                console.error(`Error loading sub-section (${template}):`, e);
            }
        }
    }

    async initPlantProductionSection() {
        if (typeof initPlantProduction === 'function') {
            await initPlantProduction();
        }
    }

    getPlantIcon(category) {
        const icons = {
            'cereals': 'wheat',
            'legumes': 'box',
            'forage': 'leaf',
            'oilseeds': 'flower',
            'vegetables': 'carrot'
        };
        return icons[category?.toLowerCase()] || 'sprout';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async showLaborForce() {
        const content = document.getElementById('mutuelleMainContent');
        if (!content) return;

        mutuelleStore.saveDashboardState({ isLaborForceOpen: true });

        const state = mutuelleStore.getState();
        const mutuelleId = state.selectedMutuelleId;
        
        if (!mutuelleId) return;

        // Load years
        const years = await laborDataStore.loadAvailableYears(mutuelleId);
        const currentYear = state.dashboardState.laborYear || new Date().getFullYear();
        
        let laborForceTable;

        // Initialize Year Selector
        const yearSelector = new YearSelector('#laborYearButtons');
        yearSelector.setOnYearChange(async (year) => {
            mutuelleStore.saveDashboardState({ laborYear: year });
            const headerSub = document.querySelector('.header-sub-title');
            if (headerSub) headerSub.textContent = `Indicateurs de la Main d'œuvre / ${year}`;
            if (laborForceTable) await laborForceTable.render(year);
        });
        yearSelector.render(years, currentYear);

        // Load labor force template
        const grid = document.getElementById('selectionGrid');
        const laborContainer = document.getElementById('laborForceContainer');
        const sidebar = document.getElementById('dashboardSidebar');
        const searchGroup = document.getElementById('actionSearchGroup');
        
        if (grid && laborContainer) {
            try {
                const response = await fetch('src/Mutuelle/pages/labor_force.html');
                laborContainer.innerHTML = await response.text();
                grid.style.display = 'none';
                if (sidebar) sidebar.style.display = 'none';
                if (searchGroup) searchGroup.style.display = 'none';
                laborContainer.style.display = 'block';
                
                const headerSub = document.querySelector('.header-sub-title');
                if (headerSub) headerSub.textContent = `Indicateurs de la Main d'œuvre / ${currentYear}`;
                
                const yearSelectorEl = document.getElementById('laborYearSelector');
                if (yearSelectorEl) yearSelectorEl.style.display = 'flex';
                
                // Show Add Labor Data button
                const addBtn = document.getElementById('addLaborDataBtn');
                if (addBtn) addBtn.style.display = 'flex';
                
                // Hide Add Plant button
                const addPlantBtn = document.getElementById('addPlantBtn');
                if (addPlantBtn) addPlantBtn.style.display = 'none';
                
                // Initialize Labor Force Table
                laborForceTable = new LaborForceTable('#laborForceContainer');
                await laborForceTable.render(currentYear);
                
                if (window.lucide) window.lucide.createIcons();
                
            } catch (e) {
                console.error('Error loading labor force:', e);
            }
        }
    }

    async showWorkshop() {
        const content = document.getElementById('mutuelleMainContent');
        if (!content) return;

        mutuelleStore.saveDashboardState({ isWorkshopOpen: true });

        const state = mutuelleStore.getState();
        const mutuelleId = state.selectedMutuelleId;

        if (!mutuelleId) return;

        // Load available years
        const years = await workshopDataStore.loadAvailableYears(mutuelleId);
        const currentYear = state.dashboardState.workshopYear || new Date().getFullYear();

        let workshopTable;

        // Initialize Year Selector
        const yearSelector = new YearSelector('#laborYearButtons');
        yearSelector.setOnYearChange(async (year) => {
            mutuelleStore.saveDashboardState({ workshopYear: year });
            const headerSub = document.querySelector('.header-sub-title');
            if (headerSub) headerSub.textContent = `Indicateurs de Production / الورشة / ${year}`;
            if (workshopTable) await workshopTable.render(year);
        });
        yearSelector.render(years, currentYear);

        // Load workshop template
        const grid = document.getElementById('selectionGrid');
        const laborContainer = document.getElementById('laborForceContainer');
        const sidebar = document.getElementById('dashboardSidebar');
        const searchGroup = document.getElementById('actionSearchGroup');

        if (grid && laborContainer) {
            try {
                const response = await fetch('src/Mutuelle/pages/workshop.html');
                laborContainer.innerHTML = await response.text();
                grid.style.display = 'none';
                if (sidebar) sidebar.style.display = 'none';
                if (searchGroup) searchGroup.style.display = 'none';
                laborContainer.style.display = 'block';

                const headerSub = document.querySelector('.header-sub-title');
                if (headerSub) headerSub.textContent = `Indicateurs de Production / الورشة / ${currentYear}`;

                const yearSelectorEl = document.getElementById('laborYearSelector');
                if (yearSelectorEl) yearSelectorEl.style.display = 'flex';

                // Initialize Workshop Table component
                workshopTable = new WorkshopTable('#laborForceContainer');
                await workshopTable.render(currentYear);

                if (window.lucide) window.lucide.createIcons();

            } catch (e) {
                console.error('Error loading workshop:', e);
            }
        }
    }

    // ---------- Dashboard ----------

    async initDashboard() {
        console.log('📊 Initializing Dashboard...');
        // Dashboard is mostly static, just trigger any needed updates
    }

    async initCurrentSection() {
        // Get current page from localStorage or default to dashboard
        const lastPage = localStorage.getItem('lastPage') || 'dashboard';
        console.log('🔧 Initializing section:', lastPage);
        
        // Initialize based on the current page
        if (lastPage === 'users') {
            await this.initUsersPage();
        } else if (lastPage === 'mutuelle/mutuelle' || lastPage === 'mutuelle') {
            await this.initMutuellePage();
        } else if (lastPage === 'dashboard') {
            await this.initDashboard();
        } else if (lastPage === 'settings') {
            this.initSettings();
        }
    }

    // ---------- Theme ----------

    updateThemeIcon(theme) {
        const themeButton = document.getElementById('themeToggle');
        if (themeButton) {
            if (theme === 'dark') {
                themeButton.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z"/></svg>';
            } else {
                themeButton.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>';
            }
        }
    }

    // ---------- Actions ----------

    logout() {
        CustomModal.confirm('Êtes-vous sûr de vouloir vous déconnecter ?', async () => {
            try { playClickSound(); } catch (e) {}
            await authService.logout();
        });
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);

        try { playClickSound(); } catch (e) {}
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');

        if (sidebar && mainContent) {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');

            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);

            try { playClickSound(); } catch (e) {}
        }
    }

    goBack() {
        const laborContainer = document.getElementById('laborForceContainer');
        const selectionGrid = document.getElementById('selectionGrid');
        const yearSelector = document.getElementById('laborYearSelector');

        if (laborContainer && (laborContainer.style.display === 'block' || laborContainer.style.display === 'flex')) {
            // Go back from detail view to sub-selection
            mutuelleStore.saveDashboardState({
                isLaborForceOpen: false,
                isWorkshopOpen: false,
                isFodderOpen: false,
                isCattleHerdOpen: false,
                isPlantProductionOpen: false
            });
            laborContainer.style.display = 'none';

            const searchGroup = document.getElementById('actionSearchGroup');
            if (searchGroup) searchGroup.style.display = 'block';

            const sidebar = document.getElementById('dashboardSidebar');
            if (sidebar) sidebar.style.display = 'flex';

            if (selectionGrid) selectionGrid.style.display = 'grid';

            const headerSub = document.querySelector('.header-sub-title');
            if (headerSub) headerSub.textContent = 'Gestion de Mutuelle';

            if (yearSelector) yearSelector.style.display = 'none';

            const addBtn = document.getElementById('addLaborDataBtn');
            if (addBtn) addBtn.style.display = 'none';

            const addPlantBtn = document.getElementById('addPlantBtn');
            if (addPlantBtn) addPlantBtn.style.display = 'none';
        } else if (selectionGrid && (selectionGrid.style.display === 'grid' || selectionGrid.style.display === '')) {
            // Go back to mutuelle list
            this.initMutuellePage();
        }
    }

    updateSidebarFooter() {
        const state = authStore.getState();
        let userName = state.userName;

        // ✅ Fallback: Use email prefix if name is missing (e.g. "bsila.mohamd@gmail.com" -> "bsila mohamd")
        if (!userName && state.userEmail) {
            userName = state.userEmail.split('@')[0].replace(/\./g, ' ');
        }
        
        userName = userName || 'Utilisateur';
        const userRole = state.userRole || 'Utilisateur';
        
        const avatarEl = document.getElementById('sidebarUserAvatar');
        const nameEl = document.getElementById('sidebarUserName');
        const roleEl = document.getElementById('sidebarUserRole');
        
        if (nameEl) nameEl.textContent = userName;
        if (roleEl) roleEl.textContent = userRole.charAt(0).toUpperCase() + userRole.slice(1);
        if (avatarEl) {
            const initials = userName
                .split(' ')
                .filter(n => n.length > 0)
                .map(n => n[0].toUpperCase())
                .join('')
                .substring(0, 2);
            avatarEl.textContent = initials || '??';
        }
    }
}

// Create global app instance
const app = new App();
window.app = app;

// Expose global functions for HTML onclick handlers
window.loadPage = async function(pageName) {
    await app.loadPage(pageName);
    try {
        await app.initCurrentSection();
    } catch (e) {
        console.warn('Section init failed:', e.message);
    }
};

window.loadComponent = async function(url, containerId) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        document.getElementById(containerId).innerHTML = html;
    } catch (error) {
        console.error('Error loading component:', error);
    }
};

window.toggleSidebar = function() {
    app.toggleSidebar();
};

window.toggleTheme = function() {
    app.toggleTheme();
};

window.logout = function() {
    app.logout();
};

window.goBack = function() {
    app.goBack();
};

window.showAddPlantModal = function() {
    addPlantModal.open();
};

window.showAddLaborModal = function() {
    CustomModal.show("L'interface d'ajout de données de main d'œuvre est en cours de développement.", "info");
};

window.handleOptionClick = async function(label) {
    await app.handleMutuelleOption(label);
};

window.viewMutuelleDetails = async function(id) {
    await app.showMutuelleDetails(id);
};

window.renderSubSelection = function(category, search) {
    app.renderSubSelection(category, search);
};

window.initWebSockets = function() {
    app.initWebSockets();
};

window.closeWebSockets = function() {
    app.closeWebSockets();
};

// Function to start the app
async function startApp() {
    console.log('📦 Starting App...');
    
    // Add loading indicator to body
    const loader = document.createElement('div');
    loader.id = 'app-loader';
    loader.innerHTML = '<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:#fff;display:flex;justify-content:center;align-items:center;z-index:9999;"><h2 style="color:#c41a14;">Chargement...</h2></div>';
    document.body.appendChild(loader);
    
    await app.init();
    
    // Remove loading indicator
    const loaderEl = document.getElementById('app-loader');
    if (loaderEl) loaderEl.remove();
    
    console.log('✅ App loaded successfully');
}

// Ensure the code runs regardless of when the module was loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    // DOMContentLoaded has already fired, start directly
    startApp();
}

// Export for module usage
export default app;