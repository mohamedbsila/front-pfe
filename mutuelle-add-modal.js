// Enhanced Add Mutuelle Modal with all fields
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
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">URL de l'image</label>
                <input type="url" id="mutuelle_image" class="form-input" placeholder="https://..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">URL du logo</label>
                <input type="url" id="mutuelle_logo" class="form-input" placeholder="https://..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
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

async function submitAddMutuelle() {
    const name = document.getElementById('mutuelle_name')?.value.trim();
    const address = document.getElementById('mutuelle_address')?.value.trim();
    const imageUrl = document.getElementById('mutuelle_image')?.value.trim();
    const logoUrl = document.getElementById('mutuelle_logo')?.value.trim();

    if (!name) {
        showCustomAlert('Le nom de la mutuelle est requis', 'error');
        return;
    }

    try {
        const data = { name };
        if (address) data.address = address;
        if (imageUrl) data.imageUrl = imageUrl;
        if (logoUrl) data.logoUrl = logoUrl;

        await mutuelleClient.create(data);
        closeCustomModal();
        await initMutuellePage();
        showCustomAlert('Mutuelle ajoutée avec succès !', 'success');
    } catch (error) {
        showCustomAlert('Erreur: ' + error.message, 'error');
    }
}

window.submitAddMutuelle = submitAddMutuelle;
