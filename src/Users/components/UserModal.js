import { useUsers } from '../hooks/index.js';
import { CustomModal } from '../../shared/components/index.js';

export class UserModal {
    constructor() {
        this.usersStore = useUsers();
        this.modal = document.getElementById('userModal');
    }

    openAddModal() {
        this.usersStore.setCurrentEditing(null);
        
        const modalTitle = document.getElementById('modalTitle');
        const userForm = document.getElementById('userForm');
        
        if (modalTitle) modalTitle.textContent = 'Ajouter un utilisateur';
        if (userForm) userForm.reset();
        
        const userStatus = document.getElementById('userStatus');
        if (userStatus) userStatus.value = 'true';

        const userRole = document.getElementById('userRole');
        if (userRole) userRole.value = 'peasant';
        
        const currentUserRole = localStorage.getItem('user_role');
        const roleGroup = document.getElementById('roleGroup');
        if (roleGroup) {
            roleGroup.style.display = 'block';
            if (currentUserRole !== 'super_admin') {
                roleGroup.style.setProperty('display', 'none', 'important');
            }
        }

        if (this.modal) {
            this.modal.classList.add('show');
        }
    }

    async openEditModal(userId) {
        this.usersStore.setCurrentEditing(userId);
        
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) modalTitle.textContent = 'Modifier l\'utilisateur';

        try {
            const user = await this.usersStore.getUserById(userId);
            
            const userName = document.getElementById('userName');
            const userEmail = document.getElementById('userEmail');
            const userAge = document.getElementById('userAge');
            const userStatus = document.getElementById('userStatus');

            if (userName) userName.value = user.name;
            if (userEmail) userEmail.value = user.email;
            if (userAge) userAge.value = user.age || '';
            if (userStatus) userStatus.value = user.isActive.toString();
            
            const userRole = document.getElementById('userRole');
            if (userRole) userRole.value = user.role || 'peasant';

            const currentUserRole = localStorage.getItem('user_role');
            const roleGroup = document.getElementById('roleGroup');
            if (roleGroup) {
                roleGroup.style.display = 'block';
                if (currentUserRole !== 'super_admin') {
                    roleGroup.style.setProperty('display', 'none', 'important');
                }
            }
            
            if (this.modal) {
                this.modal.classList.add('show');
            }
        } catch (error) {
            CustomModal.show('Erreur lors du chargement de l\'utilisateur: ' + error.message, 'error');
        }
    }

    close() {
        if (this.modal) {
            this.modal.classList.remove('show');
        }
        this.usersStore.setCurrentEditing(null);
    }

    async handleSubmit(event) {
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
            const state = this.usersStore.getState();
            
            if (state.currentEditingId) {
                await this.usersStore.updateUser(state.currentEditingId, userData);
                CustomModal.show('Utilisateur modifié avec succès!', 'success');
            } else {
                await this.usersStore.createUser(userData);
                CustomModal.show('Utilisateur créé avec succès!', 'success');
            }

            this.close();
        } catch (error) {
            CustomModal.show('Erreur: ' + error.message, 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enregistrer';
            }
        }
    }
}

export const userModal = new UserModal();