import { plantsApi, plantVarietiesApi, productionRecordsApi } from '../../PlantProd/index.js';
import { apiClient, CustomModal } from '../../shared/index.js';

export class PlantProductionTable {
    constructor(containerSelector) {
        this.containerSelector = containerSelector;
        this.container = null;
        this.currentMutuelleId = null;
        this.currentPlant = null;
    }

    async render() {
        this.container = document.querySelector(this.containerSelector);
        if (!this.container) {
            console.warn('PlantProductionTable: Container not found', this.containerSelector);
            return;
        }
        
        try {
            const plants = await plantsApi.getAll();
            this.renderPlantGrid(plants);
        } catch (error) {
            console.error('Error loading plants:', error);
            this.container.innerHTML = `<div class="error-message">Error loading plants: ${error.message}</div>`;
        }
    }

    getPlantIcon(category) {
        const icons = {
            'cereals': 'wheat',
            'legumes': 'box',
            'forage': 'leaf',
            'oilseeds': 'flower',
            'vegetables': 'carrot'
        };
        return icons[category?.toLowerCase()] || 'sprout';
    }

    renderPlantGrid(plants) {
        if (!this.container) return;

        const container = this.container.querySelector('.plant-production-container');
        if (container) {
            const grid = container.querySelector('.herd-menu-grid');
            if (grid) {
                const cardsHtml = plants.map(plant => `
                    <div class="formal-action-card" onclick="window.handlePlantAction('${plant._id}', '${this.escapeHtml(plant.name)}')">
                        <div class="action-card-icon">
                            <i data-lucide="${this.getPlantIcon(plant.category)}"></i>
                        </div>
                        <div class="action-card-text">
                            <div class="action-card-title">${this.escapeHtml(plant.name)}</div>
                            <div class="action-card-desc">${this.escapeHtml(plant.category || '')}</div>
                        </div>
                    </div>
                `).join('');
                
                const headerCard = grid.querySelector('.active-card');
                if (headerCard) {
                    grid.innerHTML = headerCard.outerHTML + cardsHtml;
                }
                
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async renderVarietiesDashboard(plantId, plantName) {
        this.container = document.querySelector(this.containerSelector);
        if (!this.container) return;

        const state = window.mutuelleStore?.getState();
        const mutuelleId = state?.selectedMutuelleId;

        if (!mutuelleId) {
            CustomModal.show('Please select a mutuelle first', 'warning');
            return;
        }

        try {
            // Fetch varieties and production records
            const [varieties, records] = await Promise.all([
                plantVarietiesApi.getByPlantId(plantId),
                productionRecordsApi.getByMutuelle(mutuelleId)
            ]);

            if (varieties.length === 0) {
                CustomModal.show(`No varieties found for ${plantName}. Please add varieties first from the admin panel.`, 'info');
                return;
            }

            // Filter records for the selected plant
            const plantRecords = records.filter(r => r.varietyId && (r.varietyId.plantId === plantId || r.varietyId.plant === plantId));

            // Load the template
            const response = await fetch('src/Mutuelle/pages/plant_varieties.html');
            const html = await response.text();
            
            // Inject template into the container
            // We use laborForceContainer to replace the plant grid
            const laborContainer = document.getElementById('laborForceContainer');
            if (laborContainer) {
                laborContainer.innerHTML = html;
                
                // Hide Add Plant button in variety view
                const addPlantBtn = document.getElementById('addPlantBtn');
                if (addPlantBtn) addPlantBtn.style.display = 'none';

                // Hide Header Actions Group when in variety view
                const headerActions = document.querySelector('.header-actions-group');
                if (headerActions) headerActions.style.display = 'none';

                // Update UI with data
                this.updateDashboardUI(plantName, varieties, plantRecords);
                
                // Initialize icons
                if (window.lucide) window.lucide.createIcons();
            }

        } catch (error) {
            console.error('Error rendering varieties dashboard:', error);
            CustomModal.show(`Error: ${error.message}`, 'error');
        }
    }

    updateDashboardUI(plantName, varieties, records) {
        // Calculate Statistics
        let totalSurface = 0;
        let totalProduction = 0;
        let totalCosts = 0;
        
        const varietyStats = varieties.map(v => {
            const vRecords = records.filter(r => (r.varietyId?._id === v._id || r.varietyId === v._id));
            const vSurface = vRecords.reduce((sum, r) => sum + (parseFloat(r.surfaceHa) || 0), 0);
            const vProduction = vRecords.reduce((sum, r) => sum + (parseFloat(r.totalYield) || 0), 0);
            const vCosts = vRecords.reduce((sum, r) => sum + (parseFloat(r.totalVariableCosts) || 0), 0);
            
            // Extract history data for sparkline (yield over seasons)
            const history = vRecords
                .sort((a, b) => a.season.localeCompare(b.season))
                .map(r => parseFloat(r.totalYield) || 0);

            totalSurface += vSurface;
            totalProduction += vProduction;
            totalCosts += vCosts;
            
            return {
                ...v,
                surface: vSurface,
                production: vProduction,
                costs: vCosts,
                history: history,
                avgYield: vSurface > 0 ? (vProduction / vSurface).toFixed(2) : 0,
                costPerHa: vSurface > 0 ? (vCosts / vSurface).toFixed(2) : 0
            };
        });

        const avgYield = totalSurface > 0 ? (totalProduction / totalSurface).toFixed(2) : 0;

        // Update Stats in UI
        const surfaceEl = document.getElementById('totalSurfaceValue');
        const productionEl = document.getElementById('totalProductionValue');
        const yieldEl = document.getElementById('avgYieldValue');

        if (surfaceEl) surfaceEl.textContent = `${totalSurface.toLocaleString()} Ha`;
        if (productionEl) productionEl.textContent = `${totalProduction.toLocaleString()} Tonnes`;
        if (yieldEl) yieldEl.textContent = `${avgYield} T/Ha`;

        // Render Variety Cards (sparklines)
        const cardsContainer = document.getElementById('varietiesCardsContainer');
        if (cardsContainer) {
            cardsContainer.innerHTML = varietyStats.map(v => `
                <div class="variety-summary-card">
                    <div class="variety-card-header">
                        <i data-lucide="leaf" style="width: 16px; height: 16px; color: #c41a14;"></i>
                        <div class="variety-card-title">${v.name}</div>
                    </div>
                    <div class="variety-card-main">
                        <div>
                            <div style="font-size: 0.75rem; color: #666;">Surface (Ha):</div>
                            <div class="variety-surface-value">${v.surface.toLocaleString()}</div>
                        </div>
                        <div class="sparkline-container" id="sparkline-${v._id}">
                            <canvas id="canvas-sparkline-${v._id}" style="width: 120px; height: 50px;"></canvas>
                        </div>
                    </div>
                </div>
            `).join('');
            
            varietyStats.forEach(v => {
                // Pass history array to sparkline
                this.renderSparkline(`canvas-sparkline-${v._id}`, v.history);
            });
        }

        // Render Table Rows
        const tbody = document.getElementById('varietiesTableBody');
        if (tbody) {
            tbody.innerHTML = varietyStats.map(v => `
                <tr>
                    <td style="font-weight: 600;">${v.name}</td>
                    <td>${v.surface.toLocaleString()} ha</td>
                    <td>${v.averageYield || '3.5'}</td>
                    <td>${((v.averageYield || 3.5) * v.surface).toLocaleString()} T</td>
                    <td>${v.production.toLocaleString()} T</td>
                    <td>${parseFloat(v.costPerHa).toLocaleString()}</td>
                </tr>
            `).join('');
        }
        // Collect unique seasons for the chart labels
        const seasons = [...new Set(records.map(r => r.season))].sort();
        const chartLabels = seasons.length > 0 ? seasons : ['2023', '2024', '2025', '2026', '2027', '2028'];

        // Initialize Charts with dynamic labels
        this.initDashboardCharts(varietyStats, chartLabels, records);
        
        // Setup Back Button
        window.backToPlants = () => {
            const headerActions = document.querySelector('.header-actions-group');
            if (headerActions) headerActions.style.display = 'flex';
            
            const initPlantProduction = window.initPlantProduction;
            if (initPlantProduction) initPlantProduction();
        };
    }

    renderSparkline(canvasId, historyData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Ensure we have at least 2 points for a line, or pad with zeros
        const data = historyData.length > 1 ? historyData : (historyData.length === 1 ? [historyData[0] * 0.8, historyData[0]] : [0, 0]);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(() => ''),
                datasets: [{
                    data: data,
                    borderColor: '#c41a14',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(196, 26, 20, 0.1)'
                }]
            },
            options: {
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: { x: { display: false }, y: { display: false } },
                maintainAspectRatio: false,
                responsive: true
            }
        });
    }

    initDashboardCharts(varietyStats, chartLabels, allRecords) {
        // Production Area Chart
        const prodCtx = document.getElementById('productionAreaChart');
        if (prodCtx) {
            new Chart(prodCtx, {
                type: 'line',
                data: {
                    labels: chartLabels,
                    datasets: varietyStats.map((v, i) => ({
                        label: v.name,
                        data: chartLabels.map(season => {
                            const record = allRecords.find(r => 
                                (r.varietyId?._id === v._id || r.varietyId === v._id) && 
                                r.season === season
                            );
                            return record ? parseFloat(record.totalYield) || 0 : 0;
                        }),
                        fill: true,
                        backgroundColor: `rgba(${200 - i * 50}, ${50 + i * 40}, ${50 + i * 20}, 0.2)`,
                        borderColor: `rgba(${200 - i * 50}, ${50 + i * 40}, ${50 + i * 20}, 1)`,
                        tension: 0.4
                    }))
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top', labels: { boxWidth: 10, usePointStyle: true } }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { color: '#f1f3f5' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // Surface Donut Chart
        const surfCtx = document.getElementById('surfaceDonutChart');
        if (surfCtx) {
            new Chart(surfCtx, {
                type: 'doughnut',
                data: {
                    labels: varietyStats.map(v => v.name),
                    datasets: [{
                        data: varietyStats.map(v => v.surface),
                        backgroundColor: ['#c41a14', '#1a3a5f', '#198754', '#ffc107', '#0d6efd'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true } }
                    }
                }
            });
        }

        // Production Costs Bar Chart
        const costCtx = document.getElementById('productionCostsBarChart');
        if (costCtx) {
            new Chart(costCtx, {
                type: 'bar',
                data: {
                    labels: varietyStats.map(v => v.name),
                    datasets: [{
                        label: 'Coût (DT/Ha)',
                        data: varietyStats.map(v => v.costPerHa),
                        backgroundColor: ['#c41a14', '#1a3a5f', '#198754', '#ffc107', '#0d6efd'],
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { color: '#f1f3f5' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // Profit Margin Chart (Revenue - Costs)
        // Note: Assuming a fixed price per tonne for margin simulation
        const profitCtx = document.getElementById('profitMarginBarChart');
        if (profitCtx) {
            const pricePerTonne = 500; // Simulated price
            new Chart(profitCtx, {
                type: 'bar',
                data: {
                    labels: varietyStats.map(v => v.name),
                    datasets: [{
                        label: 'Marge Potentielle',
                        data: varietyStats.map(v => Math.max(0, (v.production * pricePerTonne) - v.costs)),
                        backgroundColor: '#1a3a5f',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { color: '#f1f3f5' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
    }
}

export const plantProductionTable = new PlantProductionTable('#laborForceContainer');

window.handlePlantAction = async function(plantId, plantName) {
    if (typeof playSuccessSound === 'function') playSuccessSound();
    await plantProductionTable.renderVarietiesDashboard(plantId, plantName);
};

export const initPlantProduction = async function() {
    const laborContainer = document.getElementById('laborForceContainer');
    if (!laborContainer) return;

    // Show Add Plant button, hide Add Labor button
    const addPlantBtn = document.getElementById('addPlantBtn');
    if (addPlantBtn) addPlantBtn.style.display = 'flex';
    
    const addLaborBtn = document.getElementById('addLaborDataBtn');
    if (addLaborBtn) addLaborBtn.style.display = 'none';

    if (!laborContainer.querySelector('.plant-production-container')) {
        try {
            const response = await fetch('src/Mutuelle/pages/plant_production.html');
            laborContainer.innerHTML = await response.text();
            
            const sidebar = document.getElementById('dashboardSidebar');
            if (sidebar) sidebar.style.display = 'none';
        } catch (e) {
            console.error('Error loading plant production layout:', e);
        }
    }

    await plantProductionTable.render();
};

window.initPlantProduction = initPlantProduction;
window.plantProductionTable = plantProductionTable;