// State Management
let currentMutuelles = [];

// State Management Helpers
function saveDashboardState(state) {
    const currentState = JSON.parse(localStorage.getItem('mutuelle_dashboard_state') || '{}');
    const newState = { ...currentState, ...state };
    localStorage.setItem('mutuelle_dashboard_state', JSON.stringify(newState));
}

function getDashboardState() {
    return JSON.parse(localStorage.getItem('mutuelle_dashboard_state') || '{}');
}

function clearDashboardState() {
    localStorage.removeItem('mutuelle_dashboard_state');
}

// Fragment loading helper
async function loadFragment(url) {
    try {
        const response = await fetch(url);
        return await response.text();
    } catch (error) {
        console.error(`Error loading fragment ${url}:`, error);
        return `<p style="color: red; padding: 20px;">Erreur de chargement du fragment: ${url}</p>`;
    }
}

async function initMutuellePage() {
    try {
        const content = document.getElementById('mutuelleMainContent');
        if (!content) return;

        // Ensure we have the latest list from server
        try {
            currentMutuelles = await mutuelleClient.getAll() || [];
        } catch (err) {
            console.error('Failed to fetch mutuelles:', err);
            // Fallback empty if needed
        }

        const state = getDashboardState();

        if (state.selectedMutuelleId) {
            // Seamless restoration: load details directly
            await viewMutuelleDetails(state.selectedMutuelleId, true);

            if (state.activeCategory) {
                renderSubSelection(state.activeCategory);
            }

            if (state.isLaborForceOpen) {
                await handleOptionClick('اليد العاملة', true);
                if (state.laborYear) {
                    const select = document.getElementById('yearSelect');
                    if (select) select.value = state.laborYear;
                    changeLaborYear(state.laborYear);
                }
            }
        } else {
            // Load the list grid fragment normally
            content.innerHTML = await loadFragment('pages/mutuelle/mutuelle_list.html');
            renderMutuelles(currentMutuelles);
        }
    } catch (error) {
        console.error('Error initializing mutuelle page:', error);
    }
}


function renderMutuelles(mutuelles) {
    const grid = document.getElementById('mutuelleCardGrid');
    if (!grid) return;

    if (!mutuelles || mutuelles.length === 0) {
        grid.innerHTML = `
            <div style="text-align: center; padding: 4rem; width: 100%; grid-column: 1 / -1;">
                <p style="color: #888;">Aucune mutuelle trouvée.</p>
            </div>
        `;
        return;
    }

    const defaultBg = 'https://via.placeholder.com/400x200?text=Mutuelle';
    const defaultLogo = 'https://via.placeholder.com/100?text=Logo';
    const colors = ['green', 'blue', 'orange', 'purple', 'red'];

    // Backend base URL for images
    const backendURL = 'http://localhost:3000';

    grid.innerHTML = mutuelles.map((m, index) => {
        const colorClass = colors[index % colors.length];
        const dateStr = m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A';
        const cardId = `hero-card-${m._id}`;

        // Convert relative URLs to absolute URLs
        const imageUrl = m.imageUrl ? (m.imageUrl.startsWith('http') ? m.imageUrl : `${backendURL}${m.imageUrl}`) : defaultBg;
        const logoUrl = m.logoUrl ? (m.logoUrl.startsWith('http') ? m.logoUrl : `${backendURL}${m.logoUrl}`) : defaultLogo;

        return `
            <div id="${cardId}" class="hero ${colorClass}">
                <button class="hero-delete-btn" title="Supprimer" onclick="deleteMutuelle('${m._id}')">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
                <img class="hero-profile-img" src="${imageUrl}" alt="Background" 
                     crossorigin="anonymous" onload="applyDynamicColor(this, '${cardId}')">
                <div class="hero-description-bk"></div>
                <div class="hero-logo">
                    <img src="${logoUrl}" alt="Logo">
                </div>
                <div class="hero-description">
                    <p>${m.name}</p>
                </div>
                <div class="hero-date">
                    <p>${m.address || dateStr}</p>
                </div>
                <div class="hero-btn">
                    <a href="#" onclick="viewMutuelleDetails('${m._id}')">Membres</a>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Extracts average color from image and applies it to the card background
 */
function applyDynamicColor(img, cardId) {
    try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 10; // Low resolution for averaging
        canvas.height = 10;

        context.drawImage(img, 0, 0, 10, 10);
        const data = context.getImageData(0, 0, 10, 10).data;

        let r = 0, g = 0, b = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        const card = document.getElementById(cardId);
        if (card) {
            const bk = card.querySelector('.hero-description-bk');
            if (bk) {
                // Apply a gradient based on the extracted color
                // Primary: extracted, Secondary: darker version
                const secondary = `rgb(${Math.floor(r * 0.7)}, ${Math.floor(g * 0.7)}, ${Math.floor(b * 0.7)})`;
                bk.style.backgroundImage = `linear-gradient(135deg, rgb(${r},${g},${b}), ${secondary})`;
                bk.style.backgroundColor = `rgb(${r},${g},${b})`;
            }
        }
    } catch (e) {
        console.warn('Could not extract color (CORS or other issue):', e);
    }
}

// Enhanced Add Mutuelle Modal with file uploads
function showAddMutuelleModal() {
    const modal = document.getElementById('customModal');
    const icon = document.getElementById('modalIcon');
    const title = document.getElementById('modalTitle');
    const messageEl = document.getElementById('modalMessage');
    const buttons = document.getElementById('modalButtons');

    icon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 14H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2z"/></svg>';
    icon.style.background = '#d61c1cff';
    title.textContent = 'Ajouter une Mutuelle';
    
    messageEl.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Nom de la mutuelle *</label>
                <input type="text" id="mutuelle_name" class="form-input" placeholder="Ex: Mutuelle des Plaines" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" required>
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Adresse</label>
                <input type="text" id="mutuelle_address" class="form-input" placeholder="Ex: Béja - Cultures Céréalières" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Image de fond</label>
                <input type="file" id="mutuelle_image" accept="image/*" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" onchange="previewImage(this, 'imagePreview')">
                <div id="imagePreview" style="margin-top: 0.5rem; max-width: 200px; max-height: 150px; overflow: hidden; border-radius: 4px; display: none;">
                    <img style="width: 100%; height: auto;" />
                </div>
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Logo</label>
                <input type="file" id="mutuelle_logo" accept="image/*" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" onchange="previewImage(this, 'logoPreview')">
                <div id="logoPreview" style="margin-top: 0.5rem; max-width: 100px; max-height: 100px; overflow: hidden; border-radius: 4px; display: none;">
                    <img style="width: 100%; height: auto;" />
                </div>
            </div>
        </div>
    `;

    buttons.innerHTML = `
        <button class="modal-btn modal-btn-secondary" onclick="closeCustomModal()">Annuler</button>
        <button class="modal-btn modal-btn-primary" onclick="submitAddMutuelle()">Ajouter</button>
    `;

    modal.classList.add('show');
    
    // Focus first input
    setTimeout(() => {
        const input = document.getElementById('mutuelle_name');
        if (input) input.focus();
    }, 100);
}

function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    const img = preview.querySelector('img');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.style.display = 'none';
    }
}

async function submitAddMutuelle() {
    const name = document.getElementById('mutuelle_name')?.value.trim();
    const address = document.getElementById('mutuelle_address')?.value.trim();
    const imageFile = document.getElementById('mutuelle_image')?.files[0];
    const logoFile = document.getElementById('mutuelle_logo')?.files[0];

    if (!name) {
        showCustomAlert('Le nom de la mutuelle est requis', 'error');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('name', name);
        if (address) formData.append('address', address);
        if (imageFile) formData.append('imageFile', imageFile);
        if (logoFile) formData.append('logoFile', logoFile);

        await mutuelleClient.createWithFiles(formData);
        closeCustomModal(); // Only close on success
        await initMutuellePage();
        showCustomAlert('Mutuelle ajoutée avec succès !', 'success');
    } catch (error) {
        // Don't close modal on error - let user fix the issue
        showCustomAlert('Erreur: ' + error.message, 'error');
    }
}

window.submitAddMutuelle = submitAddMutuelle;
window.previewImage = previewImage;

async function deleteMutuelle(id) {
    showCustomConfirm('Voulez-vous vraiment supprimer cette mutuelle ?', async () => {
        try {
            await mutuelleClient.delete(id);
            initMutuellePage();
            showCustomAlert('Mutuelle supprimée', 'success');
        } catch (error) {
            showCustomAlert('Erreur: ' + error.message, 'error');
        }
    });
}

// View mutuelle details - Transition to sub-selection
async function viewMutuelleDetails(id, isAutoRestore = false) {
    let mutuelle = currentMutuelles.find(m => m._id === id);
    if (!mutuelle) {
        // Try fetching it if not in cache (e.g. direct link or fresh reload)
        try {
            mutuelle = await mutuelleClient.getById(id);
        } catch (e) {
            console.error('Could not find mutuelle:', id);
            return;
        }
    }

    if (!isAutoRestore) {
        saveDashboardState({ selectedMutuelleId: id });
        // Play navigation sound only on user click
        try { if (typeof playNavigationSound === 'function') playNavigationSound(); } catch (e) { }
    }

    const content = document.getElementById('mutuelleMainContent');
    if (content) {
        // Load the details fragment
        content.innerHTML = await loadFragment('pages/mutuelle/mutuelle_details.html');

        const headerTitle = document.getElementById('selectedMutuelleName');
        const headerLogo = document.getElementById('selectedMutuelleLogo');
        if (headerTitle) headerTitle.textContent = mutuelle.name;
        
        if (headerLogo && mutuelle.logoUrl) {
            const backendURL = 'http://localhost:3000';
            headerLogo.src = mutuelle.logoUrl.startsWith('http') ? mutuelle.logoUrl : `${backendURL}${mutuelle.logoUrl}`;
            headerLogo.style.display = 'block';
        }

        // Initialize the sub-selection view
        renderSubSelection('all');

        // Trigger Lucide icons
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}


// Render the formal professional dashboard
// Helper for Ultra-Pro Highlighting


function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

// Render the formal professional dashboard
function renderSubSelection(categoryFilter = 'all', searchQuery = '') {
    const grid = document.getElementById('selectionGrid');
    const sidebar = document.getElementById('dashboardSidebar');
    if (!grid || !sidebar) return;

    saveDashboardState({ activeCategory: categoryFilter, isLaborForceOpen: false });

    const options = [
        { label: 'الإنتاج النباتي', icon: 'sprout', desc: 'Gestion des cultures et récoltes', category: 'production' },
        { label: 'تربية الماشية', icon: 'beef', desc: 'Suivi du bétail et santé animale', category: 'production' },
        { label: 'حليب أبقار', icon: 'milk', desc: 'Collecte et qualité du lait', category: 'production' },
        { label: 'عجول و عجلات', icon: 'baby', desc: 'Gestion du jeune bétail', category: 'production' },
        { label: 'أراضي', icon: 'map', desc: 'Cadastre et exploitation des sols', category: 'foncier' },
        { label: 'قراطل', icon: 'package-2', desc: 'Stockage et logistique', category: 'logistique' },
        { label: 'أغنام لحم', icon: 'drumstick', desc: 'Production ovine bouchère', category: 'production' },
        { label: 'أغنام حليب', icon: 'droplets', desc: 'Production laitière ovine', category: 'production' },
        { label: 'قاعدة البيانات', icon: 'database', desc: 'Analyses et statistiques', category: 'admin' },
        { label: 'اليد العاملة', icon: 'users', desc: 'Gestion des RH et ouvriers', category: 'admin' },
        { label: 'الورشة', icon: 'cog', desc: 'Maintenance et équipement', category: 'logistique' },
        { label: 'قائمة الأسعار', icon: 'tags', desc: 'Tarification et économie', category: 'admin' },
        { label: 'قطيع الأبقار', icon: 'clipboard-list', desc: 'Inventaire détaillé bovin', category: 'production' },
        { label: 'قطيع الأغنام', icon: 'clipboard-list', desc: 'Inventaire détaillé ovin', category: 'production' },
        { label: 'الأعلاف', icon: 'wheat', desc: 'Nutrition et stocks fourragers', category: 'logistique' },
        { label: 'أعباء أخرى', icon: 'file-text', desc: 'Frais divers et comptabilité', category: 'admin' }
    ];

    const categories = [
        { id: 'all', label: 'Toutes les Actions', icon: 'layout-grid' },
        { id: 'production', label: 'Production Animale', icon: 'sprout' },
        { id: 'foncier', label: 'Foncier & Terres', icon: 'map' },
        { id: 'logistique', label: 'Logistique & Ateliers', icon: 'truck' },
        { id: 'admin', label: 'Administration & RH', icon: 'settings' }
    ];

    // Render Sidebar
    sidebar.innerHTML = categories.map(cat => `
        <div class="sidebar-item ${categoryFilter === cat.id ? 'active' : ''}" onclick="renderSubSelection('${cat.id}')">
            <i data-lucide="${cat.icon}" style="width: 18px; height: 18px;"></i>
            <span>${cat.label}</span>
        </div>
    `).join('');

    // Filter and Render Options
    let filteredOptions = categoryFilter === 'all'
        ? options
        : options.filter(opt => opt.category === categoryFilter);

    // Clear previous suggestion
    const suggestionEl = document.getElementById('searchSuggestion');
    if (suggestionEl) suggestionEl.style.display = 'none';

    // Apply search query if provided (Fuzzy Search)
    if (searchQuery && typeof Fuse !== 'undefined') {
        const fuseOptions = {
            keys: ['label', 'desc'],
            threshold: 0.4, // Balanced for fuzzy matching
            distance: 100,
            location: 0,
            minMatchCharLength: 1,
            includeScore: true, // Needed for suggestions
            ignoreLocation: true,
            findAllMatches: true
        };

        const fuse = new Fuse(filteredOptions, fuseOptions);
        const results = fuse.search(searchQuery);

        // Show "Did you mean?" if results are empty but something close exists overall
        if (results.length === 0 && searchQuery.length > 2) {
            const globalFuse = new Fuse(options, { keys: ['label'], threshold: 0.6 });
            const globalResults = globalFuse.search(searchQuery);
            if (globalResults.length > 0 && suggestionEl) {
                const suggestion = globalResults[0].item.label;
                suggestionEl.innerHTML = `Voulez-vous dire: <strong onclick="applySuggestion('${suggestion}')">${suggestion}</strong> ?`;
                suggestionEl.style.display = 'block';
            }
        }

        filteredOptions = results.map(r => r.item);
    } else if (searchQuery) {
        // Fallback to simple includes if Fuse is not available
        const query = searchQuery.toLowerCase().trim();
        filteredOptions = filteredOptions.filter(opt =>
            opt.label.toLowerCase().includes(query) ||
            opt.desc.toLowerCase().includes(query)
        );
    }

    if (filteredOptions.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; animation: fadeInUp 0.5s ease;">
                <div style="background: #f8f9fa; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <i data-lucide="search-x" style="width: 40px; height: 40px; color: #adb5bd;"></i>
                </div>
                <h3 style="font-weight: 700; color: #212529; margin-bottom: 10px;">Aucun résultat trouvé</h3>
                <p style="color: #6c757d; margin-bottom: 25px;">Nous n'avons trouvé aucune action correspondant à "<strong>${searchQuery}</strong>".</p>
                <button class="btn-back-formal" onclick="clearSearch()" style="margin: 0 auto; display: flex;">
                    <span>Réinitialiser la recherche</span>
                </button>
            </div>
        `;
    } else {
        grid.innerHTML = filteredOptions.map((opt, index) => `
            <div class="formal-action-card" onclick="handleOptionClick('${opt.label}')" style="animation-delay: ${index * 0.05}s">
                <div class="action-card-icon">
                    <i data-lucide="${opt.icon}"></i>
                </div>
                <div class="action-card-text">
                    <div class="action-card-title">${highlightText(opt.label, searchQuery)}</div>
                    <div class="action-card-desc">${highlightText(opt.desc, searchQuery)}</div>
                </div>
            </div>
        `).join('');
    }

    // Initialize Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Handle option click
// Dynamic labor data - fetched from API
let laborYearlyData = {};
let laborChart = null;
let categoryChart = null;
let budgetChart = null;
let wageChart = null;
let compositionChart = null;

// Helper to parse French/Locale formatted numbers (e.g. "1 234,567" -> 1234.567)
function parseProFloat(str) {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    const clean = str.toString().replace(/\s/g, '').replace(/,/g, '.');
    return parseFloat(clean) || 0;
}

// Helper to get current year
function getCurrentYear() {
    return new Date().getFullYear();
}

// Fetch labor data for a specific mutuelle and year
async function fetchLaborData(mutuelleId, year) {
    if (!year || year === 'null' || year === 'undefined') {
        year = getCurrentYear();
    }
    
    try {
        console.log(`Fetching labor data for Mutuelle: ${mutuelleId}, Year: ${year}`);
        const url = `http://localhost:3000/api/mutuelles/${mutuelleId}/labor-data?year=${year}`;
        console.log('Request URL:', url);
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        
        if (!response.ok) {
            console.error('API Error:', response.status, response.statusText);
            throw new Error('Failed to fetch labor data');
        }
        
        const data = await response.json();
        console.log('API Response Data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching labor data:', error);
        return [];
    }
}

// Fetch available years for a mutuelle
async function fetchAvailableYears(mutuelleId) {
    try {
        const response = await fetch(`http://localhost:3000/api/mutuelles/${mutuelleId}/labor-data/years`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch years');
        const years = await response.json();
        return years.length > 0 ? years : [getCurrentYear()];
    } catch (error) {
        console.error('Error fetching years:', error);
        return [getCurrentYear()];
    }
}

// Backward compatible
async function fetchAvailableSeasons(mutuelleId) {
    return fetchAvailableYears(mutuelleId);
}

// Transform API data to display format
function transformLaborData(apiData) {
    const categories = {};
    let totalDays = 0;
    let totalGross = 0;
    let totalSocial = 0;

    apiData.forEach(item => {
        if (!categories[item.category]) {
            categories[item.category] = {
                cat: item.category,
                days: 0,
                gross: 0,
                social: 0
            };
        }
        categories[item.category].days += item.workDays;
        categories[item.category].gross += item.grossSalary;
        categories[item.category].social += item.socialCoverage;
        
        totalDays += item.workDays;
        totalGross += item.grossSalary;
        totalSocial += item.socialCoverage;
    });

    const data = Object.values(categories).map(cat => ({
        cat: cat.cat,
        days: cat.days.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        gross: cat.gross.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
        social: cat.social.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
        total: (cat.gross + cat.social).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
        avg: cat.days > 0 ? ((cat.gross + cat.social) / cat.days).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : '0.000'
    }));

    const total = {
        cat: 'الجملة',
        days: totalDays.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        gross: totalGross.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
        social: totalSocial.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
        total: (totalGross + totalSocial).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
        avg: '—'
    };

    return { data, total };
}

// Handle action search
function handleActionSearch(query) {
    const state = getDashboardState();
    renderSubSelection(state.activeCategory || 'all', query);
}

// Apply search suggestion
function applySuggestion(word) {
    const input = document.getElementById('actionSearchInput');
    if (input) {
        input.value = word;
        handleActionSearch(word);
    }
}

function clearSearch() {
    const input = document.getElementById('actionSearchInput');
    if (input) {
        input.value = '';
        handleActionSearch('');
        input.focus();
    }
}

// Pro Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl + K or Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('actionSearchInput');
        if (input) input.focus();
    }
    // Esc to clear search if focused
    if (e.key === 'Escape') {
        const input = document.getElementById('actionSearchInput');
        if (input === document.activeElement) {
            clearSearch();
        }
    }
});

// Dynamic Year Selector Rendering
function renderYearSelector(availableYears, activeYear) {
    const container = document.getElementById('laborYearButtons');
    if (!container) return;

    container.innerHTML = availableYears.map(year => {
        const isActive = year === activeYear || year.toString() === activeYear.toString();
        const style = isActive
            ? 'background: #c41a14; color: #fff; box-shadow: 0 4px 10px rgba(196, 26, 20, 0.2);'
            : 'background: transparent; color: #495057;';

        return `
            <button class="year-btn ${isActive ? 'active' : ''}" 
                    id="year-btn-${year}"
                    onclick="handleYearChange(this, '${year}')" 
                    style="border: none; padding: 6px 16px; border-radius: 9px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); white-space: nowrap; ${style}">
                ${year}
            </button>
        `;
    }).join('');

    // Ensure active year is visible
    setTimeout(() => {
        const activeBtn = document.getElementById(`year-btn-${activeYear}`);
        if (activeBtn) {
            activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, 100);
}

window.handleYearChange = async (btn, year) => {
    document.querySelectorAll('.year-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#495057';
        b.style.boxShadow = 'none';
    });
    
    btn.classList.add('active');
    btn.style.background = '#c41a14';
    btn.style.color = '#fff';
    btn.style.boxShadow = '0 4px 10px rgba(196, 26, 20, 0.2)';
    
    // Smooth scroll current selection into view
    btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    
    const state = getDashboardState();
    saveDashboardState({ laborYear: year });
    
    // Reload the appropriate view with new year
    if (state.isLaborForceOpen) {
        await renderLaborForceTable(year);
    } else if (state.isWorkshopOpen && window.renderWorkshopTable) {
        window.renderWorkshopTable(year);
    } else if (state.isFodderOpen && window.renderFodderTable) {
        window.renderFodderTable(year);
    }
};

// Handle option click
async function handleOptionClick(label, isAutoRestore = false) {
    if (!isAutoRestore) {
        try { if (typeof playSuccessSound === 'function') playSuccessSound(); } catch (e) { }
    }

    const state = getDashboardState();
    const mutuelleId = state.selectedMutuelleId;
    if (!mutuelleId) {
        showCustomAlert('Veuillez sélectionner une mutuelle', 'error');
        return;
    }

    const addBtn = document.getElementById('addLaborDataBtn');
    if (addBtn) addBtn.style.display = 'none';

    const currentYear = state.laborYear || new Date().getFullYear();

    if (label === 'اليد العاملة') {
        const searchGroup = document.getElementById('actionSearchGroup');
        if (searchGroup) searchGroup.style.display = 'none';

        if (!isAutoRestore) saveDashboardState({ isLaborForceOpen: true, isWorkshopOpen: false, isFodderOpen: false });

        const years = await fetchAvailableYears(mutuelleId);
        const currentYear = getCurrentYear();
        const yearToShow = (years.length > 0) ? (years.includes(currentYear) || years.includes(currentYear.toString()) ? currentYear : years[0]) : getCurrentYear();
        
        saveDashboardState({ laborYear: yearToShow });
        renderYearSelector(years, yearToShow);
        await renderLaborForceTable(yearToShow);

        // Pre-fetch all years so the trend chart shows the full line immediately
        for (const y of years) {
            if (!laborYearlyData[y]) {
                const yearlyApiData = await fetchLaborData(mutuelleId, y);
                if (yearlyApiData && yearlyApiData.length > 0) {
                    laborYearlyData[y] = transformLaborData(yearlyApiData);
                }
            }
        }
        renderLaborTrendChart(); // Refresh chart after all data is in

        const yearSelector = document.getElementById('laborYearSelector');
        const addBtn = document.getElementById('addLaborDataBtn');
        if (yearSelector) yearSelector.style.display = 'flex';
        if (addBtn) addBtn.style.display = 'flex';

    } else if (label === 'الورشة') {
        const searchGroup = document.getElementById('actionSearchGroup');
        if (searchGroup) searchGroup.style.display = 'none';

        const sidebar = document.getElementById('dashboardSidebar');
        if (sidebar) sidebar.style.display = 'none';

        const years = window.workshopYearlyData ? Object.keys(workshopYearlyData).sort().reverse() : [new Date().getFullYear()];
        const yearToShow = years.includes(currentYear.toString()) ? currentYear : years[0];
        
        saveDashboardState({ isWorkshopOpen: true, isLaborForceOpen: false, isFodderOpen: false, laborYear: yearToShow });
        renderYearSelector(years, yearToShow);

        const grid = document.getElementById('selectionGrid');
        const laborContainer = document.getElementById('laborForceContainer');
        const headerSub = document.querySelector('.header-sub-title');
        const yearSelector = document.getElementById('laborYearSelector');

        if (grid && laborContainer) {
            laborContainer.innerHTML = await loadFragment('pages/mutuelle/workshop.html');
            grid.style.display = 'none';
            laborContainer.style.display = 'block';
            if (headerSub) headerSub.textContent = 'Indicateurs de Production / الورشة';
            if (yearSelector) yearSelector.style.display = 'flex';

            if (window.renderWorkshopTable) window.renderWorkshopTable(yearToShow);
            if (window.lucide) lucide.createIcons();
        }
    } else if (label === 'الأعلاف') {
        const searchGroup = document.getElementById('actionSearchGroup');
        if (searchGroup) searchGroup.style.display = 'none';

        const sidebar = document.getElementById('dashboardSidebar');
        if (sidebar) sidebar.style.display = 'none';

        const years = window.fodderYearlyData ? Object.keys(fodderYearlyData).sort().reverse() : [new Date().getFullYear()];
        const yearToShow = years.includes(currentYear.toString()) ? currentYear : years[0];

        saveDashboardState({ isFodderOpen: true, isWorkshopOpen: false, isLaborForceOpen: false, laborYear: yearToShow });
        renderYearSelector(years, yearToShow);

        const grid = document.getElementById('selectionGrid');
        const laborContainer = document.getElementById('laborForceContainer');
        const headerSub = document.querySelector('.header-sub-title');
        const yearSelector = document.getElementById('laborYearSelector');

        if (grid && laborContainer) {
            laborContainer.innerHTML = await loadFragment('pages/mutuelle/fodder.html');
            grid.style.display = 'none';
            laborContainer.style.display = 'block';
            if (headerSub) headerSub.textContent = 'Indicateurs d\'Alimentation / الأعلاف';
            if (yearSelector) yearSelector.style.display = 'flex';

            if (window.renderFodderTable) window.renderFodderTable(yearToShow);
            if (window.lucide) lucide.createIcons();
        }
    }
 else if (label === 'قطيع الأبقار') {
        const searchGroup = document.getElementById('actionSearchGroup');
        if (searchGroup) searchGroup.style.display = 'none';

        const sidebar = document.getElementById('dashboardSidebar');
        if (sidebar) sidebar.style.display = 'none';

        const grid = document.getElementById('selectionGrid');
        const laborContainer = document.getElementById('laborForceContainer');
        const headerSub = document.querySelector('.header-sub-title');

        if (grid && laborContainer) {
            laborContainer.innerHTML = await loadFragment('pages/mutuelle/cattle_herd.html');
            grid.style.display = 'none';
            laborContainer.style.display = 'block';
            if (headerSub) headerSub.textContent = 'Indicateurs de Production / قطيع الأبقار';
            if (window.lucide) lucide.createIcons();
        }
    } else if (label === 'الإنتاج النباتي') {
        const searchGroup = document.getElementById('actionSearchGroup');
        if (searchGroup) searchGroup.style.display = 'none';

        const sidebar = document.getElementById('dashboardSidebar');
        if (sidebar) sidebar.style.display = 'none';

        const grid = document.getElementById('selectionGrid');
        const laborContainer = document.getElementById('laborForceContainer');
        const headerSub = document.querySelector('.header-sub-title');

        if (grid && laborContainer) {
            laborContainer.innerHTML = await loadFragment('pages/mutuelle/plant_production.html');
            grid.style.display = 'none';
            laborContainer.style.display = 'block';
            if (headerSub) headerSub.textContent = 'Indicateurs de Production / الإنتاج النباتي';
            if (window.lucide) lucide.createIcons();
        }
    } else {
        const yearSelector = document.getElementById('laborYearSelector');
        if (yearSelector) yearSelector.style.display = 'none';
        showCustomAlert(`Ouverture de: ${label}`, 'info');
    }
}

// Change year and update view
function changeLaborYear(year) {
    saveDashboardState({ laborYear: year });

    const state = getDashboardState();
    if (state.isWorkshopOpen) {
        if (window.renderWorkshopTable) window.renderWorkshopTable(year);
    } else if (state.isFodderOpen) {
        if (window.renderFodderTable) window.renderFodderTable(year);
    } else {
        renderLaborForceTable(year);
    }
}

// Render the Labor Force (اليد العاملة) formal table and analytics
async function renderLaborForceTable(year) {
    if (!year) {
        const state = getDashboardState();
        year = state.laborYear || getCurrentYear();
    }
    const grid = document.getElementById('selectionGrid');
    const laborContainer = document.getElementById('laborForceContainer');
    const headerSub = document.querySelector('.header-sub-title');

    if (!grid || !laborContainer) return;

    // Load the Labor Force template if it's missing the required placeholders
    const placeholdersExist = document.getElementById('laborTableBody');
    if (!placeholdersExist) {
        laborContainer.innerHTML = await loadFragment('pages/mutuelle/labor_force.html');
    }

    grid.style.display = 'none';
    laborContainer.style.display = 'block';

    // Hide sidebar content for better focus
    const sidebar = document.getElementById('dashboardSidebar');
    if (sidebar) sidebar.style.display = 'none';

    if (headerSub) headerSub.textContent = `Indicateurs de la Main d'œuvre / ${year}`;

    // Fetch dynamic data
    const state = getDashboardState();
    const mutuelleId = state.selectedMutuelleId;
    if (!mutuelleId) return;

    // Use cached data if available to prevent duplicate fetches
    let transformedData = laborYearlyData[year];
    
    if (!transformedData) {
        const apiData = await fetchLaborData(mutuelleId, year);
        if (!apiData || apiData.length === 0) {
            // Show empty state or zeros if no data
            const tableBody = document.getElementById('laborTableBody');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">Aucune donnée disponible pour cette année</td></tr>';
            }
            document.getElementById('stat-total-days').textContent = '0';
            document.getElementById('stat-mass-salary').textContent = '0 DT';
            document.getElementById('stat-social-cover').textContent = '0 DT';
            return;
        }
        transformedData = transformLaborData(apiData);
        laborYearlyData[year] = transformedData;
    }

    const { data, total } = transformedData;

    // Update Summary Stats with animation
    animateDashboardValue('stat-total-days', total.days);
    animateDashboardValue('stat-mass-salary', total.total, ' DT');
    animateDashboardValue('stat-social-cover', total.social, ' DT');

    // Re-trigger entrance animation for stat cards
    document.querySelectorAll('.summary-stat-card').forEach(card => {
        card.style.animation = 'none';
        card.offsetHeight; // trigger reflow
        card.style.animation = null; 
    });

    const tableBody = document.getElementById('laborTableBody');

    // Render Table Body
    if (tableBody) {
        tableBody.innerHTML = `
            ${data.map(row => `
                <tr>
                    <td style="font-weight: 700;">${row.cat}</td>
                    <td>${row.days}</td>
                    <td style="font-family: monospace;">${row.gross}</td>
                    <td style="font-family: monospace;">${row.social}</td>
                    <td style="font-family: monospace; font-weight: 600;">${row.total}</td>
                    <td><span class="metric-badge">${row.avg}</span></td>
                </tr>
            `).join('')}
            <tr class="total-row">
                <td style="text-align: center;">${total.cat}</td>
                <td>${total.days}</td>
                <td>${total.gross}</td>
                <td>${total.social}</td>
                <td>${total.total}</td>
                <td style="color: #6c757d;">${total.avg}</td>
            </tr>
        `;
    }

    // Render the charts after the DOM is updated
    setTimeout(() => {
        renderLaborTrendChart();
        renderLaborCategoryChart();
        renderLaborBudgetChart();
        renderLaborWageChart();
        renderLaborCompositionChart();
    }, 100);
}

// Render trend chart using Chart.js
function renderLaborTrendChart() {
    const ctx = document.getElementById('laborTrendChart');
    if (!ctx) return;

    if (laborChart) {
        laborChart.destroy();
    }

    // Get all years that have data in our cache
    const labels = Object.keys(laborYearlyData).sort();
    
    const payrollData = labels.map(year => {
        const yearData = laborYearlyData[year];
        return yearData ? parseProFloat(yearData.total.total) : 0;
    });

    laborChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Masse Salariale Totale (DT)',
                data: payrollData,
                borderColor: '#c41a14ff',
                backgroundColor: 'rgba(196, 26, 20, 0.05)',
                borderWidth: 3,
                pointBackgroundColor: '#212529',
                pointBorderColor: '#c41a14ff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.35,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: '#f0f0f0' },
                    ticks: { font: { size: 10, weight: '600' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 10, weight: '600' } }
                }
            }
        }
    });
}

// Render worker category distribution chart using Chart.js
function renderLaborCategoryChart() {
    const ctx = document.getElementById('laborCategoryChart');
    if (!ctx) return;

    if (categoryChart) {
        categoryChart.destroy();
    }

    // Get current year from state
    const state = getDashboardState();
    const currentYear = state.laborYear || getCurrentYear();
    const currentData = laborYearlyData[currentYear];
    
    if (!currentData) return;

    const labels = currentData.data.map(row => row.cat);
    const totalDays = parseProFloat(currentData.total.days);
    const distributionData = currentData.data.map(row => {
        const days = parseProFloat(row.days);
        return ((days / totalDays) * 100).toFixed(1);
    });

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: distributionData,
                backgroundColor: [
                    '#c41a14ff', // متعاضد (Vibrant Red)
                    '#2563eb',   // عامل قار (Modern Blue)
                    '#059669'    // عامل عرضي (Emerald Green)
                ],
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: { size: 11, weight: '600' }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return ` ${context.label}: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });
}

// Render budget allocation chart
function renderLaborBudgetChart() {
    const ctx = document.getElementById('laborBudgetChart');
    if (!ctx) return;
    if (budgetChart) budgetChart.destroy();

    const state = getDashboardState();
    const currentYear = state.laborYear || getCurrentYear();
    const currentData = laborYearlyData[currentYear];
    
    if (!currentData) return;

    const labels = currentData.data.map(row => row.cat);
    const totalCost = currentData.data.reduce((sum, row) => sum + parseProFloat(row.total), 0);
    const budgetData = currentData.data.map(row => {
        const cost = parseProFloat(row.total);
        return ((cost / totalCost) * 100).toFixed(1);
    });

    budgetChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: budgetData,
                backgroundColor: [
                    '#7c3aed', // Purple
                    '#ea580c', // Orange
                    '#0d9488'  // Teal
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, font: { weight: '600', size: 10 } } }
            }
        }
    });
}

// Render wage comparison bar chart
function renderLaborWageChart() {
    const ctx = document.getElementById('laborWageChart');
    if (!ctx) return;
    if (wageChart) wageChart.destroy();

    const state = getDashboardState();
    const currentYear = state.laborYear || getCurrentYear();
    const currentData = laborYearlyData[currentYear];
    
    if (!currentData) return;

    const labels = currentData.data.map(row => row.cat);
    const wageData = currentData.data.map(row => parseProFloat(row.avg));

    wageChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Moyenne Journalière',
                data: wageData,
                backgroundColor: [
                    '#ca8a04', // Gold
                    '#be123c', // Crimson
                    '#047857'  // Emerald
                ],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f0f0f0' }, ticks: { font: { weight: '600' } } },
                x: { grid: { display: false }, ticks: { font: { weight: '600' } } }
            }
        }
    });
}

// Render financial composition (Gross vs Social) stacked bar chart
function renderLaborCompositionChart() {
    const ctx = document.getElementById('laborCompositionChart');
    if (!ctx) return;
    if (compositionChart) compositionChart.destroy();

    const state = getDashboardState();
    const currentYear = state.laborYear || getCurrentYear();
    const currentData = laborYearlyData[currentYear];
    
    if (!currentData) return;

    const labels = currentData.data.map(row => row.cat);
    const grossData = currentData.data.map(row => {
        const days = parseProFloat(row.days);
        return days > 0 ? parseProFloat(row.gross) / days : 0;
    });
    const socialData = currentData.data.map(row => {
        const days = parseProFloat(row.days);
        return days > 0 ? parseProFloat(row.social) / days : 0;
    });

    compositionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { 
                    label: 'Brut', 
                    data: grossData, 
                    backgroundColor: [
                        '#c41a14ff', // Red
                        '#2563eb',   // Blue
                        '#059669'    // Green
                    ] 
                },
                { 
                    label: 'Social', 
                    data: socialData, 
                    backgroundColor: [
                        '#fbbf24', // Amber/Yellow
                        '#fb923c', // Orange
                        '#a78bfa'  // Violet/Purple
                    ] 
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { stacked: true, grid: { display: false }, ticks: { font: { weight: '600' } } },
                y: { stacked: true, grid: { color: '#f0f0f0' }, ticks: { font: { weight: '600' } } }
            },
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, font: { weight: '600', size: 10 } } }
            }
        }
    });
}


// Consolidated navigation: handles back from Labor Force AND back to Grid
async function goBackToGrid() {
    // Play back sound
    try { if (typeof playClickSound === 'function') playClickSound(); } catch (e) { }

    const laborContainer = document.getElementById('laborForceContainer');
    const selectionGrid = document.getElementById('selectionGrid');
    const headerSub = document.querySelector('.header-sub-title');
    const yearSelector = document.getElementById('laborYearSelector');

    // Go back from detail view to main grid
    // 1. If we are in the Labor Force view, go back to the sub-selection grid
    if (laborContainer && laborContainer.style.display === 'block') {
        saveDashboardState({ isLaborForceOpen: false });
        laborContainer.style.display = 'none';

        // Show search bar back
        const searchGroup = document.getElementById('actionSearchGroup');
        if (searchGroup) searchGroup.style.display = 'block';

        const sidebar = document.getElementById('dashboardSidebar');
        if (sidebar) sidebar.style.display = 'flex';

        if (selectionGrid) selectionGrid.style.display = 'grid';
        if (headerSub) headerSub.textContent = 'Gestion de Mutuelle';
        if (yearSelector) yearSelector.style.display = 'none';
        
        const addBtn = document.getElementById('addLaborDataBtn');
        if (addBtn) addBtn.style.display = 'none';
        return;
    }

    // 2. Otherwise, we are in the sub-selection grid, so go back to the main Mutuelle List
    const content = document.getElementById('mutuelleMainContent');
    if (content) {
        clearDashboardState();
        // Reload the grid fragment
        content.innerHTML = await loadFragment('pages/mutuelle/mutuelle_list.html');

        // Re-fetch and render mutuelles
        try {
            currentMutuelles = await mutuelleClient.getAll() || [];
        } catch (e) { console.error(e); }
        
        renderMutuelles(currentMutuelles);

        // Trigger Lucide icons
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// Handle Herd Action
function handleHerdAction(label) {
    if (label === 'قطيع الأبقار') {
        renderSubSelection('production');
        goBackToGrid();
    } else {
        showCustomAlert(`Action du troupeau: ${label}`, 'info');
    }
}

// Expose functions to global scope
window.initMutuellePage = initMutuellePage;
window.showAddMutuelleModal = showAddMutuelleModal;
window.deleteMutuelle = deleteMutuelle;
window.viewMutuelleDetails = viewMutuelleDetails;
window.goBackToGrid = goBackToGrid;
window.handleOptionClick = handleOptionClick;
window.changeLaborYear = changeLaborYear;
// Show Add Labor Data Modal
async function showAddLaborModal() {
    const modal = document.getElementById('customModal');
    const icon = document.getElementById('modalIcon');
    const title = document.getElementById('modalTitle');
    const messageEl = document.getElementById('modalMessage');
    const buttons = document.getElementById('modalButtons');

    if (!modal || !title || !messageEl || !buttons) return;

    title.textContent = 'Ajouter Données de Main d\'œuvre';
    icon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="white" stroke-width="2" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>';
    icon.style.background = '#c41a14';

    const state = getDashboardState();
    const currentYear = state.laborYear || getCurrentYear();

    messageEl.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 15px; padding: 10px;">
            <div class="form-group" style="text-align: left;">
                <label style="display: block; margin-bottom: 5px; font-weight: 700; color: #212529;">Année</label>
                <input type="number" id="laborInputYear" class="form-input" value="${currentYear}" style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #e9ecef; box-sizing: border-box;">
            </div>
            <div class="form-group" style="text-align: left;">
                <label style="display: block; margin-bottom: 5px; font-weight: 700; color: #212529;">Catégorie</label>
                <select id="laborInputCategory" class="form-input" style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #e9ecef; background: #fff; box-sizing: border-box;">
                    <option value="متعاضد">متعاضد</option>
                    <option value="عامل قار">عامل قار</option>
                    <option value="عامل عرضي">عامل عرضي</option>
                </select>
            </div>
            <div class="form-group" style="text-align: left;">
                <label style="display: block; margin-bottom: 5px; font-weight: 700; color: #212529;">Nombre de Jours</label>
                <input type="number" id="laborInputDays" class="form-input" placeholder="Ex: 1500" style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #e9ecef; box-sizing: border-box;">
            </div>
            <div class="form-group" style="text-align: left;">
                <label style="display: block; margin-bottom: 5px; font-weight: 700; color: #212529;">Salaire Brut Total (DT)</label>
                <input type="number" id="laborInputGross" class="form-input" placeholder="Ex: 50000" style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #e9ecef; box-sizing: border-box;">
            </div>
            <div class="form-group" style="text-align: left;">
                <label style="display: block; margin-bottom: 5px; font-weight: 700; color: #212529;">Couverture Sociale (DT)</label>
                <input type="number" id="laborInputSocial" class="form-input" placeholder="Ex: 10000" style="width: 100%; padding: 10px; border-radius: 10px; border: 1px solid #e9ecef; box-sizing: border-box;">
            </div>
        </div>
    `;

    buttons.innerHTML = `
        <button class="modal-btn" onclick="closeCustomModal()" style="background: #f8f9fa; color: #495057; border: 1px solid #dee2e6;">Annuler</button>
        <button class="modal-btn" onclick="submitLaborData()" style="background: #c41a14; color: #fff; border: none;">Enregistrer</button>
    `;

    modal.classList.add('show');
}

// Submit Labor Data to Backend
async function submitLaborData() {
    const year = parseInt(document.getElementById('laborInputYear').value);
    const category = document.getElementById('laborInputCategory').value;
    const workDays = parseFloat(document.getElementById('laborInputDays').value);
    const grossSalary = parseFloat(document.getElementById('laborInputGross').value);
    const socialCoverage = parseFloat(document.getElementById('laborInputSocial').value);

    if (isNaN(year) || isNaN(workDays) || isNaN(grossSalary) || isNaN(socialCoverage)) {
        showCustomAlert('Veuillez remplir tous les champs avec des valeurs valides', 'error');
        return;
    }

    const state = getDashboardState();
    const mutuelleId = state.selectedMutuelleId;
    if (!mutuelleId) return;

    try {
        await mutuelleClient.addLaborData(mutuelleId, {
            mutuelle_id: mutuelleId,
            year,
            category,
            workDays,
            grossSalary,
            socialCoverage
        });

        if (typeof closeCustomModal === 'function') closeCustomModal();
        showCustomAlert('Données enregistrées avec succès', 'success');
        
        // Refresh the table and clear cache for this year
        delete laborYearlyData[year];
        renderLaborForceTable(year);
        
        // Refresh trend chart as well
        const years = await fetchAvailableYears(mutuelleId);
        renderYearSelector(years, year);
    } catch (error) {
        console.error('Error saving labor data:', error);
        showCustomAlert('Erreur lors de l\'enregistrement: ' + error.message, 'error');
    }
}

window.handleActionSearch = handleActionSearch;
window.clearSearch = clearSearch;
window.applySuggestion = applySuggestion;
window.handleHerdAction = handleHerdAction;
window.showAddLaborModal = showAddLaborModal;
window.submitLaborData = submitLaborData;

// Stats Animation Helper
window.animateDashboardValue = (id, endVal, suffix = '') => {
    const obj = document.getElementById(id);
    if (!obj) return;
    const end = parseFloat(endVal.replace(/[^0-9.,]/g, '').replace(',', '.'));
    if (isNaN(end)) {
        obj.textContent = endVal;
        return;
    }
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();
    const update = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        const current = (end * easeOutExpo(progress)).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        obj.textContent = `${current}${suffix}`;
        if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
};
