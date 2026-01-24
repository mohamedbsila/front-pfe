// Users Page Functions - Global Scope
// This file contains all functions for the users management page

// Global variables
let allUsers = [];
let currentEditingUserId = null;
let selectedUserIds = new Set();
let currentSort = { field: 'createdAt', direction: 'desc' };

// --- Drag & Drop and Resize Utilities ---

function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    if (handle) {
        handle.onmousedown = dragMouseDown;
    } else {
        element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Remove transform centering to switch to absolute positioning
        const style = window.getComputedStyle(element);
        const matrix = new WebKitCSSMatrix(style.transform);
        // If currently centered via transform, calculate current absolute position
        if (style.transform !== 'none' && style.left === '50%') {
             const rect = element.getBoundingClientRect();
             element.style.left = rect.left + 'px';
             element.style.top = rect.top + 'px';
             element.style.transform = 'none';
        }

        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        element.style.top = (element.offsetTop - pos2) + 'px';
        element.style.left = (element.offsetLeft - pos1) + 'px';
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function makeResizable(element) {
    // Check if resize handle exists, if not create one
    let resizer = element.querySelector('.resize-handle');
    if (!resizer) {
        resizer = document.createElement('div');
        resizer.className = 'resize-handle';
        element.appendChild(resizer);
        resizer.addEventListener('mousedown', initResize, false);
    }

    function initResize(e) {
        e.preventDefault();
        window.addEventListener('mousemove', resize, false);
        window.addEventListener('mouseup', stopResize, false);
    }

    function resize(e) {
        element.style.width = (e.clientX - element.offsetLeft) + 'px';
        element.style.height = (e.clientY - element.offsetTop) + 'px';
    }

    function stopResize(e) {
        window.removeEventListener('mousemove', resize, false);
        window.removeEventListener('mouseup', stopResize, false);
    }
}
// --- End Utilities ---

// Load all users from backend
async function loadUsers(silent = false) {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const tableContainer = document.querySelector('.users-table-container');
    const emptyState = document.getElementById('emptyState');

    if (!loadingState) return; // Page not loaded yet

    // Show loading only if NOT silent
    if (!silent) {
        loadingState.style.display = 'block';
        errorState.style.display = 'none';
        tableContainer.style.display = 'none';
        emptyState.style.display = 'none';
    }

    try {
        allUsers = await usersApi.getAll();

        loadingState.style.display = 'none';

        if (allUsers.length === 0) {
            emptyState.style.display = 'block';
        } else {
            tableContainer.style.display = 'block';
            renderUsers(allUsers);
            updateStats(allUsers);
        }
    } catch (error) {
        console.error('Failed to load users:', error);
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
        const errorMsg = errorState.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.textContent = `Erreur: ${error.message}. Assurez-vous que le backend est en cours d'exécution.`;
        }
    }
}

// Render users in table
function renderUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.dataset.id = user._id;
        row.innerHTML = `
            <td style="text-align: center;">
                <input type="checkbox" class="user-checkbox" 
                       ${selectedUserIds.has(user._id) ? 'checked' : ''} 
                       onchange="toggleUserSelection('${user._id}', this.checked)">
            </td>
            <td>${escapeHtml(user.name)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td>${user.age || 'N/A'}</td>
            <td>
                <span class="role-badge role-${user.role || 'peasant'}">
                    ${user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                </span>
            </td>
            <td>
                <span class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">
                    ${user.isActive ? 'Actif' : 'Inactif'}
                </span>
                ${user.isOnline ?
                `<span class="online-indicator" title="En ligne">●</span>` :
                `<span class="offline-indicator" title="Hors-ligne">○</span>`
            }
            </td>
            <td>${user.loginHistory && user.loginHistory.length > 0 ? formatDate(user.loginHistory[user.loginHistory.length - 1].timestamp) : 'Jamais'}</td>
            <td>${formatDate(user.createdAt)}</td>
            <td class="actions-cell">
                <button class="btn-icon btn-view" onclick="viewUser('${user._id}')" title="Voir Détails">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="btn-icon btn-edit" onclick="editUser('${user._id}')" title="Modifier">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteUser('${user._id}')" title="Supprimer">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Filter users based on search, status and role
function filterUsers() {
    const searchInput = document.getElementById('userSearch');
    const statusFilter = document.getElementById('statusFilter');
    const roleFilter = document.getElementById('roleFilter');

    if (!searchInput || !statusFilter || !roleFilter) return;

    const searchTerm = searchInput.value.toLowerCase();
    const statusFilterValue = statusFilter.value;
    const roleFilterValue = roleFilter.value;

    const now = new Date();

    const filtered = allUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm);

        let matchesStatus = true;
        if (statusFilterValue === 'active') matchesStatus = user.isActive;
        else if (statusFilterValue === 'inactive') matchesStatus = !user.isActive;
        else if (statusFilterValue === 'online') {
            matchesStatus = user.isOnline;
        }

        const matchesRole = roleFilterValue === 'all' ||
            (user.role && user.role.toLowerCase() === roleFilterValue);

        return matchesSearch && matchesStatus && matchesRole;
    });

    // Apply sorting
    filtered.sort((a, b) => {
        let valA = a[currentSort.field];
        let valB = b[currentSort.field];

        if (currentSort.field === 'lastActive') {
            valA = a.isOnline ? 2 : (a.loginHistory?.length ? 1 : 0);
            valB = b.isOnline ? 2 : (b.loginHistory?.length ? 1 : 0);
        }

        if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });

    renderUsers(filtered);
    updateStats(filtered);
    updateBulkActionsBar();
}

// Sorting logic
function sortTable(field) {
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = field;
        currentSort.direction = 'asc';
    }

    // Update sort icons UI (visual only)
    document.querySelectorAll('.sort-icon').forEach(icon => icon.textContent = '⇅');
    const header = document.querySelector(`th[onclick*="'${field}'"] .sort-icon`);
    if (header) {
        header.textContent = currentSort.direction === 'asc' ? '↑' : '↓';
    }

    filterUsers();
}

// Selection logic
function toggleSelectAll(checkbox) {
    const visibleUserIds = Array.from(document.querySelectorAll('#usersTableBody .user-checkbox'))
        .map(cb => cb.closest('tr').dataset.id);

    if (checkbox.checked) {
        visibleUserIds.forEach(id => selectedUserIds.add(id));
    } else {
        visibleUserIds.forEach(id => selectedUserIds.delete(id));
    }

    renderUsers(allUsers); // Re-render to update checkbox states (inefficient but safe)
    // Optimization: Just update the checkboxes in the DOM instead of full re-render
    document.querySelectorAll('#usersTableBody .user-checkbox').forEach(cb => {
        cb.checked = checkbox.checked;
    });

    updateBulkActionsBar();
}

function toggleUserSelection(userId, isSelected) {
    if (isSelected) {
        selectedUserIds.add(userId);
    } else {
        selectedUserIds.delete(userId);
        document.getElementById('selectAllUsers').checked = false;
    }
    updateBulkActionsBar();
}

function updateBulkActionsBar() {
    const bar = document.getElementById('bulkActions');
    const countEl = document.getElementById('selectedCount');

    if (selectedUserIds.size > 0) {
        bar.style.display = 'flex';
        countEl.textContent = `${selectedUserIds.size} utilisateur${selectedUserIds.size > 1 ? 's' : ''} sélectionné${selectedUserIds.size > 1 ? 's' : ''}`;
    } else {
        bar.style.display = 'none';
    }
}

// Bulk Actions Implementation
async function bulkDeactivate() {
    if (selectedUserIds.size === 0) return;

    showCustomConfirm(`Désactiver ${selectedUserIds.size} utilisateurs ?`, async () => {
        try {
            const promises = Array.from(selectedUserIds).map(id => usersApi.update(id, { isActive: false }));
            await Promise.all(promises);
            showCustomAlert(`${selectedUserIds.size} utilisateurs désactivés`, 'success');
            selectedUserIds.clear();
            loadUsers();
        } catch (error) {
            showCustomAlert('Erreur lors de la désactivation en masse', 'error');
        }
    });
}

async function bulkDelete() {
    if (selectedUserIds.size === 0) return;

    showCustomConfirm(`Supprimer définitivement ${selectedUserIds.size} utilisateurs ?`, async () => {
        try {
            const promises = Array.from(selectedUserIds).map(id => usersApi.delete(id));
            await Promise.all(promises);
            showCustomAlert(`${selectedUserIds.size} utilisateurs supprimés`, 'success');
            selectedUserIds.clear();
            loadUsers();
        } catch (error) {
            showCustomAlert('Erreur lors de la suppression en masse', 'error');
        }
    });
}

// Update statistics cards
function updateStats(usersList) {
    const totalEl = document.getElementById('totalUsersCount');
    const activeEl = document.getElementById('activeUsersCount');
    const onlineEl = document.getElementById('onlineUsersCount');

    if (!totalEl || !activeEl || !onlineEl) return;

    const total = usersList.length;
    const active = usersList.filter(u => u.isActive).length;
    const online = usersList.filter(u => u.isOnline).length;

    // Animate numbers
    animateNumber(totalEl, total);
    animateNumber(activeEl, active);
    animateNumber(onlineEl, online);
}

// Animate counting numbers
function animateNumber(element, target) {
    let current = parseInt(element.textContent) || 0;
    if (isNaN(current)) current = 0;

    const increment = target > current ? 1 : -1;
    const steps = Math.abs(target - current);
    if (steps === 0) {
        element.textContent = target;
        return;
    }

    const duration = 500;
    const stepTime = Math.max(duration / steps, 20);

    const timer = setInterval(() => {
        current += increment;
        element.textContent = current;
        if (current === target) clearInterval(timer);
    }, stepTime);
}

// Export users to Excel
function exportToExcel() {
    if (allUsers.length === 0) {
        if (typeof showCustomAlert === 'function') showCustomAlert('Aucune donnée à exporter', 'warning');
        return;
    }

    const data = allUsers.map(user => ({
        'Nom': user.name,
        'Email': user.email,
        'Âge': user.age || 'N/A',
        'Statut': user.isActive ? 'Actif' : 'Inactif',
        'Dernière Connexion': user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Jamais',
        'Date de Création': new Date(user.createdAt).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Utilisateurs");

    // Auto-size columns
    const maxWidths = Object.keys(data[0]).map(key => Math.max(key.length, ...data.map(obj => obj[key]?.toString().length || 0)));
    worksheet['!cols'] = maxWidths.map(w => ({ w: w + 2 }));

    XLSX.writeFile(workbook, `utilisateurs_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Export users to PDF
function exportToPDF() {
    if (allUsers.length === 0) {
        if (typeof showCustomAlert === 'function') showCustomAlert('Aucune donnée à exporter', 'warning');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(18);
    doc.text('Liste des Utilisateurs', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Généré le: ${new Date().toLocaleString()}`, 14, 30);

    const headers = [['Nom', 'Email', 'Age', 'Rôle', 'Statut', 'Dernière Connexion']];
    const data = allUsers.map(u => [
        u.name,
        u.email,
        u.age || 'N/A',
        u.role || 'peasant',
        u.isActive ? 'Actif' : 'Inactif',
        u.lastActive ? new Date(u.lastActive).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : 'Jamais'
    ]);

    doc.autoTable({
        head: headers,
        body: data,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [200, 16, 46], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(`utilisateurs_${new Date().toISOString().split('T')[0]}.pdf`);
}


// Helper to ensure role selector exists (fixes caching issues)
function ensureRoleSelector() {
    let roleGroup = document.getElementById('roleGroup');
    if (!roleGroup) {
        console.warn('Role Group missing from DOM, injecting dynamically...');
        const userStatus = document.getElementById('userStatus');
        if (userStatus) {
            const statusGroup = userStatus.closest('.form-group');
            if (statusGroup) {
                roleGroup = document.createElement('div');
                roleGroup.className = 'form-group';
                roleGroup.id = 'roleGroup';
                roleGroup.style.display = 'none';
                roleGroup.innerHTML = `
                    <label for="userRole">Rôle</label>
                    <select id="userRole">
                        <option value="peasant">Utilisateur</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                    </select>
                `;
                statusGroup.parentNode.insertBefore(roleGroup, statusGroup.nextSibling);
            }
        }
    }
    return roleGroup;
}

// Open add user modal
function openAddUserModal() {
    currentEditingUserId = null;
    const modalTitle = document.getElementById('modalTitle');
    const userForm = document.getElementById('userForm');
    const userStatus = document.getElementById('userStatus');
    const userModal = document.getElementById('userModal');

    if (modalTitle) modalTitle.textContent = 'Ajouter un utilisateur';
    if (userForm) userForm.reset();
    if (userStatus) userStatus.value = 'true';

    // Ensure role selector exists and handle visibility
    const roleGroup = ensureRoleSelector();
    const userRole = document.getElementById('userRole');
    if (userRole) userRole.value = 'peasant';
    
    const currentUserRole = localStorage.getItem('user_role');
    if (roleGroup) {
        roleGroup.style.display = 'block'; // Reset to block
        if (currentUserRole !== 'super_admin') {
            roleGroup.style.setProperty('display', 'none', 'important');
        }
    }

    if (userModal) {
        userModal.classList.add('show');
        
        // Initialize Draggable and Resizable behavior
        const modalContent = userModal.querySelector('.modal-content');
        const modalHeader = userModal.querySelector('.modal-header');
        
        if (modalContent && modalHeader) {
            makeDraggable(modalContent, modalHeader);
            makeResizable(modalContent);
        }
    }
}

// Open edit user modal
async function editUser(userId) {
    currentEditingUserId = userId;
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Modifier l\'utilisateur';

    try {
        const user = await usersApi.getById(userId);
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userAge = document.getElementById('userAge');
        const userStatus = document.getElementById('userStatus');
        const userModal = document.getElementById('userModal');

        if (userName) userName.value = user.name;
        if (userEmail) userEmail.value = user.email;
        if (userAge) userAge.value = user.age || '';
        if (userStatus) userStatus.value = user.isActive.toString();
        
        // Ensure role selector exists and handle visibility
        const roleGroup = ensureRoleSelector();
        const userRole = document.getElementById('userRole');
        if (userRole) userRole.value = user.role || 'peasant';

        const currentUserRole = localStorage.getItem('user_role');
        if (roleGroup) {
            roleGroup.style.display = 'block'; // Reset to block
            if (currentUserRole !== 'super_admin') {
                roleGroup.style.setProperty('display', 'none', 'important');
            }
        }
        
        if (userModal) {
            userModal.classList.add('show');
            
            // Initialize Draggable and Resizable behavior
            const modalContent = userModal.querySelector('.modal-content');
            const modalHeader = userModal.querySelector('.modal-header');
            
            if (modalContent && modalHeader) {
                makeDraggable(modalContent, modalHeader);
                makeResizable(modalContent);
            }
        }
    } catch (error) {
        if (typeof showCustomAlert === 'function') {
            showCustomAlert('Erreur lors du chargement de l\'utilisateur: ' + error.message, 'error');
        }
    }
}

// Close user modal
function closeUserModal() {
    const userModal = document.getElementById('userModal');
    if (userModal) userModal.classList.remove('show');
    currentEditingUserId = null;
}

// Handle form submission
async function handleUserSubmit(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enregistrement...';
    }

    const userData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        age: parseInt(document.getElementById('userAge').value) || undefined,
        isActive: document.getElementById('userStatus').value === 'true',
        role: document.getElementById('userRole') ? document.getElementById('userRole').value : undefined
    };

    try {
        if (currentEditingUserId) {
            // Update existing user
            await usersApi.update(currentEditingUserId, userData);
            if (typeof showCustomAlert === 'function') {
                showCustomAlert('Utilisateur modifié avec succès!', 'success');
            }
        } else {
            // Create new user
            await usersApi.create(userData);
            if (typeof showCustomAlert === 'function') {
                showCustomAlert('Utilisateur créé avec succès!', 'success');
            }
        }

        closeUserModal();
        loadUsers();
    } catch (error) {
        if (typeof showCustomAlert === 'function') {
            showCustomAlert('Erreur: ' + error.message, 'error');
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enregistrer';
        }
    }
}

// View user details
async function viewUser(userId) {
    try {
        const user = await usersApi.getById(userId);
        const detailsContent = document.getElementById('userDetailsContent');

        if (detailsContent) {
            detailsContent.innerHTML = `
                <div class="detail-row">
                    <strong>Nom:</strong> <span>${escapeHtml(user.name)}</span>
                </div>
                <div class="detail-row">
                    <strong>Email:</strong> <span>${escapeHtml(user.email)}</span>
                </div>
                <div class="detail-row">
                    <strong>Âge:</strong> <span>${user.age || 'Non spécifié'}</span>
                </div>
                <div class="detail-row">
                    <strong>Rôle:</strong> 
                    <span class="role-badge role-${user.role || 'peasant'}">
                        ${user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                    </span>
                </div>
                <div class="detail-row">
                    <strong>Statut:</strong> 
                    <span class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">
                        ${user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                </div>
                <div class="detail-row">
                    <strong>Date de création:</strong> <span>${formatDate(user.createdAt)}</span>
                </div>
                <div class="detail-row">
                    <strong>Dernière modification:</strong> <span>${formatDate(user.updatedAt)}</span>
                </div>
                <div class="detail-row">
                    <strong>ID:</strong> <span style="font-family: monospace; font-size: 0.9em;">${user._id}</span>
                </div>
                
                <div class="login-history-section" style="margin-top: 1.5rem; border-top: 1px solid #eee; padding-top: 1rem;">
                    <h4 style="margin-bottom: 0.8rem; color: #2c3e50;">Historique de Connexion</h4>
                    <div class="login-history-list" style="max-height: 250px; overflow-y: auto;">
                        ${user.loginHistory && user.loginHistory.length > 0 ?
                    user.loginHistory.reverse().map(login => `
                                <div class="login-item" style="padding: 0.8rem 0; border-bottom: 1px solid #f8f9fa; font-size: 0.85rem;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.3rem;">
                                        <span class="login-time" style="font-weight: 600;">${formatDate(login.timestamp)}</span>
                                        <span class="login-ip" style="color: #666; font-family: monospace;">${login.ip || 'Inconnue'}</span>
                                    </div>
                                    <div style="display: flex; gap: 0.5rem; color: #7f8c8d; font-size: 0.8em; flex-wrap: wrap;">
                                        <span>🖥️ ${login.device || 'Desktop'}</span>
                                        <span>💻 ${login.os || 'Inconnue'}</span>
                                        <span>📍 ${login.city || 'Locale'}, ${login.country || 'Inconnue'}</span>
                                        ${login.isVpn ? '<span style="color: #e74c3c; font-weight: bold;">🛡️ VPN Détecté</span>' : ''}
                                    </div>
                                </div>
                            `).join('') :
                    '<p style="color: #888; font-style: italic; font-size: 0.85rem;">Aucun historique disponible</p>'
                }
                    </div>
                </div>
            `;
        }

        const userDetailsModal = document.getElementById('userDetailsModal');
        if (userDetailsModal) userDetailsModal.classList.add('show');

        // Load modification history
        loadAuditHistory(userId);
    } catch (error) {
        if (typeof showCustomAlert === 'function') {
            showCustomAlert('Erreur lors du chargement des détails: ' + error.message, 'error');
        }
    }
}

// Load and render user modification audit history
async function loadAuditHistory(userId) {
    const historyContainer = document.getElementById('auditHistoryContent');
    if (!historyContainer) return;

    try {
        const history = await apiClient.request(`/users/${userId}/audit`);

        if (!history || history.length === 0) {
            historyContainer.innerHTML = '<p style="color: #888; font-style: italic; font-size: 0.85rem;">Aucune modification enregistrée</p>';
            return;
        }

        historyContainer.innerHTML = history.map(audit => `
            <div class="audit-item">
                <div class="audit-header">
                    <span class="audit-editor">MODIFIÉ PAR: ${escapeHtml(audit.editorName)}</span>
                    <span class="audit-time">${formatDate(audit.createdAt)}</span>
                </div>
                <div class="audit-body">
                    ${audit.changes.map(change => `
                        <div class="audit-change">
                            <span class="change-field">${formatFieldName(change.field)}</span>
                            <div class="change-values">
                                <span class="old-val">${formatValue(change.field, change.oldValue)}</span>
                                <span class="change-arrow">➜</span>
                                <span class="new-val">${formatValue(change.field, change.newValue)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading audit history:', error);
        historyContainer.innerHTML = '<p style="color: #e74c3c; font-size: 0.85rem;">Erreur lors du chargement de l\'historique</p>';
    }
}

// Helper to format field names for display
function formatFieldName(field) {
    const fields = {
        'name': 'Nom',
        'email': 'Email',
        'age': 'Âge',
        'isActive': 'Statut du compte'
    };
    return fields[field] || field;
}

// Helper to format values for display
function formatValue(field, value) {
    if (field === 'isActive') {
        return value ? 'Actif' : 'Inactif';
    }
    if (value === null || value === undefined) return 'N/A';
    return escapeHtml(String(value));
}

// Close user details modal
function closeUserDetailsModal() {
    const userDetailsModal = document.getElementById('userDetailsModal');
    if (userDetailsModal) userDetailsModal.classList.remove('show');
}

// Delete user
function deleteUser(userId) {
    if (typeof showCustomConfirm === 'function') {
        showCustomConfirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?', async () => {
            try {
                await usersApi.delete(userId);
                if (typeof showCustomAlert === 'function') {
                    showCustomAlert('Utilisateur supprimé avec succès!', 'success');
                }
                loadUsers();
            } catch (error) {
                if (typeof showCustomAlert === 'function') {
                    showCustomAlert('Erreur lors de la suppression: ' + error.message, 'error');
                }
            }
        });
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize users page when it's loaded
function initUsersPage() {
    // Check if we're on the users page
    if (document.getElementById('usersTableBody')) {
        loadUsers();
    }
}

// Call initUsersPage when the page content changes (via loadPage function)
// This will be triggered by the loadPage function in index.html
if (typeof window !== 'undefined') {
    window.initUsersPage = initUsersPage;
}
