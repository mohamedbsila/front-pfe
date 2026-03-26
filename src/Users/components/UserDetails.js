import { useUsers } from '../hooks/index.js';
import { formatDate, escapeHtml } from '../../shared/utils/index.js';
import { usersApi } from '../services/index.js';

export class UserDetails {
    constructor() {
        this.usersStore = useUsers();
        this.modal = document.getElementById('userDetailsModal');
    }

    async open(userId) {
        try {
            const user = await this.usersStore.getUserById(userId);
            const detailsContent = document.getElementById('userDetailsContent');

            if (!detailsContent) return;

            const roleLabel = user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Utilisateur';
            const statusLabel = user.isActive ? 'Actif' : 'Inactif';

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
                    <span class="role-badge role-${user.role || 'peasant'}">${roleLabel}</span>
                </div>
                <div class="detail-row">
                    <strong>Statut:</strong> 
                    <span class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">${statusLabel}</span>
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

            this.loadAuditHistory(userId);

            if (this.modal) {
                this.modal.classList.add('show');
            }
        } catch (error) {
            console.error('Error loading user details:', error);
        }
    }

    async loadAuditHistory(userId) {
        const historyContainer = document.getElementById('auditHistoryContent');
        if (!historyContainer) return;

        try {
            const history = await usersApi.getAuditHistory(userId);

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
                                <span class="change-field">${this.formatFieldName(change.field)}</span>
                                <div class="change-values">
                                    <span class="old-val">${this.formatValue(change.field, change.oldValue)}</span>
                                    <span class="change-arrow">➜</span>
                                    <span class="new-val">${this.formatValue(change.field, change.newValue)}</span>
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

    formatFieldName(field) {
        const fields = {
            'name': 'Nom',
            'email': 'Email',
            'age': 'Âge',
            'isActive': 'Statut du compte'
        };
        return fields[field] || field;
    }

    formatValue(field, value) {
        if (field === 'isActive') {
            return value ? 'Actif' : 'Inactif';
        }
        if (value === null || value === undefined) return 'N/A';
        return escapeHtml(String(value));
    }

    close() {
        if (this.modal) {
            this.modal.classList.remove('show');
        }
    }
}

export const userDetails = new UserDetails();