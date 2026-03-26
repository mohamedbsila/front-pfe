export class CustomModal {
    static show(message, type = 'info') {
        const modal = document.getElementById('customModal');
        const icon = document.getElementById('modalIcon');
        const title = document.getElementById('modalTitle');
        const messageEl = document.getElementById('modalMessage');
        const buttons = document.getElementById('modalButtons');

        const config = {
            success: { 
                icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>', 
                color: '#28a745', 
                title: 'Succès' 
            },
            error: { 
                icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>', 
                color: '#dc3545', 
                title: 'Erreur' 
            },
            warning: { 
                icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>', 
                color: '#ffc107', 
                title: 'Attention' 
            },
            info: { 
                icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>', 
                color: '#17a2b8', 
                title: 'Information' 
            }
        };

        const settings = config[type] || config.info;

        icon.innerHTML = settings.icon;
        icon.style.background = settings.color;
        title.textContent = settings.title;
        messageEl.textContent = message;

        buttons.innerHTML = `
            <button class="modal-btn modal-btn-primary" onclick="CustomModal.close()">OK</button>
        `;

        modal.classList.add('show');

        try {
            if (type === 'success') playSuccessSound();
            else if (type === 'error') playErrorSound();
            else playClickSound();
        } catch (e) {}
    }

    static confirm(message, onConfirm) {
        const modal = document.getElementById('customModal');
        const icon = document.getElementById('modalIcon');
        const title = document.getElementById('modalTitle');
        const messageEl = document.getElementById('modalMessage');
        const buttons = document.getElementById('modalButtons');

        icon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M11.07 12.85c.77-1.39 2.25-2.21 3.11-3.44.91-1.29.4-3.7-2.18-3.7-1.69 0-2.52 1.28-2.87 2.34L6.54 6.96C7.25 4.83 9.18 3 11.99 3c2.35 0 3.96 1.07 4.78 2.41.7 1.15 1.11 3.3.03 4.9-1.2 1.77-2.35 2.31-3.17 3.89h-2.56zm1.1 6.35c-1.16 0-2.11-.93-2.11-2.09 0-1.15.95-2.09 2.11-2.09 1.16 0 2.11.94 2.11 2.09 0 1.16-.95 2.09-2.11 2.09z"/></svg>';
        icon.style.background = '#17a2b8';
        title.textContent = 'Confirmation';
        messageEl.textContent = message;

        buttons.innerHTML = `
            <button class="modal-btn modal-btn-secondary" onclick="CustomModal.close()">Annuler</button>
            <button class="modal-btn modal-btn-primary" onclick="CustomModal.handleConfirm()">Confirmer</button>
        `;

        modal.classList.add('show');
        window._confirmCallback = onConfirm;
        
        try { playClickSound(); } catch (e) {}
    }

    static prompt(message, placeholder, onComplete) {
        const modal = document.getElementById('customModal');
        const icon = document.getElementById('modalIcon');
        const title = document.getElementById('modalTitle');
        const messageEl = document.getElementById('modalMessage');
        const buttons = document.getElementById('modalButtons');

        icon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 14H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2z"/></svg>';
        icon.style.background = '#2c3e50';
        title.textContent = 'Saisie Requise';
        
        messageEl.innerHTML = `
            <div style="margin-bottom: 1rem;">${message}</div>
            <input type="text" id="promptInput" class="form-input" placeholder="${placeholder}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
        `;

        buttons.innerHTML = `
            <button class="modal-btn modal-btn-secondary" onclick="CustomModal.close()">Annuler</button>
            <button class="modal-btn modal-btn-primary" onclick="CustomModal.handlePrompt()">Valider</button>
        `;

        modal.classList.add('show');
        
        setTimeout(() => {
            const input = document.getElementById('promptInput');
            if (input) input.focus();
        }, 100);

        window._promptCallback = onComplete;
    }

    static handleConfirm() {
        if (typeof window._confirmCallback === 'function') {
            window._confirmCallback();
            window._confirmCallback = null;
        }
        CustomModal.close();
    }

    static handlePrompt() {
        const input = document.getElementById('promptInput');
        const value = input ? input.value : '';
        if (typeof window._promptCallback === 'function') {
            window._promptCallback(value);
            window._promptCallback = null;
        }
        CustomModal.close();
    }

    static close() {
        const modal = document.getElementById('customModal');
        modal.classList.remove('show');
    }
}

window.CustomModal = CustomModal;