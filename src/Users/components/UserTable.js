import { useUsers } from '../hooks/index.js';
import { formatDate, escapeHtml } from '../../shared/utils/index.js';
import { CustomModal } from '../../shared/components/index.js';

export class UserTable {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.usersStore = useUsers();
        this.onViewUser = null;
        this.onEditUser = null;
    }

    setCallbacks({ onViewUser, onEditUser }) {
        this.onViewUser = onViewUser;
        this.onEditUser = onEditUser;
    }

    render(users) {
        if (!this.container) return;

        const tbody = this.container.querySelector('tbody') || this.container;
        
        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem;">Aucun utilisateur trouvé</td></tr>';
            return;
        }

        const state = this.usersStore.getState();
        const selectedIds = state.selectedIds;

        tbody.innerHTML = users.map(user => {
            const isSelected = selectedIds.has(user._id);
            const roleLabel = user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Utilisateur';
            const statusLabel = user.isActive ? 'Actif' : 'Inactif';
            const lastLogin = user.loginHistory && user.loginHistory.length > 0 
                ? formatDate(user.loginHistory[user.loginHistory.length - 1].timestamp) 
                : 'Jamais';

            return `
                <tr data-id="${user._id}">
                    <td style="text-align: center;">
                        <input type="checkbox" class="user-checkbox" 
                            ${isSelected ? 'checked' : ''} 
                            onchange="userTableInstance.toggleSelection('${user._id}', this.checked)">
                    </td>
                    <td>${escapeHtml(user.name)}</td>
                    <td>${escapeHtml(user.email)}</td>
                    <td>${user.age || 'N/A'}</td>
                    <td>
                        <span class="role-badge role-${user.role || 'peasant'}">${roleLabel}</span>
                    </td>
                    <td>
                        <span class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">${statusLabel}</span>
                        ${user.isOnline ? '<span class="online-indicator" title="En ligne">●</span>' : '<span class="offline-indicator" title="Hors-ligne">○</span>'}
                    </td>
                    <td>${lastLogin}</td>
                    <td>${formatDate(user.createdAt)}</td>
                    <td class="actions-cell">
                        <button class="btn-icon btn-view" onclick="userTableInstance.viewUser('${user._id}')" title="Voir Détails">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button class="btn-icon btn-edit" onclick="userTableInstance.editUser('${user._id}')" title="Modifier">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="btn-icon btn-delete" onclick="userTableInstance.deleteUser('${user._id}')" title="Supprimer">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        window.userTableInstance = this;
    }

    async toggleSelection(userId, isSelected) {
        this.usersStore.toggleSelection(userId);
        this.updateBulkActionsBar();
    }

    updateBulkActionsBar() {
        const state = this.usersStore.getState();
        const bar = document.getElementById('bulkActions');
        const countEl = document.getElementById('selectedCount');

        if (bar && countEl) {
            const count = state.selectedIds.size;
            if (count > 0) {
                bar.style.display = 'flex';
                countEl.textContent = `${count} utilisateur${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}`;
            } else {
                bar.style.display = 'none';
            }
        }
    }

    async viewUser(userId) {
        if (this.onViewUser) {
            await this.onViewUser(userId);
        }
    }

    async editUser(userId) {
        if (this.onEditUser) {
            await this.onEditUser(userId);
        }
    }

    async deleteUser(userId) {
        CustomModal.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?', async () => {
            try {
                await this.usersStore.deleteUser(userId);
                CustomModal.show('Utilisateur supprimé avec succès!', 'success');
            } catch (error) {
                CustomModal.show('Erreur lors de la suppression: ' + error.message, 'error');
            }
        });
    }

    async bulkDeactivate() {
        const state = this.usersStore.getState();
        if (state.selectedIds.size === 0) return;

        CustomModal.confirm(`Désactiver ${state.selectedIds.size} utilisateurs ?`, async () => {
            try {
                await this.usersStore.bulkDeactivate();
                CustomModal.show(`${state.selectedIds.size} utilisateurs désactivés`, 'success');
            } catch (error) {
                CustomModal.show('Erreur lors de la désactivation en masse', 'error');
            }
        });
    }

    async bulkDelete() {
        const state = this.usersStore.getState();
        if (state.selectedIds.size === 0) return;

        CustomModal.confirm(`Supprimer définitivement ${state.selectedIds.size} utilisateurs ?`, async () => {
            try {
                await this.usersStore.bulkDelete();
                CustomModal.show(`${state.selectedIds.size} utilisateurs supprimés`, 'success');
            } catch (error) {
                CustomModal.show('Erreur lors de la suppression en masse', 'error');
            }
        });
    }

    toggleSelectAll(checkbox) {
        const tbody = this.container.querySelector('tbody');
        if (!tbody) return;
        
        const visibleIds = Array.from(tbody.querySelectorAll('tr')).map(row => row.dataset.id);

        if (checkbox.checked) {
            this.usersStore.selectAll(visibleIds);
        } else {
            this.usersStore.clearSelection();
        }

        this.render(this.usersStore.getFilteredUsers());
        this.updateBulkActionsBar();
    }
}