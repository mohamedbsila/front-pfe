import { useAuth } from '../hooks/index.js';
import { CustomModal } from '../../shared/components/index.js';

export class LoginForm {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.auth = useAuth();
        this.onSuccess = null;
        this.onToggle = null;
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="form-group">
                <label for="username">Nom d'utilisateur (Email)</label>
                <input type="text" id="username" class="form-input" placeholder="Entrez votre email" required>
            </div>
            <div class="form-group">
                <label for="password">Mot de passe</label>
                <input type="password" id="password" class="form-input" placeholder="Entrez votre mot de passe" required>
            </div>
            <button type="submit" class="btn-login">Se connecter</button>
            <div style="text-align: center; margin-top: 1rem; font-size: 0.9rem;">
                <p>Nouveau ? <a href="#" class="toggle-auth-link" style="color: #2c3e50; font-weight: bold;">Créer un compte</a></p>
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

        const toggleLink = this.container.querySelector('.toggle-auth-link');
        if (toggleLink) {
            toggleLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.onToggle) this.onToggle();
            });
        }
    }

    async handleSubmit(event) {
        event.preventDefault();

        const email = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const loginBtn = event.target.querySelector('button');
        const originalBtnText = loginBtn.textContent;
        loginBtn.disabled = true;
        loginBtn.textContent = 'Connexion...';

        try {
            console.log('Login attempt:', email);
            await this.auth.login(email, password);
            console.log('Login successful!');
            
            try { playSuccessSound(); } catch (e) {}
            
            if (this.onSuccess) {
                this.onSuccess();
            } else if (typeof initApp === 'function') {
                await initApp();
            } else {
                location.reload();
            }
        } catch (error) {
            console.error('Login failed:', error);
            try { playErrorSound(); } catch (e) {}
            const message = error.message || 'Identifiants incorrects';
            CustomModal.show(message, 'error');
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = originalBtnText;
        }
    }

    setOnSuccess(callback) {
        this.onSuccess = callback;
    }

    setOnToggle(callback) {
        this.onToggle = callback;
    }
}