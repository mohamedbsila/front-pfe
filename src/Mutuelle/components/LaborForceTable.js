import { useMutuelle, useLaborData } from '../hooks/index.js';

export class LaborForceTable {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.mutuelleStore = useMutuelle();
        this.laborStore = useLaborData();
    }

    async render(year) {
        if (!this.container) return;

        const state = this.mutuelleStore.getState();
        const mutuelleId = state.selectedMutuelleId;
        
        if (!mutuelleId) return;

        // Load template if needed
        const tableBody = this.container.querySelector('#laborTableBody');
        if (!tableBody) {
            try {
                const response = await fetch('pages/mutuelle/labor_force.html');
                const html = await response.text();
                this.container.innerHTML = html;
            } catch (e) {
                console.error('Error loading labor force template:', e);
            }
        }

        // Load data
        const data = await this.laborStore.loadLaborData(mutuelleId, year);
        
        // Update current year in store so charts render the correctly selected year
        this.laborStore.setCurrentYear(year);
        
        // Update stats
        this.updateStats(data.total);
        
        // Update table
        const tbody = this.container.querySelector('#laborTableBody');
        if (tbody && data.data) {
            tbody.innerHTML = `
                ${data.data.map(row => `
                    <tr>
                        <td style="font-weight: 700;">${row.cat}</td>
                        <td>${row.days}</td>
                        <td style="font-family: monospace;">${row.gross}</td>
                        <td style="font-family: monospace;">${row.social}</td>
                        <td style="font-family: monospace; font-weight: 600;">${row.total}</td>
                        <td><span class="metric-badge">${row.avg}</span></td>
                    </tr>
                `).join('')}
                <tr class="total-row">
                    <td style="text-align: center;">${data.total.cat}</td>
                    <td>${data.total.days}</td>
                    <td>${data.total.gross}</td>
                    <td>${data.total.social}</td>
                    <td>${data.total.total}</td>
                    <td style="color: #6c757d;">${data.total.avg}</td>
                </tr>
            `;
        }

        // Render charts after DOM update
        setTimeout(() => {
            this.renderCharts();
        }, 100);

        // Fetch remaining years data silently for historical trend chart
        setTimeout(async () => {
            const laborState = this.laborStore.getState();
            const availableYears = laborState.availableYears || [];
            let hasNewData = false;
            
            for (const y of availableYears) {
                if (y.toString() !== year.toString() && !laborState.yearlyData[y]) {
                    // Fetch data for this year for historical trend
                    await this.laborStore.loadLaborData(mutuelleId, y);
                    hasNewData = true;
                }
            }
            
            if (hasNewData) {
                // Re-render the trend chart once all historical data is loaded
                this.renderTrendChart();
            }
        }, 300);
    }

    updateStats(total) {
        const statTotalDays = document.getElementById('stat-total-days');
        const statMassSalary = document.getElementById('stat-mass-salary');
        const statSocialCover = document.getElementById('stat-social-cover');

        if (statTotalDays) this.animateValue(statTotalDays, total.days);
        if (statMassSalary) this.animateValue(statMassSalary, total.total + ' DT');
        if (statSocialCover) this.animateValue(statSocialCover, total.social + ' DT');
    }

    animateValue(element, targetStr) {
        // Apply visual bounce and fade in effect
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px) scale(0.95)';
        element.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

        // Clean the string to extract the number correctly (handling spaces and commas from French locale)
        const rawNumStr = targetStr.replace(/[^\d,\.-]/g, '').replace(',', '.');
        const targetNum = parseFloat(rawNumStr);
        
        if (isNaN(targetNum)) {
            element.textContent = targetStr;
            requestAnimationFrame(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0) scale(1)';
            });
            return;
        }

        const isDT = targetStr.includes('DT');
        
        // Count decimal places of the original to maintain the same formatting
        const fractionMatch = rawNumStr.match(/\.(\d+)/);
        const decimals = fractionMatch ? fractionMatch[1].length : 0;

        const duration = 1200; // 1.2 seconds animation
        let startTimestamp = null;
        const initialNum = 0;

        const animationStep = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // easeOutQuart easing function
            const ease = 1 - Math.pow(1 - progress, 4);
            const currentNum = initialNum + (targetNum - initialNum) * ease;

            const formatted = currentNum.toLocaleString('fr-FR', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });

            element.textContent = isDT ? formatted + ' DT' : formatted;

            if (progress < 1) {
                requestAnimationFrame(animationStep);
            } else {
                element.textContent = targetStr; // Set to exact original string
            }
        };

        // Start animation frame
        requestAnimationFrame((t) => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) scale(1)';
            requestAnimationFrame(animationStep);
        });
    }

    renderCharts() {
        this.renderTrendChart();
        this.renderCategoryChart();
        this.renderBudgetChart();
        this.renderWageChart();
        this.renderCompositionChart();
    }

    renderTrendChart() {
        const ctx = document.getElementById('laborTrendChart');
        if (!ctx || typeof Chart === 'undefined') return;

        // Destroy existing chart on this canvas to prevent "Canvas is already in use" error
        const existingChart = Chart.getChart(ctx);
        if (existingChart) {
            existingChart.destroy();
        }

        const state = this.laborStore.getState();
        const labels = Object.keys(state.yearlyData).sort();
        
        const payrollData = labels.map(year => {
            const yearData = state.yearlyData[year];
            return yearData ? this.laborStore.parseProFloat(yearData.total.total) : 0;
        });

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Masse Salariale Totale (DT)',
                    data: payrollData,
                    borderColor: '#c41a14ff',
                    backgroundColor: 'rgba(196, 26, 20, 0.05)',
                    borderWidth: 3,
                    pointBackgroundColor: '#212529',
                    pointBorderColor: '#c41a14ff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    tension: 0.35,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: false, grid: { color: '#f0f0f0' } },
                    x: { grid: { display: false } }
                }
            }
        });

        this.laborStore.setChart('trend', chart);
    }

    renderCategoryChart() {
        const ctx = document.getElementById('laborCategoryChart');
        if (!ctx || typeof Chart === 'undefined') return;

        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();

        const state = this.laborStore.getState();
        const currentData = state.yearlyData[state.currentYear];
        
        if (!currentData) return;

        const labels = currentData.data.map(row => row.cat);
        const totalDays = this.laborStore.parseProFloat(currentData.total.days);
        const distributionData = currentData.data.map(row => {
            const days = this.laborStore.parseProFloat(row.days);
            return totalDays > 0 ? ((days / totalDays) * 100).toFixed(1) : 0;
        });

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: distributionData,
                    backgroundColor: ['#c41a14ff', '#2563eb', '#059669'],
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true } }
                }
            }
        });

        this.laborStore.setChart('category', chart);
    }

    renderBudgetChart() {
        const ctx = document.getElementById('laborBudgetChart');
        if (!ctx || typeof Chart === 'undefined') return;

        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();

        const state = this.laborStore.getState();
        const currentData = state.yearlyData[state.currentYear];
        
        if (!currentData) return;

        const labels = currentData.data.map(row => row.cat);
        const totalCost = currentData.data.reduce((sum, row) => sum + this.laborStore.parseProFloat(row.total), 0);
        const budgetData = currentData.data.map(row => {
            const cost = this.laborStore.parseProFloat(row.total);
            return totalCost > 0 ? ((cost / totalCost) * 100).toFixed(1) : 0;
        });

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: budgetData,
                    backgroundColor: ['#7c3aed', '#ea580c', '#0d9488'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } }
            }
        });

        this.laborStore.setChart('budget', chart);
    }

    renderWageChart() {
        const ctx = document.getElementById('laborWageChart');
        if (!ctx || typeof Chart === 'undefined') return;

        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();

        const state = this.laborStore.getState();
        const currentData = state.yearlyData[state.currentYear];
        
        if (!currentData || !currentData.data) return;

        const labels = currentData.data.map(row => row.cat);
        const avgData = currentData.data.map(row => this.laborStore.parseProFloat(row.avg));

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Moyenne DT/Jour',
                    data: avgData,
                    backgroundColor: '#10b981',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
        this.laborStore.setChart('wage', chart);
    }

    renderCompositionChart() {
        const ctx = document.getElementById('laborCompositionChart');
        if (!ctx || typeof Chart === 'undefined') return;

        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();

        const state = this.laborStore.getState();
        const currentData = state.yearlyData[state.currentYear];
        
        if (!currentData || !currentData.total) return;

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Salaire Brut', 'Couverture Sociale'],
                datasets: [{
                    data: [
                        this.laborStore.parseProFloat(currentData.total.gross),
                        this.laborStore.parseProFloat(currentData.total.social)
                    ],
                    backgroundColor: ['#3b82f6', '#f59e0b'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } }
            }
        });
        this.laborStore.setChart('composition', chart);
    }
}
