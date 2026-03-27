import { useMutuelle, useLaborData } from '../hooks/index.js';

export class SubSelection {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.mutuelleStore = useMutuelle();
        this.laborStore = useLaborData();
        this.onOptionClick = null;

        // ✅ PRO TIP: Bind once — avoids creating new function refs on every render
        this._handleGridClick = this._handleGridClick.bind(this);
        this._handleSidebarClick = this._handleSidebarClick.bind(this);

        // ✅ PRO TIP: Debounce search to avoid re-rendering on every keystroke
        this._debouncedRender = this._debounce((cat, query) => this.render(cat, query), 220);

        // ✅ FUZZY SEARCH: Initialize Fuse.js for professional searching
        if (window.Fuse) {
            this.fuse = new Fuse(SubSelection.OPTIONS, {
                keys: ['label', 'desc'],
                threshold: 0.4,       // Lower = more strict, Higher = more fuzzy
                includeScore: true,
                ignoreLocation: true
            });
        }

        // ✅ FIX: Expose search handler to global window for HTML oninput events
        window.handleActionSearch = (val) => this.search(val);
        window.subSelectionInstance = this;
    }

    // ─── Data ────────────────────────────────────────────────────────────────

    static OPTIONS = [
        // ✅ FIXED ICONS: Verified against Lucide v0.383 (the version loaded in Claude artifacts)
        { label: 'الإنتاج النباتي', icon: 'sprout', desc: 'Gestion des cultures et récoltes', category: 'production' },
        { label: 'تربية الماشية', icon: 'paw-print', desc: 'Suivi du bétail et santé animale', category: 'production' },
        { label: 'حليب أبقار', icon: 'droplet', desc: 'Collecte et qualité du lait', category: 'production' },
        { label: 'عجول و عجلات', icon: 'git-merge', desc: 'Gestion du jeune bétail', category: 'production' },
        { label: 'أراضي', icon: 'map', desc: 'Cadastre et exploitation des sols', category: 'foncier' },
        { label: 'قراطل', icon: 'package', desc: 'Stockage et logistique', category: 'logistique' },
        { label: 'أغنام لحم', icon: 'utensils', desc: 'Production ovine bouchère', category: 'production' },
        { label: 'أغنام حليب', icon: 'droplets', desc: 'Production laitière ovine', category: 'production' },
        { label: 'اليد العاملة', icon: 'users', desc: 'Gestion des RH et ouvriers', category: 'admin' },
        { label: 'الورشة', icon: 'wrench', desc: 'Maintenance et équipement', category: 'logistique' },
        { label: 'قائمة الأسعار', icon: 'tags', desc: 'Tarification et économie', category: 'admin' },
        { label: 'قطيع الأبقار', icon: 'clipboard-list', desc: 'Inventaire détaillé bovin', category: 'production' },
        { label: 'قطيع الأغنام', icon: 'check-square', desc: 'Inventaire détaillé ovin', category: 'production' },
        { label: 'الأعلاف', icon: 'wheat', desc: 'Nutrition et stocks fourragers', category: 'logistique' },
        { label: 'أعباء أخرى', icon: 'receipt', desc: 'Frais divers et comptabilité', category: 'admin' },
    ];

    static CATEGORIES = [
        { id: 'all', label: 'Toutes les Actions', icon: 'layout-grid' },
        { id: 'production', label: 'Production Animale', icon: 'sprout' },
        { id: 'foncier', label: 'Foncier & Terres', icon: 'map' },
        { id: 'logistique', label: 'Logistique & Ateliers', icon: 'truck' },
        { id: 'admin', label: 'Administration & RH', icon: 'settings' },
    ];

    // ─── Public API ──────────────────────────────────────────────────────────

    setOnOptionClick(callback) {
        this.onOptionClick = callback;
    }

    render(categoryFilter = 'all', searchQuery = '') {
        if (!this.container) return;

        const grid = this.container.querySelector('#selectionGrid, .selection-grid');
        const sidebar = this.container.querySelector('#dashboardSidebar, .dashboard-sidebar');

        if (!grid) return;

        this._activeCategory = categoryFilter;
        this._activeQuery = searchQuery;

        this.mutuelleStore.saveDashboardState({ activeCategory: categoryFilter });

        this._renderSidebar(sidebar, categoryFilter);
        this._renderGrid(grid, categoryFilter, searchQuery);
        this._renderSuggestion(searchQuery);
        this._refreshIcons();
    }

    // ─── Private rendering helpers ───────────────────────────────────────────

    _renderSidebar(sidebar, activeCategory) {
        if (!sidebar) return;

        sidebar.removeEventListener('click', this._handleSidebarClick);
        sidebar.addEventListener('click', this._handleSidebarClick);

        sidebar.innerHTML = SubSelection.CATEGORIES.map(cat => `
            <div class="sidebar-item ${activeCategory === cat.id ? 'active' : ''}"
                 data-category="${cat.id}">
                <i data-lucide="${cat.icon}" style="width:18px;height:18px;"></i>
                <span>${cat.label}</span>
            </div>
        `).join('');
    }

    _renderGrid(grid, categoryFilter, searchQuery) {
        const filtered = this._filterOptions(categoryFilter, searchQuery);
        
        grid.removeEventListener('click', this._handleGridClick);
        grid.addEventListener('click', this._handleGridClick);

        if (filtered.length === 0) {
            grid.innerHTML = this._emptyStateHTML(categoryFilter);
            return;
        }

        grid.innerHTML = `
            <div style="display: contents;">
            ${filtered.map((opt, i) => `
                <div class="formal-action-card"
                     data-label="${opt.label}"
                     style="animation-delay:${i * 0.04}s">
                    <div class="action-card-icon">
                        <i data-lucide="${opt.icon}"></i>
                    </div>
                    <div class="action-card-text">
                        <div class="action-card-title">
                            ${this.highlightText(opt.label, searchQuery)}
                        </div>
                        <div class="action-card-desc">
                            ${this.highlightText(opt.desc, searchQuery)}
                        </div>
                    </div>
                </div>
            `).join('')}
            </div>
        `;
    }

    _renderSuggestion(searchQuery) {
        const suggestionEl = document.getElementById('searchSuggestion');
        if (!suggestionEl) return;

        if (this._suggestion && searchQuery.length > 2) {
            suggestionEl.innerHTML = `
                <div class="pro-suggestion-dropdown" onclick="subSelectionInstance.search('${this._suggestion}', true)">
                    <div class="suggestion-content">
                        <span class="suggestion-tag">💡 Suggestion</span>
                        <span class="suggestion-label">Vous vouliez dire <strong class="suggest-term">${this._suggestion}</strong> ?</span>
                    </div>
                </div>
                <style>
                    .pro-suggestion-dropdown {
                        position: absolute;
                        top: 100%;
                        left: 0;
                        width: 250px; /* Match input width exactly */
                        background: rgba(255, 255, 255, 0.98);
                        backdrop-filter: blur(10px);
                        border-radius: 0 0 14px 14px;
                        box-shadow: 0 12px 25px rgba(0,0,0,0.1);
                        border: 1px solid #e9ecef;
                        border-top: none;
                        padding: 10px 14px;
                        cursor: pointer;
                        z-index: 9999;
                        animation: slideDownIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                        margin-top: -1px;
                    }
                    .suggestion-content {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .suggestion-tag {
                        background: #fff0f0;
                        color: #c41a14;
                        padding: 3px 8px;
                        border-radius: 6px;
                        font-size: 0.7rem;
                        font-weight: 700;
                        letter-spacing: 0.4px;
                        text-transform: uppercase;
                    }
                    .suggestion-label {
                        font-size: 0.85rem;
                        color: #495057;
                    }
                    .suggest-term {
                        color: #c41a14;
                        font-weight: 700;
                        text-decoration: underline;
                        text-underline-offset: 3px;
                    }
                    .pro-suggestion-dropdown:hover {
                        background: #f8f9fa;
                    }
                    @keyframes slideDownIn {
                        from { opacity: 0; transform: translateY(-5px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                </style>
            `;
            suggestionEl.style.display = 'block';

            // ✅ Click outside to close
            const closeHandler = (e) => {
                if (!suggestionEl.contains(e.target) && e.target.id !== 'actionSearchInput') {
                    suggestionEl.style.display = 'none';
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        } else {
            suggestionEl.innerHTML = '';
            suggestionEl.style.display = 'none';
        }
    }

    _emptyStateHTML(categoryFilter) {
        return `
            <div style="grid-column:1/-1;text-align:center;padding:60px 20px;">
                <div style="background:#f8f9fa;width:80px;height:80px;border-radius:50%;
                            display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
                    <i data-lucide="search-x" style="width:40px;height:40px;color:#adb5bd;"></i>
                </div>
                <h3 style="font-weight:700;color:#212529;margin-bottom:10px;">
                    Aucun résultat trouvé
                </h3>
                <button class="btn-back-formal"
                        onclick="subSelectionInstance.render('${categoryFilter}', '')"
                        style="margin:0 auto;display:flex;">
                    <span>Réinitialiser la recherche</span>
                </button>
            </div>
        `;
    }

    // ─── Event delegation handlers ───────────────────────────────────────────

    _handleGridClick(e) {
        const card = e.target.closest('.formal-action-card[data-label]');
        if (card) {
            this.handleOptionClick(card.dataset.label);
        }
    }

    _handleSidebarClick(e) {
        const item = e.target.closest('.sidebar-item[data-category]');
        if (item) {
            this.render(item.dataset.category, this._activeQuery || '');
        }
    }

    // ─── Filtering ───────────────────────────────────────────────────────────

    _filterOptions(categoryFilter, searchQuery) {
        this._suggestion = null;
        
        if (!searchQuery) {
            return (categoryFilter === 'all') 
                ? SubSelection.OPTIONS 
                : SubSelection.OPTIONS.filter(o => o.category === categoryFilter);
        }

        const q = searchQuery.toLowerCase().trim();

        if (this.fuse) {
            const fuzzyResults = this.fuse.search(q);
            
            // "Did you mean" logic
            if (fuzzyResults.length > 0) {
                const topMatch = fuzzyResults[0];
                const isExact = topMatch.item.label.toLowerCase().includes(q) || 
                                topMatch.item.desc.toLowerCase().includes(q);
                
                // If the match is good but not exact, suggest it
                if (!isExact && topMatch.score < 0.55) {
                    // ✅ Smart Suggestion: Detect Language
                    // If searching Arabic chars, suggest Label. Otherwise suggest from Desc (French)
                    const isArabicQuery = /[\u0600-\u06FF]/.test(q);
                    const sourceText = isArabicQuery ? topMatch.item.label : topMatch.item.desc;
                    
                    // ✅ Word-only correction: Extract only the word that matched
                    const words = sourceText.split(/\s+/);
                    const bestWord = words.find(w => {
                        const wordNorm = w.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
                        return q.length > 2 && (wordNorm.includes(q) || q.includes(wordNorm) || 
                               this.fuse.search(wordNorm).length > 0);
                    }) || words[0];

                    this._suggestion = bestWord;
                }
            }
            
            return fuzzyResults.map(r => r.item);
        }

        // Fallback to simple filtering if Fuse is missing
        return SubSelection.OPTIONS.filter(o => 
            o.label.toLowerCase().includes(q) || o.desc.toLowerCase().includes(q)
        );
    }

    // ─── Utilities ───────────────────────────────────────────────────────────

    async handleOptionClick(label) {
        try {
            if (typeof playSuccessSound === 'function') playSuccessSound();
        } catch (_) { /* non-critical */ }

        if (this.onOptionClick) {
            await this.onOptionClick(label);
        }
    }

    highlightText(text, query) {
        if (!query) return text;
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return text.replace(
            new RegExp(`(${escaped})`, 'gi'),
            '<mark class="search-highlight">$1</mark>'
        );
    }

    _debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }

    _refreshIcons() {
        if (window.lucide) window.lucide.createIcons();
    }

    search(query, immediate = false) {
        // ✅ PRO TIP: Also update the actual input field so user sees the correction
        const input = document.getElementById('actionSearchInput');
        if (input) input.value = query;

        if (immediate) {
            this.render(this._activeCategory || 'all', query);
        } else {
            this._debouncedRender(this._activeCategory || 'all', query);
        }
    }

    destroy() {
        const grid = this.container?.querySelector('#selectionGrid, .selection-grid');
        const sidebar = this.container?.querySelector('#dashboardSidebar, .dashboard-sidebar');
        grid?.removeEventListener('click', this._handleGridClick);
        sidebar?.removeEventListener('click', this._handleSidebarClick);
    }
}