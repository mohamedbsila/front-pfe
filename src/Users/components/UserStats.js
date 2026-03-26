export class UserStats {
    constructor() {
        this.totalEl = document.getElementById('totalUsersCount');
        this.activeEl = document.getElementById('activeUsersCount');
        this.onlineEl = document.getElementById('onlineUsersCount');
    }

    update(stats) {
        if (!this.totalEl || !this.activeEl || !this.onlineEl) return;

        this.animateNumber(this.totalEl, stats.total);
        this.animateNumber(this.activeEl, stats.active);
        this.animateNumber(this.onlineEl, stats.online);
    }

    animateNumber(element, target) {
        let current = parseInt(element.textContent) || 0;
        if (isNaN(current)) current = 0;

        const increment = target > current ? 1 : -1;
        const steps = Math.abs(target - current);
        if (steps === 0) {
            element.textContent = target;
            return;
        }

        const duration = 500;
        const stepTime = Math.max(duration / steps, 20);

        const timer = setInterval(() => {
            current += increment;
            element.textContent = current;
            if (current === target) clearInterval(timer);
        }, stepTime);
    }
}

export const userStats = new UserStats();