import { useMutuelle } from '../hooks/index.js';
import { CustomModal } from '../../shared/components/index.js';

export class AddMutuelleModal {
    constructor() {
        this.mutuelleStore = useMutuelle();
    }

    open() {
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
                    <input type="file" id="mutuelle_image" accept="image/*" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" onchange="addMutuelleModalInstance.previewImage(this, 'imagePreview')">
                    <div id="imagePreview" style="margin-top: 0.5rem; max-width: 200px; max-height: 150px; overflow: hidden; border-radius: 4px; display: none;">
                        <img style="width: 100%; height: auto;" />
                    </div>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Logo</label>
                    <input type="file" id="mutuelle_logo" accept="image/*" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" onchange="addMutuelleModalInstance.previewImage(this, 'logoPreview')">
                    <div id="logoPreview" style="margin-top: 0.5rem; max-width: 100px; max-height: 100px; overflow: hidden; border-radius: 4px; display: none;">
                        <img style="width: 100%; height: auto;" />
                    </div>
                </div>
            </div>
        `;

        buttons.innerHTML = `
            <button class="modal-btn modal-btn-secondary" onclick="CustomModal.close()">Annuler</button>
            <button class="modal-btn modal-btn-primary" onclick="addMutuelleModalInstance.submit()">Ajouter</button>
        `;

        modal.classList.add('show');
        
        setTimeout(() => {
            const input = document.getElementById('mutuelle_name');
            if (input) input.focus();
        }, 100);

        window.addMutuelleModalInstance = this;
    }

    previewImage(input, previewId) {
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

    async submit() {
        const name = document.getElementById('mutuelle_name')?.value.trim();
        const address = document.getElementById('mutuelle_address')?.value.trim();
        const imageFile = document.getElementById('mutuelle_image')?.files[0];
        const logoFile = document.getElementById('mutuelle_logo')?.files[0];

        if (!name) {
            CustomModal.show('Le nom de la mutuelle est requis', 'error');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', name);
            if (address) formData.append('address', address);
            if (imageFile) formData.append('imageFile', imageFile);
            if (logoFile) formData.append('logoFile', logoFile);

            await this.mutuelleStore.createMutuelle(formData);
            CustomModal.close();
            CustomModal.show('Mutuelle ajoutée avec succès !', 'success');
        } catch (error) {
            CustomModal.show('Erreur: ' + error.message, 'error');
        }
    }
}

export const addMutuelleModal = new AddMutuelleModal();