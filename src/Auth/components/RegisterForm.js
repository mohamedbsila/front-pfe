import { useAuth } from '../hooks/index.js';
import { CustomModal } from '../../shared/components/index.js';

export class RegisterForm {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.auth = useAuth();
        this.onSwitchToLogin = null;
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="form-group">
                <label for="regName">Nom Complet</label>
                <input type="text" id="regName" class="form-input" placeholder="Votre nom" required>
            </div>
            <div class="form-group">
                <label for="regEmail">Email</label>
                <input type="email" id="regEmail" class="form-input" placeholder="votre@email.com" required>
            </div>
            <div class="form-group">
                <label for="regPassword">Mot de passe</label>
                <input type="password" id="regPassword" class="form-input" placeholder="Min. 6 caractères" required minlength="6">
            </div>
            <button type="submit" class="btn-login">S'enregistrer</button>
            <div style="text-align: center; margin-top: 1rem; font-size: 0.9rem;">
                <p>Déjà un compte ? <a href="#" class="switch-to-login" style="color: #2c3e50; font-weight: bold;">Se connecter</a></p>
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        const form = this.container;
        if (form.tagName === 'FORM') {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        } else {
            const formElement = this.container.querySelector('form');
            if (formElement) {
                formElement.addEventListener('submit', this.handleSubmit.bind(this));
            }
        }

        const switchLink = this.container.querySelector('.switch-to-login');
        if (switchLink) {
            switchLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.onSwitchToLogin) this.onSwitchToLogin();
            });
        }
    }

    async handleSubmit(event) {
        event.preventDefault();

        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        const btn = event.target.querySelector('button');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Enregistrement...';

        try {
            await this.auth.register(name, email, password);
            CustomModal.show('Compte créé ! Vous pouvez maintenant vous connecter.', 'success');
            if (this.onSwitchToLogin) this.onSwitchToLogin();
        } catch (error) {
            console.error('Registration error:', error);
            CustomModal.show(error.message || 'Erreur lors de la création du compte', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }

    setOnSwitchToLogin(callback) {
        this.onSwitchToLogin = callback;
    }
}