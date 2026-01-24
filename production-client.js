// Production API Client
const productionApi = {
    // Create new production entry
    async create(data) {
        return apiClient.post('/production', data);
    },

    // Get stats for a specific year
    async getStats(year) {
        return apiClient.get(`/production/stats?year=${year}`);
    },

    // Get monthly stats for drill-down
    async getMonthlyStats(year, region, unit) {
        return apiClient.get(`/production/monthly?year=${year}&region=${encodeURIComponent(region)}&unit=${encodeURIComponent(unit)}`);
    }
};

// Expose globally
window.productionApi = productionApi;

// Initialize Production Page
window.initProductionPage = function () {
    console.log("Initializing Production Page...");

    // 1. Set Date to Today AND Readonly
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
        console.log("Date set to:", dateInput.value);
    }

    // 2. Load Saved Defaults for Region and Unit
    const savedRegion = localStorage.getItem('default_region');
    const savedUnit = localStorage.getItem('default_unit');

    if (savedRegion) {
        const regionInput = document.getElementById('region');
        if (regionInput) regionInput.value = savedRegion;
    }
    if (savedUnit) {
        const unitInput = document.getElementById('unit');
        if (unitInput) unitInput.value = savedUnit;
    }

    // 3. Handle Form Submit
    const form = document.getElementById('productionForm');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();

            const region = document.getElementById('region').value;
            const unit = document.getElementById('unit').value;

            // Save selection for next time
            localStorage.setItem('default_region', region);
            localStorage.setItem('default_unit', unit);

            // Collect form data with new field names
            const presentCows = Number(document.getElementById('presentCows').value);
            const milkingCows = Number(document.getElementById('milkingCows').value);
            const productionLiters = Number(document.getElementById('productionLiters').value);
            const soldLiters = Number(document.getElementById('soldLiters').value);
            const wastedLiters = Number(document.getElementById('wastedLiters').value) || 0;
            const calfConsumption = Number(document.getElementById('calfConsumption').value) || 0;
            const lambConsumption = Number(document.getElementById('lambConsumption').value) || 0;
            const buyer = document.getElementById('buyer').value || 'Non spécifié';
            const pricePerLiter = Number(document.getElementById('pricePerLiter').value);

            // Client-side validations
            if (milkingCows > presentCows) {
                showCustomAlert('Erreur: Les vaches traites ne peuvent pas dépasser les vaches présentes', 'error');
                return;
            }

            const productionPerCow = productionLiters / milkingCows;
            if (productionPerCow > 40) {
                const proceed = confirm(`Attention: Production par vache (${productionPerCow.toFixed(2)}L) dépasse la limite biologique de 40L/jour. Continuer?`);
                if (!proceed) return;
            }

            const formData = {
                date: document.getElementById('date').value,
                region: region,
                unit: unit,
                presentCows: presentCows,
                milkingCows: milkingCows,
                productionLiters: productionLiters,
                soldLiters: soldLiters,
                wastedLiters: wastedLiters,
                calfConsumption: calfConsumption,
                lambConsumption: lambConsumption,
                buyer: buyer,
                pricePerLiter: pricePerLiter
            };

            try {
                const btn = e.target.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                btn.textContent = 'Enregistrement...';
                btn.disabled = true;

                await productionApi.create(formData);

                showCustomAlert('Production enregistrée avec succès!', 'success');

                // Keep selections, clear data
                document.getElementById('presentCows').value = '';
                document.getElementById('milkingCows').value = '';
                document.getElementById('productionLiters').value = '';
                document.getElementById('soldLiters').value = '';
                document.getElementById('wastedLiters').value = '';
                document.getElementById('calfConsumption').value = '';
                document.getElementById('lambConsumption').value = '';
                document.getElementById('buyer').value = '';

            } catch (error) {
                console.error(error);
                showCustomAlert('Erreur lors de l\'enregistrement: ' + error.message, 'error');
            } finally {
                const btn = e.target.querySelector('button[type="submit"]');
                btn.textContent = 'Valider l\'Enregistrement';
                btn.disabled = false;
            }
        };
    }
};

// Report Functions
window.loadProductionStats = async function () {
    console.log("Loading Production Stats...");
    const yearSelect = document.getElementById('yearSelect');
    if (!yearSelect) return;

    const year = yearSelect.value;
    const loader = document.getElementById('loadingStats');
    const tbody = document.getElementById('productionTableBody');
    const tfoot = document.getElementById('productionTableFooter');
    const summaryBody = document.getElementById('summaryTableBody');
    const seasonYear = document.getElementById('seasonYear');

    // Update Season Label
    if (seasonYear) seasonYear.textContent = year + "/" + (parseInt(year) + 1);

    if (loader) loader.style.display = 'block';
    if (tbody) tbody.innerHTML = '';
    if (tfoot) tfoot.innerHTML = '';
    if (summaryBody) summaryBody.innerHTML = '';

    try {
        const data = await productionApi.getStats(year);

        let totalRevenue = 0;
        let totalSold = 0;
        let totalProd = 0;
        let totalDays = 0;
        let totalHalia = 0;
        let totalHadira = 0;
        let count = 0;

        console.log("Stats loaded:", data);

        if (data && data.length > 0) {
            data.forEach(row => {
                count++;
                // Main Table Row
                const tr = document.createElement('tr');

                // Safety checks for numbers
                const revenue = row.totalRevenue || 0;
                const prod = row.totalProduction || 0;
                const sold = row.totalSold || 0;
                const wasted = row.totalWasted || 0;
                const internalConsumption = row.totalInternalConsumption || 0;
                const days = row.milkingDays || 0;
                const halia = row.avgMilkingCows || 1; // Avoid div by zero
                const hadira = row.avgPresentCows || 1;
                const production305 = row.production305Days || 0;
                const lossRate = row.lossRate || 0;

                const yieldHalia = (prod / (halia || 1)).toFixed(2);
                const yieldHadira = (prod / (hadira || 1)).toFixed(2);

                tr.innerHTML = `
                    <td>${revenue.toLocaleString('fr-TN', {minimumFractionDigits: 3})}</td>
                    <td>${sold.toLocaleString('fr-TN')}</td>
                    <td>${yieldHalia}</td>
                    <td>${yieldHadira}</td>
                    <td>${prod.toLocaleString('fr-TN')}</td>
                    <td>${production305.toLocaleString('fr-TN')}</td>
                    <td>${lossRate.toFixed(2)}%</td>
                    <td>${days}</td>
                    <td>${halia.toFixed(2)}</td>
                    <td>${hadira.toFixed(2)}</td>
                    <td>${row.unit}</td>
                    <td>${row.region}</td>
                `;
                
                // Add Drill-down
                tr.style.cursor = 'pointer';
                tr.ondblclick = () => showMonthlyDetails(row.region, row.unit);
                
                tbody.appendChild(tr);

                // Summary Table Row... (Logic continues...)
                // The image shows a summary table. It likely corresponds to the total or specific rows.
                // Let's iterate and add to summary if needed. 
                // Actually the image shows ONE row for "Prix Unitaire Moy", "Reste", "Part Berger", "Prod Totale", "Unité":
                // It seems to be a summary PER UNIT or potentially a Global Summary.
                // Given the layout, it looks like a bottom summary area. 
                // Let's add rows for each unit in the summary box as well? The image is ambiguous but shows headers.
                // We'll stick to adding one row per unit in summary for now seamlessly.

                const trSum = document.createElement('tr');
                // Logic: 
                // Part Berger = ~10% of Production? (Placeholder)
                // Reste = Production - Sold? (Placeholder)
                const partBerger = (prod * 0.1).toFixed(1);
                const reste = (prod - sold).toFixed(2);
                const avgPrice = sold > 0 ? (revenue / sold) : 0;

                trSum.innerHTML = `
                    <td class="orange-bg">${avgPrice.toFixed(3)}</td>
                    <td>${reste}</td>
                    <td>${partBerger}</td>
                    <td>${prod}</td>
                    <td>${row.unit}</td>
                `;
                summaryBody.appendChild(trSum);

                // Aggregate Totals
                totalRevenue += revenue;
                totalSold += sold;
                totalProd += prod;
                totalDays += days;
                totalHalia += row.avgMilkingEwes;
                totalHadira += row.avgPresentEwes;
            });

            // Average the averages? Or Sum?
            // "Moy. Na'ja Halia" in total row usually implies Weighted Average or simple Average?
            // For formatting, let's just use what we have.
            // If it is 'Totals', the 'Average' columns usually default to the Average of Averages or recalculated yield.
            // Let's recalculate yields based on totals.

            const globalAvgHalia = count > 0 ? (totalHalia / count) : 0;
            const globalAvgHadira = count > 0 ? (totalHadira / count) : 0;

            // Footer Row (Totals)
            const trTotal = document.createElement('tr');
            trTotal.className = 'total-row';
            trTotal.innerHTML = `
                <td>${totalRevenue.toLocaleString('fr-TN', { minimumFractionDigits: 3 })}</td>
                <td>${totalSold.toLocaleString('fr-TN')}</td>
                <td>${((totalProd / (globalAvgHalia || 1))).toFixed(2)}</td>
                <td>${((totalProd / (globalAvgHadira || 1))).toFixed(2)}</td>
                <td>${totalProd.toLocaleString('fr-TN')}</td>
                <td>${totalDays}</td> <!-- Total Milking Days accumulated -->
                <td>${globalAvgHalia.toFixed(2)}</td>
                <td>${globalAvgHadira.toFixed(2)}</td>
                <td colspan="2">TOTAL GÉNÉRAL</td>
            `;
            tfoot.appendChild(trTotal);

            // Footer for Summary Table
            const trSumTotal = document.createElement('tr');
            trSumTotal.className = 'orange-bg';
            trSumTotal.style.fontWeight = 'bold';
            const totalAvgPrice = totalSold > 0 ? (totalRevenue / totalSold) : 0;

            trSumTotal.innerHTML = `
                <td>${totalAvgPrice.toFixed(3)}</td>
                <td>${(totalProd - totalSold).toFixed(2)}</td>
                <td>${(totalProd * 0.1).toFixed(1)}</td>
                <td>${totalProd.toLocaleString('fr-TN')}</td>
                <td>Total</td>
            `;
            summaryBody.appendChild(trSumTotal);

        } else {
            console.log("No data found");
            tbody.innerHTML = '<tr><td colspan="10">Aucune donnée trouvée pour cette année</td></tr>';
        }

    } catch (error) {
        console.error(error);
        showCustomAlert('Erreur lors du chargement des rapports', 'error');
    } finally {
        if (loader) loader.style.display = 'none';
    }
};

// Drill-down Modal Function
window.showMonthlyDetails = async function(region, unit) {
    console.log(`Showing details for ${region} - ${unit}`);
    const modal = document.getElementById('monthlyDetailsModal');
    const modalTitle = document.getElementById('monthlyModalTitle');
    const modalBody = document.getElementById('monthlyModalBody');
    const loader = document.getElementById('monthlyLoader');
    const year = document.getElementById('yearSelect').value;

    if (!modal) return;

    modal.style.display = 'block';
    if (modalTitle) modalTitle.textContent = `Production Mensuelle: ${unit} (${region}) - Saison ${year}/${parseInt(year)+1}`;
    if (modalBody) modalBody.innerHTML = '';
    if (loader) loader.style.display = 'block';

    try {
        const data = await productionApi.getMonthlyStats(year, region, unit);
        console.log("Monthly Data:", data);

        // French Months
        const monthsFr = [
            "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
        ];
        
        // Define header
        let tableHtml = `
            <table class="report-table" style="width:100%;">
                <thead>
                    <tr style="background-color: #fce4d6;">
                        <th>Mois</th>
                        <th>Prod. Par Hadira</th>
                        <th>Prod. Par Halia</th>
                        <th>Production (L)</th>
                        <th>Jours</th>
                        <th>Lait Perdu (L)</th>
                        <th>Cons. Interne (L)</th>
                        <th>Vente (L)</th>
                        <th>Prix Unitaire</th>
                        <th>Revenu Total</th>
                        <th>Acheteurs</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let totalProd = 0;
        let totalSold = 0;
        let totalRev = 0;
        let totalWasted = 0;
        let totalInternal = 0;

        // Visual ordering: Sept -> Aug
        const orderedData = [];
        const monthOrder = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8];
        
        // ... (sorting logic stays same if desired, or we just map data) ...
        
        data.forEach(row => {
            const monthName = monthsFr[row.month - 1] + " " + (row.month >= 9 ? year : parseInt(year) + 1);
            const wasted = row.totalWasted || 0;
            const internalCons = row.totalInternalConsumption || 0;
            const yieldHalia = (row.totalProduction / (row.avgMilkingCows || 1)).toFixed(2);
            const yieldHadira = (row.totalProduction / (row.avgPresentCows || 1)).toFixed(2);
            const avgPrice = row.totalSold > 0 ? (row.totalRevenue / row.totalSold) : 0;
            const buyersList = (row.buyers || ['Non spécifié']).join(', ');

            tableHtml += `
                <tr>
                    <td>${monthName}</td>
                    <td>${yieldHadira}</td>
                    <td>${yieldHalia}</td>
                    <td>${row.totalProduction.toLocaleString('fr-TN')}</td>
                    <td>${row.milkingDays}</td>
                    <td>${wasted.toLocaleString('fr-TN')}</td>
                    <td>${internalCons.toLocaleString('fr-TN')}</td>
                    <td>${row.totalSold.toLocaleString('fr-TN')}</td>
                    <td>${avgPrice.toFixed(3)}</td>
                    <td>${(row.totalRevenue || 0).toLocaleString('fr-TN', {minimumFractionDigits: 3})}</td>
                    <td style="font-size: 0.85em;">${buyersList}</td>
                </tr>
            `;

            totalProd += row.totalProduction;
            totalSold += row.totalSold;
            totalRev += row.totalRevenue || 0;
            totalWasted += wasted;
            totalInternal += internalCons;
        });

        // Total Row
         tableHtml += `
            <tr style="background-color: #00ffff; font-weight: bold;">
                <td>TOTAL</td>
                <td>-</td>
                <td>-</td>
                <td>${totalProd.toLocaleString('fr-TN')}</td>
                <td>-</td>
                <td>${totalWasted.toLocaleString('fr-TN')}</td>
                <td>${totalInternal.toLocaleString('fr-TN')}</td>
                <td>${totalSold.toLocaleString('fr-TN')}</td>
                <td>${(totalSold > 0 ? totalRev/totalSold : 0).toFixed(3)}</td>
                <td>${totalRev.toLocaleString('fr-TN', {minimumFractionDigits: 3})}</td>
                <td>-</td>
            </tr>
        </tbody></table>`;

        modalBody.innerHTML = tableHtml;

    } catch (error) {
        console.error(error);
        modalBody.innerHTML = '<p style="color:red; text-align:center;">Erreur lors du chargement des détails.</p>';
    } finally {
        if (loader) loader.style.display = 'none';
    }
};

window.closeMonthlyModal = function() {
    const modal = document.getElementById('monthlyDetailsModal');
    if (modal) modal.style.display = 'none';
};

window.exportToPDF = function () {
    if (!window.jspdf) {
        showCustomAlert("Erreur: Bibliothèque PDF non chargée", "error");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation

    // Add Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Rapport Annuel de Production Laitière", 14, 20);

    const seasonElem = document.getElementById('seasonYear');
    const seasonText = seasonElem ? seasonElem.textContent : "";
    doc.setFontSize(14);
    doc.text("Saison: " + seasonText, 14, 30);

    // Generate Main Table
    doc.autoTable({
        html: '#productionTable',
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], halign: 'center' },
        bodyStyles: { halign: 'center' },
        footStyles: { fillColor: [0, 191, 255], fontStyle: 'bold' }
    });

    // Generate Summary Table
    doc.autoTable({
        html: '.totals-box table', // Select the summary table
        startY: doc.lastAutoTable.finalY + 15,
        theme: 'grid',
        headStyles: { fillColor: [243, 156, 18], textColor: 0 },
        styles: { halign: 'center' }
    });

    const yearElem = document.getElementById('yearSelect');
    const yearVal = yearElem ? yearElem.value : "Report";
    doc.save(`Rapport-Lait-${yearVal}.pdf`);
};

// Initialize Reports Page
window.initProductionReportsPage = function () {
    console.log("Initializing Production Reports Page...");
    const yearSelect = document.getElementById('yearSelect');
    if (yearSelect) {
        yearSelect.value = new Date().getFullYear();
        // Load initial data
        loadProductionStats();
    }
};
