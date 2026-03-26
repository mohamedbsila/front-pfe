import { useMutuelle, useWorkshopData } from '../hooks/index.js';

export class WorkshopTable {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.mutuelleStore = useMutuelle();
        this.workshopStore = useWorkshopData();
    }

    async render(year) {
        if (!this.container) return;

        const state = this.mutuelleStore.getState();
        const mutuelleId = state.selectedMutuelleId;

        if (!mutuelleId) return;

        // Load template if needed
        const tableBody = this.container.querySelector('#workshopTableBody');
        if (!tableBody) {
            try {
                const response = await fetch('pages/mutuelle/workshop.html');
                const html = await response.text();
                this.container.innerHTML = html;
            } catch (e) {
                console.error('Error loading workshop template:', e);
            }
        }

        // Load data
        const data = await this.workshopStore.loadWorkshopData(mutuelleId, year);

        // Update current year in store
        this.workshopStore.setCurrentYear(year);

        // Update stats cards with animated counters
        this.updateStats(data.total, data.kpis, data.hourlyCosts);

        // Update table body
        const tbody = this.container.querySelector('#workshopTableBody');
        if (tbody && data.data) {
            tbody.innerHTML = `
                ${data.data.map(row => `
                    <tr>
                        <td style="font-weight: 700; text-align: center;">${row.machine}</td>
                        <td style="font-family: monospace;">${row.workHours}</td>
                        <td style="font-family: monospace;">${row.workHoursValue}</td>
                        <td style="font-family: monospace;">${row.fuelQty}</td>
                        <td style="font-family: monospace;">${row.fuelValue}</td>
                        <td style="font-family: monospace;">${row.oils}</td>
                        <td style="font-family: monospace;">${row.spareParts}</td>
                        <td style="font-family: monospace;">${row.externalLabor}</td>
                        <td style="font-family: monospace;">${row.workshop}</td>
                        <td style="font-family: monospace;">${row.insurance}</td>
                        <td style="font-family: monospace;">${row.depreciation}</td>
                        <td style="font-family: monospace;">${row.driverDays}</td>
                        <td style="font-family: monospace;">${row.driverValue}</td>
                        <td style="font-family: monospace; font-weight: 600;">${row.totalCost}</td>
                    </tr>
                `).join('')}
                <tr class="total-row">
                    <td style="text-align: center; font-weight: 800;">${data.total.machine}</td>
                    <td>${data.total.workHours}</td>
                    <td>${data.total.workHoursValue}</td>
                    <td>${data.total.fuelQty}</td>
                    <td>${data.total.fuelValue}</td>
                    <td>${data.total.oils}</td>
                    <td>${data.total.spareParts}</td>
                    <td>${data.total.externalLabor}</td>
                    <td>${data.total.workshop}</td>
                    <td>${data.total.insurance}</td>
                    <td>${data.total.depreciation}</td>
                    <td>${data.total.driverDays}</td>
                    <td>${data.total.driverValue}</td>
                    <td>${data.total.totalCost}</td>
                </tr>
            `;
        }

        // Render charts after DOM update
        setTimeout(() => {
            this.renderCharts();
        }, 100);

        // Fetch remaining years data for historical trend
        setTimeout(async () => {
            const wsState = this.workshopStore.getState();
            const availableYears = wsState.availableYears || [];
            let hasNewData = false;

            for (const y of availableYears) {
                if (y.toString() !== year.toString() && !wsState.yearlyData[y]) {
                    await this.workshopStore.loadWorkshopData(mutuelleId, y);
                    hasNewData = true;
                }
            }

            if (hasNewData) {
                this.renderTrendChart();
            }
        }, 300);
    }

    updateStats(total, kpis, hourlyCosts) {
        // Top summary cards
        const statHours = document.getElementById('stat-workshop-hours');
        const statCost = document.getElementById('stat-workshop-cost');
        const statMaint = document.getElementById('stat-workshop-maint');

        if (statHours) this.animateValue(statHours, total.workHours);
        if (statCost) this.animateValue(statCost, total.totalCost + ' DT');

        const maintTotal = (total._spareParts || 0) + (total._externalLabor || 0) + (total._workshop || 0);
        if (statMaint) this.animateValue(statMaint, maintTotal.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' DT');

        // Circular KPI percentage overlays
        this.updateCircleOverlay('availabilityCircle', kpis.availability);
        this.updateCircleOverlay('performanceCircle', kpis.performance);
        this.updateCircleOverlay('efficiencyCircle', kpis.efficiency);

        // Bottom hourly cost cards
        const tractorEl = document.getElementById('tractor-hour-cost');
        const attachEl = document.getElementById('attachment-hour-cost');
        const harvesterEl = document.getElementById('harvester-hour-cost');

        if (tractorEl) this.animateValue(tractorEl, hourlyCosts.tractor.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }));
        if (attachEl) this.animateValue(attachEl, hourlyCosts.mechanization.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }));
        if (harvesterEl) this.animateValue(harvesterEl, hourlyCosts.harvester.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }));
    }

    updateCircleOverlay(canvasId, percentValue) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        // Find the sibling overlay div and update its text
        const parent = canvas.parentElement;
        if (parent) {
            const overlay = parent.querySelector('div');
            if (overlay) overlay.textContent = `${percentValue}%`;
        }
    }

    animateValue(element, targetStr) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px) scale(0.95)';
        element.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

        const rawNumStr = targetStr.toString().replace(/[^\d,.\-]/g, '').replace(',', '.');
        const targetNum = parseFloat(rawNumStr);

        if (isNaN(targetNum)) {
            element.textContent = targetStr;
            requestAnimationFrame(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0) scale(1)';
            });
            return;
        }

        const isDT = targetStr.toString().includes('DT');

        const fractionMatch = rawNumStr.match(/\.(\d+)/);
        const decimals = fractionMatch ? fractionMatch[1].length : 0;

        const duration = 1200;
        let startTimestamp = null;

        const animationStep = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            const ease = 1 - Math.pow(1 - progress, 4);
            const currentNum = targetNum * ease;

            const formatted = currentNum.toLocaleString('fr-FR', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });

            element.textContent = isDT ? formatted + ' DT' : formatted;

            if (progress < 1) {
                requestAnimationFrame(animationStep);
            } else {
                element.textContent = targetStr;
            }
        };

        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) scale(1)';
            requestAnimationFrame(animationStep);
        });
    }

    // ===== Chart Rendering =====

    renderCharts() {
        this.renderTrendChart();
        this.renderTypeChart();
        this.renderCircleCharts();
    }

    renderTrendChart() {
        const ctx = document.getElementById('workshopTrendChart');
        if (!ctx || typeof Chart === 'undefined') return;

        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();

        const state = this.workshopStore.getState();
        const labels = Object.keys(state.yearlyData).sort();

        const costData = labels.map(year => {
            const yearData = state.yearlyData[year];
            return yearData ? yearData.total._totalCost : 0;
        });

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Coût Total Maintenance (DT)',
                    data: costData,
                    borderColor: '#7c3aed',
                    backgroundColor: 'rgba(124, 58, 237, 0.05)',
                    borderWidth: 3,
                    pointBackgroundColor: '#212529',
                    pointBorderColor: '#7c3aed',
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

        this.workshopStore.setChart('trend', chart);
    }

    renderTypeChart() {
        const ctx = document.getElementById('workshopTypeChart');
        if (!ctx || typeof Chart === 'undefined') return;

        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();

        const state = this.workshopStore.getState();
        const currentData = state.yearlyData[state.currentYear];

        if (!currentData || !currentData.data || currentData.data.length === 0) return;

        const labels = currentData.data.map(row => row.machine);
        const totalCost = currentData.total._totalCost || 1;
        const distributionData = currentData.data.map(row => {
            return ((row._totalCost / totalCost) * 100).toFixed(1);
        });

        const colors = ['#c41a14', '#2563eb', '#059669', '#ea580c', '#7c3aed', '#0d9488', '#dc2626', '#f59e0b'];

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: distributionData,
                    backgroundColor: colors.slice(0, labels.length),
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
                    legend: { position: 'bottom', labels: { usePointStyle: true, font: { size: 11 } } }
                }
            }
        });

        this.workshopStore.setChart('type', chart);
    }

    renderCircleCharts() {
        const state = this.workshopStore.getState();
        const currentData = state.yearlyData[state.currentYear];
        if (!currentData) return;

        this.renderSingleCircle('availabilityCircle', currentData.kpis.availability, '#059669', 'availability');
        this.renderSingleCircle('performanceCircle', currentData.kpis.performance, '#2563eb', 'performance');
        this.renderSingleCircle('efficiencyCircle', currentData.kpis.efficiency, '#ea580c', 'efficiency');
    }

    renderSingleCircle(canvasId, value, color, chartKey) {
        const ctx = document.getElementById(canvasId);
        if (!ctx || typeof Chart === 'undefined') return;

        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Actuel', 'Restant'],
                datasets: [{
                    data: [value, 100 - value],
                    backgroundColor: [color, '#f0f0f0'],
                    borderWidth: 0,
                    hoverOffset: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '80%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                animation: {
                    animateRotate: true,
                    duration: 1200,
                    easing: 'easeOutQuart'
                }
            }
        });

        this.workshopStore.setChart(chartKey, chart);
    }
}
