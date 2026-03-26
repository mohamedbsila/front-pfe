import { plantsApi } from '../services/PlantProdApi.js';
import { CustomModal } from '../../shared/components/index.js';

// ─── Inject styles once ───────────────────────────────────────────────────────
const STYLE_ID = 'add-plant-modal-styles';
if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── Overlay ── */
        #customModal.show {
            animation: modalFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes modalFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
        }

        /* ── Remove padding from default modal content ── */
        #customModal .modal-content:has(.apm-panel) {
            padding: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
            max-width: none !important;
        }
        
        #customModal .modal-content:has(.apm-panel) #modalMessage {
            margin: 0 !important;
            padding: 0 !important;
            width: 100%;
        }

        /* ── Panel ── */
        .apm-panel {
            background: #fdf8f8;
            border-radius: 20px;
            box-shadow:
                0 2px 4px rgba(198,12,48,0.04),
                0 12px 40px rgba(198,12,48,0.14),
                0 0 0 1px rgba(198,12,48,0.06);
            overflow: hidden;
            animation: panelRise 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            max-width: 480px;
            width: 100%;
            margin: auto;
        }
        @keyframes panelRise {
            from { opacity: 0; transform: translateY(24px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }

        /* ── Header band ── */
        .apm-header {
            background: linear-gradient(135deg, #8b0820 0%, #C60C30 60%, #e01040 100%);
            padding: 28px 32px 24px;
            position: relative;
            overflow: hidden;
        }
        .apm-header::before {
            content: '';
            position: absolute;
            inset: 0;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .apm-header-icon {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 14px;
        }
        .apm-title {
            font-family: 'Cormorant Garamond', Georgia, serif;
            font-size: 1.75rem;
            font-weight: 700;
            color: #fff;
            line-height: 1.15;
            margin: 0 0 4px;
            letter-spacing: -0.01em;
        }
        .apm-subtitle {
            font-family: 'DM Sans', sans-serif;
            font-size: 0.8rem;
            font-weight: 300;
            color: rgba(255,255,255,0.6);
            letter-spacing: 0.12em;
            text-transform: uppercase;
        }
        .apm-header-leaf {
            position: absolute;
            right: -10px;
            bottom: -18px;
            opacity: 0.08;
        }

        /* ── Body ── */
        .apm-body {
            padding: 28px 32px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        /* ── Field ── */
        .apm-field {
            display: flex;
            flex-direction: column;
            gap: 8px;
            animation: fieldIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .apm-field:nth-child(1) { animation-delay: 0.08s; }
        .apm-field:nth-child(2) { animation-delay: 0.14s; }
        .apm-field:nth-child(3) { animation-delay: 0.20s; }
        @keyframes fieldIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0);    }
        }

        .apm-label {
            font-family: 'DM Sans', sans-serif;
            font-size: 0.75rem;
            font-weight: 500;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #C60C30;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .apm-label span.ar {
            color: #e8748a;
            font-weight: 300;
        }
        .apm-required {
            color: #c0392b;
            font-size: 0.65rem;
        }

        .apm-input,
        .apm-select,
        .apm-textarea {
            font-family: 'DM Sans', sans-serif;
            font-size: 0.95rem;
            color: #2a0a10;
            background: #fff;
            border: 1.5px solid #f0c4cc;
            border-radius: 10px;
            padding: 11px 14px;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
            width: 100%;
            box-sizing: border-box;
        }
        .apm-input::placeholder,
        .apm-textarea::placeholder { color: #e8a8b4; }
        .apm-input:hover,
        .apm-select:hover,
        .apm-textarea:hover {
            border-color: #e8748a;
        }
        .apm-input:focus,
        .apm-select:focus,
        .apm-textarea:focus {
            border-color: #C60C30;
            box-shadow: 0 0 0 3px rgba(198,12,48,0.12);
            background: #fffafa;
        }
        .apm-select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23C60C30' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 14px center;
            padding-right: 38px;
            cursor: pointer;
        }
        .apm-textarea {
            min-height: 88px;
            resize: vertical;
            line-height: 1.5;
        }

        /* ── Divider ── */
        .apm-divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #f0c4cc, transparent);
            margin: 0 -32px;
        }

        /* ── Footer ── */
        .apm-footer {
            padding: 20px 32px 24px;
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }
        .apm-btn {
            font-family: 'DM Sans', sans-serif;
            font-size: 0.875rem;
            font-weight: 500;
            padding: 11px 24px;
            border-radius: 10px;
            border: none;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            letter-spacing: 0.02em;
        }
        .apm-btn:active { transform: scale(0.96); }

        .apm-btn-cancel {
            background: transparent;
            color: #c06070;
            border: 1.5px solid #f0c4cc;
        }
        .apm-btn-cancel:hover {
            background: #fff5f7;
            border-color: #e8748a;
            color: #C60C30;
        }

        .apm-btn-submit {
            background: linear-gradient(135deg, #8b0820, #C60C30);
            color: #fff;
            box-shadow: 0 4px 14px rgba(198,12,48,0.35);
            min-width: 140px;
        }
        .apm-btn-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(198,12,48,0.45);
        }
        .apm-btn-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        .apm-btn-submit.loading::after {
            content: '';
            display: inline-block;
            width: 12px;
            height: 12px;
            border: 2px solid rgba(255,255,255,0.4);
            border-top-color: #fff;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
            margin-left: 8px;
            vertical-align: middle;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* ── Validation shake ── */
        .apm-input.invalid {
            border-color: #c0392b !important;
            box-shadow: 0 0 0 3px rgba(192,57,43,0.12) !important;
            animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }
        @keyframes shake {
            10%, 90% { transform: translateX(-2px); }
            20%, 80% { transform: translateX( 4px); }
            30%, 50%, 70% { transform: translateX(-4px); }
            40%, 60% { transform: translateX( 4px); }
        }
    `;
    document.head.appendChild(style);
}

// ─── Leaf SVG decoration ──────────────────────────────────────────────────────
const LEAF_SVG = `
<svg class="apm-header-leaf" width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 120 C20 120 50 40 120 20 C120 20 100 80 20 120Z" fill="white"/>
  <path d="M20 120 L120 20" stroke="white" stroke-width="1.5" stroke-dasharray="4 4"/>
</svg>`;

// ─── Plant icon SVG (single-line stroke) ─────────────────────────────────────
const PLANT_ICON = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V12"/><path d="M12 12C12 12 12 7 17 5"/><path d="M12 12C12 12 12 7 7 5"/><path d="M12 16C12 16 12 12 16 10"/><path d="M12 16C12 16 12 12 8 14"/></svg>`;

// ─── Component ────────────────────────────────────────────────────────────────
export class AddPlantModal {
    constructor() {
        this.api = plantsApi;
    }

    open() {
        const modal = document.getElementById('customModal');
        const icon = document.getElementById('modalIcon');
        const title = document.getElementById('modalTitle');
        const messageEl = document.getElementById('modalMessage');
        const buttons = document.getElementById('modalButtons');

        // Hide default header elements — we render our own inside messageEl
        if (icon) icon.style.display = 'none';
        if (title) title.style.display = 'none';

        messageEl.innerHTML = `
            <div class="apm-panel">

                <!-- Header -->
                <div class="apm-header">
                    <div class="apm-header-icon">${PLANT_ICON}</div>
                    <div class="apm-title">Ajouter un Plant</div>
                    <div class="apm-subtitle">إضافة نبات جديد</div>
                    ${LEAF_SVG}
                </div>

                <!-- Fields -->
                <div class="apm-body">

                    <div class="apm-field">
                        <label class="apm-label" for="plant_name">
                            Nom du plant <span class="apm-required">*</span>
                            &nbsp;·&nbsp; <span class="ar">اسم النبات</span>
                        </label>
                        <input
                            type="text"
                            id="plant_name"
                            class="apm-input"
                            placeholder="Ex: Blé, Tomate, Olivier…"
                            autocomplete="off"
                        />
                    </div>

                    <div class="apm-field">
                        <label class="apm-label" for="plant_category">
                            Catégorie &nbsp;·&nbsp; <span class="ar">الصنف</span>
                        </label>
                        <select id="plant_category" class="apm-select">
                            <option value="Céréales">&#127806; Céréales — حبوب</option>
                            <option value="Légumes">&#129365; Légumes — خضروات</option>
                            <option value="Fruits">&#127822; Fruits — فواكه</option>
                            <option value="Fourrages">&#127811; Fourrages — أعلاف</option>
                            <option value="Oléagineux">&#127826; Oléagineux — زيتية</option>
                            <option value="Autre">&#128230; Autre — أخرى</option>
                        </select>
                    </div>

                    <div class="apm-field">
                        <label class="apm-label" for="plant_description">
                            Description &nbsp;·&nbsp; <span class="ar">الوصف</span>
                        </label>
                        <textarea
                            id="plant_description"
                            class="apm-textarea"
                            placeholder="Notes optionnelles… / ملاحظات اختيارية"
                        ></textarea>
                    </div>

                </div>

                <div class="apm-divider"></div>

                <!-- Buttons -->
                <div class="apm-footer">
                    <button class="apm-btn apm-btn-cancel"
                            onclick="CustomModal.close()">
                        Annuler &nbsp;/&nbsp; إلغاء
                    </button>
                    <button class="apm-btn apm-btn-submit"
                            id="apm-submit-btn"
                            onclick="addPlantModalInstance.submit()">
                        Ajouter le plant
                    </button>
                </div>

            </div>
        `;

        // Clear the native buttons slot
        if (buttons) buttons.innerHTML = '';

        modal.classList.add('show');

        setTimeout(() => {
            document.getElementById('plant_name')?.focus();
        }, 150);

        window.addPlantModalInstance = this;
    }

    async submit() {
        const nameInput = document.getElementById('plant_name');
        const submitBtn = document.getElementById('apm-submit-btn');
        const name = nameInput?.value.trim();
        const category = document.getElementById('plant_category')?.value;
        const description = document.getElementById('plant_description')?.value.trim();

        if (!name) {
            nameInput?.classList.add('invalid');
            nameInput?.addEventListener('input', () => nameInput.classList.remove('invalid'), { once: true });
            return;
        }

        // Loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Ajout en cours…';

        try {
            await this.api.create({
                name,
                category,
                description: description || undefined
            });
            CustomModal.close();
            CustomModal.show('Plant ajouté avec succès ! / تمت إضافة النبات بنجاح ✓', 'success');

            if (typeof window.refreshPlantsList === 'function') {
                window.refreshPlantsList();
            }
        } catch (error) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Ajouter le plant';
            CustomModal.show('Erreur : ' + error.message, 'error');
        }
    }
}

export const addPlantModal = new AddPlantModal();
