export class YearSelector {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.onYearChange = null;
    }

    setOnYearChange(callback) {
        this.onYearChange = callback;
    }

    render(availableYears, activeYear) {
        if (!this.container) return;

        this.container.innerHTML = availableYears.map(year => {
            const isActive = year === activeYear || year.toString() === activeYear.toString();
            const style = isActive
                ? 'background: #c41a14; color: #fff; box-shadow: 0 4px 10px rgba(196, 26, 20, 0.2);'
                : 'background: transparent; color: #495057;';

            return `
                <button class="year-btn ${isActive ? 'active' : ''}" 
                        id="year-btn-${year}"
                        onclick="yearSelectorInstance.handleClick(this, '${year}')" 
                        style="border: none; padding: 6px 16px; border-radius: 9px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); white-space: nowrap; ${style}">
                    ${year}
                </button>
            `;
        }).join('');

        // Ensure active year is visible
        setTimeout(() => {
            const activeBtn = document.getElementById(`year-btn-${activeYear}`);
            if (activeBtn) {
                activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }, 100);

        window.yearSelectorInstance = this;
    }

    handleClick(btn, year) {
        // Update button styles
        this.container.querySelectorAll('.year-btn').forEach(b => {
            b.classList.remove('active');
            b.style.background = 'transparent';
            b.style.color = '#495057';
            b.style.boxShadow = 'none';
        });
        
        btn.classList.add('active');
        btn.style.background = '#c41a14';
        btn.style.color = '#fff';
        btn.style.boxShadow = '0 4px 10px rgba(196, 26, 20, 0.2)';
        
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

        if (this.onYearChange) {
            this.onYearChange(year);
        }
    }
}