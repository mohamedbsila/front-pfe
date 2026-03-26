import { LoginForm } from './LoginForm.js';
import { RegisterForm } from './RegisterForm.js';

export class AuthToggle {
    constructor(options = {}) {
        this.titleSelector = options.titleSelector || '.login-title';
        this.formSelector = options.formSelector || '.login-form';
        this.isLoginMode = true;
        this.loginForm = null;
        this.registerForm = null;
        this.onSuccess = options.onSuccess || null;
    }

    init() {
        this.render();
    }

    render() {
        const title = document.querySelector(this.titleSelector);
        const form = document.querySelector(this.formSelector);

        if (!title || !form) return;

        if (this.isLoginMode) {
            title.textContent = 'Bureau de Contrôle';
            this.renderLoginForm(form);
        } else {
            title.textContent = 'Création de Compte';
            this.renderRegisterForm(form);
        }
    }

    renderLoginForm(formContainer) {
        this.loginForm = new LoginForm(this.formSelector);
        this.loginForm.setOnSuccess(this.onSuccess);
        this.loginForm.setOnToggle(() => this.toggle());
        this.loginForm.render();
    }

    renderRegisterForm(formContainer) {
        this.registerForm = new RegisterForm(this.formSelector);
        this.registerForm.setOnSwitchToLogin(() => this.toggle());
        this.registerForm.render();
    }

    toggle() {
        this.isLoginMode = !this.isLoginMode;
        
        try {
            playClickSound();
        } catch (e) {}

        this.render();
    }

    switchToLogin() {
        this.isLoginMode = true;
        this.render();
    }

    switchToRegister() {
        this.isLoginMode = false;
        this.render();
    }

    isLogin() {
        return this.isLoginMode;
    }
}