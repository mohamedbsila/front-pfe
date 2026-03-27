import { useMutuelle } from '../hooks/index.js';
import { API_BASE_URL } from '../../config.js';

export class MutuelleDetails {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.mutuelleStore = useMutuelle();
    }

    async render() {
        if (!this.container) return;

        const state = this.mutuelleStore.getState();
        const mutuelle = state.selectedMutuelle;

        if (!mutuelle) {
            this.container.innerHTML = '<p style="text-align: center; padding: 2rem;">Aucune mutuelle sélectionnée</p>';
            return;
        }

        const backendURL = API_BASE_URL.replace('/api', '');
        const defaultLogo = 'https://unpkg.com/lucide-static/icons/building-2.svg';
        const logoUrl = mutuelle.logoUrl 
            ? (mutuelle.logoUrl.startsWith('http') ? mutuelle.logoUrl : `${backendURL}${mutuelle.logoUrl}`)
            : defaultLogo;

        // Load the details fragment
        try {
            const response = await fetch('src/Mutuelle/pages/mutuelle_details.html');
            const html = await response.text();
            
            this.container.innerHTML = html;
            
            // Update labels and logo via DOM
            const nameEl = this.container.querySelector('#selectedMutuelleName');
            const logoEl = this.container.querySelector('#selectedMutuelleLogo');
            
            if (nameEl) nameEl.textContent = mutuelle.name;
            if (logoEl) {
                logoEl.src = logoUrl;
                logoEl.onerror = () => { logoEl.src = defaultLogo; };
            }
            
            // Trigger Lucide icons
            if (window.lucide) {
                window.lucide.createIcons();
            }
        } catch (error) {
            console.error('Error loading details fragment:', error);
            this.container.innerHTML = '<p style="text-align: center; padding: 2rem; color: red;">Erreur de chargement</p>';
        }
    }

    async goBack() {
        this.mutuelleStore.clearSelection();
        const content = document.getElementById('mutuelleMainContent');
        if (content) {
            this.mutuelleStore.clearDashboardState();
            await this.mutuelleStore.loadMutuelles();
            
            // Re-render list
            const MutuelleList = (await import('./MutuelleList.js')).MutuelleList;
            const list = new MutuelleList('#mutuelleMainContent');
            await list.render();
        }
    }
}