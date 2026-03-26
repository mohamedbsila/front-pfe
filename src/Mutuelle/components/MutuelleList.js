import { useMutuelle } from '../hooks/index.js';
import { CustomModal } from '../../shared/components/index.js';
import { API_BASE_URL } from '../../config.js';

export class MutuelleList {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.mutuelleStore = useMutuelle();
        this.onSelectMutuelle = null;
    }

    setOnSelectMutuelle(callback) {
        this.onSelectMutuelle = callback;
    }

    async render() {
        if (!this.container) return;

        const grid = this.container.querySelector('#mutuelleCardGrid') || this.container;
        
        const state = this.mutuelleStore.getState();
        
        if (state.isLoading) {
            grid.innerHTML = '<div style="text-align: center; padding: 2rem;">Chargement...</div>';
            return;
        }

        if (!state.mutuelles || state.mutuelles.length === 0) {
            grid.innerHTML = `
                <div style="text-align: center; padding: 4rem; width: 100%; grid-column: 1 / -1;">
                    <p style="color: #888;">Aucune mutuelle trouvée.</p>
                </div>
            `;
            return;
        }

        const defaultBg = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800';
        const defaultLogo = 'https://unpkg.com/lucide-static/icons/building-2.svg';
        const colors = ['green', 'blue', 'orange', 'purple', 'red'];
        const backendURL = API_BASE_URL.replace('/api', '');

        grid.innerHTML = state.mutuelles.map((m, index) => {
            const colorClass = colors[index % colors.length];
            const dateStr = m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A';
            const cardId = `hero-card-${m._id}`;

            const imageUrl = m.imageUrl 
                ? (m.imageUrl.startsWith('http') ? m.imageUrl : `${backendURL}${m.imageUrl}`) 
                : defaultBg;
            const logoUrl = m.logoUrl 
                ? (m.logoUrl.startsWith('http') ? m.logoUrl : `${backendURL}${m.logoUrl}`) 
                : defaultLogo;

            return `
                <div id="${cardId}" class="hero ${colorClass}">
                    <button class="hero-delete-btn" title="Supprimer" onclick="mutuelleListInstance.deleteMutuelle('${m._id}')">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                    <img class="hero-profile-img" src="${imageUrl}" alt="Background" 
                        crossorigin="anonymous" onload="mutuelleListInstance.applyDynamicColor(this, '${cardId}')">
                    <div class="hero-description-bk"></div>
                    <div class="hero-logo">
                        <img src="${logoUrl}" alt="Logo" onerror="this.src='https://unpkg.com/lucide-static/icons/home.svg'">
                    </div>
                    <div class="hero-description">
                        <p>${m.name}</p>
                    </div>
                    <div class="hero-date">
                        <p>${m.address || dateStr}</p>
                    </div>
                    <div class="hero-btn">
                        <a href="#" onclick="mutuelleListInstance.selectMutuelle('${m._id}')">Membres</a>
                    </div>
                </div>
            `;
        }).join('');

        window.mutuelleListInstance = this;
    }

    applyDynamicColor(img, cardId) {
        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 10;
            canvas.height = 10;

            context.drawImage(img, 0, 0, 10, 10);
            const data = context.getImageData(0, 0, 10, 10).data;

            let r = 0, g = 0, b = 0, count = 0;
            for (let i = 0; i < data.length; i += 4) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
                count++;
            }

            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);

            const card = document.getElementById(cardId);
            if (card) {
                const bk = card.querySelector('.hero-description-bk');
                if (bk) {
                    const secondary = `rgb(${Math.floor(r * 0.7)}, ${Math.floor(g * 0.7)}, ${Math.floor(b * 0.7)})`;
                    bk.style.backgroundImage = `linear-gradient(135deg, rgb(${r},${g},${b}), ${secondary})`;
                    bk.style.backgroundColor = `rgb(${r},${g},${b})`;
                }
            }
        } catch (e) {
            console.warn('Could not extract color:', e);
        }
    }

    async selectMutuelle(id) {
        await this.mutuelleStore.selectMutuelle(id);
        if (this.onSelectMutuelle) {
            this.onSelectMutuelle(id);
        }
    }

    async deleteMutuelle(id) {
        CustomModal.confirm('Voulez-vous vraiment supprimer cette mutuelle ?', async () => {
            try {
                await this.mutuelleStore.deleteMutuelle(id);
                await this.render();
                CustomModal.show('Mutuelle supprimée', 'success');
            } catch (error) {
                CustomModal.show('Erreur: ' + error.message, 'error');
            }
        });
    }

    async refresh() {
        await this.mutuelleStore.loadMutuelles();
        await this.render();
    }
}