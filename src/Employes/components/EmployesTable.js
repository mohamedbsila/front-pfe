import { useEmployees } from '../hooks/index.js';
import { useMutuelle } from '../../Mutuelle/hooks/index.js';

export class EmployesTable {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.store = useEmployees();
        this.mutuelleStore = useMutuelle();
        this.onEnrollFace = null;
        this.onEditEmployee = null;
    }

    setCallbacks({ onEnrollFace, onEditEmployee }) {
        this.onEnrollFace = onEnrollFace;
        this.onEditEmployee = onEditEmployee;
    }

    async render() {
        if (!this.container) return;

        const state = this.store.getState();
        const employees = this.store.getCombinedEmployees();

        if (state.loading) {
            this.container.innerHTML = '<div class="loading-spinner">Chargement des employés...</div>';
            return;
        }

        const html = `
            <div class="employees-table-header">
                <h3>Liste des Employés</h3>
                <div class="table-actions">
                    <div class="search-box">
                        <i data-lucide="search"></i>
                        <input type="text" id="employeeSearchInput" placeholder="Rechercher (Nom, Matricule...)" />
                    </div>
                </div>
            </div>
            <table class="formal-table">
                <thead>
                    <tr>
                        <th>Nom & Prénom</th>
                        <th>Société / Matricule</th>
                        <th>Type</th>
                        <th>Catégorie</th>
                        <th>Dernière activité</th>
                        <th>Face ID</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="employeesTableBody">
                    ${employees.length === 0 ? '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Aucun employé trouvé</td></tr>' :
                employees.map(emp => `
                        <tr>
                            <td>
                                <div class="employee-name-cell">
                                    <div class="employee-avatar" style="background-image: ${emp.photo ? `url(${emp.photo})` : 'none'}">
                                        ${!emp.photo ? (emp.name?.[0] || '?') : ''}
                                    </div>
                                    <div class="employee-info">
                                        <div class="name">${emp.name} ${emp.lastName}</div>
                                        <div class="email">${emp.salary ? `${emp.salary} DT` : 'Temporaire'}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="matricule-badge">${emp.matricule || 'N/A'}</div>
                            </td>
                            <td>
                                <span class="badge badge-${emp.type === 'QAR' ? 'primary' : 'secondary'}">
                                    ${emp.type}
                                </span>
                            </td>
                            <td>${emp.category || 'Permanent'}</td>
                            <td>
                                <div class="status-cell">
                                    <span class="status-dot ${emp.isActive ? 'online' : 'offline'}"></span>
                                    ${emp.lastActivation ? new Date(emp.lastActivation).toLocaleDateString('fr-FR') : 'Jamais'}
                                </div>
                            </td>
                            <td>
                                ${emp.faceDescriptor?.length > 0 ?
                        `<span class="badge-success"><i data-lucide="check-circle-2"></i> Activé</span>` :
                        `<span class="badge-warning" style="cursor: pointer;" onclick="window.enrollEmployeeFace('${emp._id}', '${emp.type}')">
                                    <i data-lucide="camera"></i> Enrôler
                                </span>`}
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn-icon" title="Modifier" onclick="window.editEmployee('${emp._id}', '${emp.type}')">
                                        <i data-lucide="edit-3"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        this.container.innerHTML = html;
        if (window.lucide) window.lucide.createIcons();

        // Setup Search
        const searchInput = document.getElementById('employeeSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    }

    handleSearch(query) {
        // Simple search implementation
        const rows = document.querySelectorAll('#employeesTableBody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }
}
