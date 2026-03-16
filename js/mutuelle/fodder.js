const fodderYearlyData = {
    '2026': {
        rows: [
            { group: 'الأبقار', alyef: '250,00', cmv: '987,00', pulpe: '4 840,00', avoine: '', mais: '', soja: '38,90', n6b: '', n6a: '', n11: '', n9: '', n7: '1 199,4', n5: '', paille: '5 874', foin: '1 460', verdure: '321,000', ensilage: '393,100' },
            { group: 'العجول و الجمال', alyef: '', cmv: '', pulpe: '', avoine: '', mais: '', soja: '', n6b: '', n6a: '', n11: '', n9: '204,6', n7: '', n5: '', paille: '155', foin: '400', verdure: '', ensilage: '' },
            { group: 'الأراخي', alyef: '', cmv: '', pulpe: '', avoine: '', mais: '', soja: '', n6b: '', n6a: '', n11: '281,1', n9: '', n7: '', n5: '', paille: '700', foin: '2 780', verdure: '', ensilage: '' },
            { group: 'عجول التسمين', alyef: '', cmv: '', pulpe: '', avoine: '', mais: '', soja: '', n6b: '', n6a: '', n11: '', n9: '', n7: '', n5: '283', paille: '1095', foin: '', verdure: '', ensilage: '' },
            { group: 'المجموع', isTotal: true, alyef: '250,00', cmv: '987,00', pulpe: '4 840,00', avoine: '0,00', mais: '0,00', soja: '38,90', n6b: '0,00', n6a: '0,00', n11: '281,10', n9: '204,60', n7: '1 199,40', n5: '283,00', paille: '7 824', foin: '4 640', verdure: '321,000', ensilage: '393,100' },
            { group: 'كعلة تيبار', isSpacer: true },
            { group: 'صقلي سردي', isSpacer: true },
            { group: 'المجموع', isTotal: true, alyef: '0,00', cmv: '0,00', pulpe: '0,00', avoine: '0,00', mais: '0,00', soja: '0,00', n6b: '0,00', n6a: '0,00', n11: '0,00', n9: '0,00', n7: '0,00', n5: '0,00', paille: '0', foin: '0', verdure: '0,000', ensilage: '0,000' },
            { group: 'المجموع العام', isGrandTotal: true, alyef: '250,000', cmv: '987,000', pulpe: '4 840,000', avoine: '0,000', mais: '0,000', soja: '38,900', n6b: '0,000', n6a: '0,000', n11: '281,100', n9: '204,600', n7: '1 199,400', n5: '283,000', paille: '7 824', foin: '4 640', verdure: '321,000', ensilage: '393,100' }
        ],
        summary: { stock: '15 820 kg', cost: '124,530 DT', coverage: '98%' }
    },
    '2025': {
        rows: [
            { group: 'الأبقار', alyef: '210,00', cmv: '850,00', pulpe: '4 200,00', avoine: '', mais: '', soja: '32,00', n6b: '', n6a: '', n11: '', n9: '', n7: '1 050,0', n5: '', paille: '5 200', foin: '1 300', verdure: '300,000', ensilage: '350,000' }
        ],
        summary: { stock: '12 450 kg', cost: '102,120 DT', coverage: '95%' }
    }
};

let fodderTrendChart = null;
let feedTypeChart = null;

async function renderFodderTable(year = '2026') {
    const tableBody = document.getElementById('fodderTableBody');
    if (!tableBody) return;

    const currentData = fodderYearlyData[year] || fodderYearlyData['2026'];
    const rows = currentData.rows || currentData; // Support old format etc.

    // Update Summary Stats with animation
    if (window.animateDashboardValue) {
        animateDashboardValue('stat-fodder-stock', currentData.summary.stock, ' kg');
        animateDashboardValue('stat-fodder-cost', currentData.summary.cost, ' DT');
        animateDashboardValue('stat-fodder-coverage', currentData.summary.coverage, '%');
    }

    let html = '';
    rows.forEach(row => {
        let style = '';
        if (row.isTotal) style = 'background: #fff9e6; font-weight: 800; border-top: 1.5px solid #000; border-bottom: 1.5px solid #000;';
        if (row.isGrandTotal) style = 'background: #2c3e50; color: #fff; font-weight: 900;';
        if (row.isSpacer) style = 'min-height: 20px;';

        html += `
            <tr style="${style}">
                <td style="font-weight: 700; text-align: right; border-right: 2px solid #000; ${row.isGrandTotal ? 'color: #fff;' : ''}">${row.group}</td>
                <td style="font-family: monospace;">${row.alyef || ' '}</td>
                <td style="font-family: monospace;">${row.cmv || ' '}</td>
                <td style="font-family: monospace;">${row.pulpe || ' '}</td>
                <td style="font-family: monospace;">${row.avoine || ' '}</td>
                <td style="font-family: monospace;">${row.mais || ' '}</td>
                <td style="font-family: monospace;">${row.soja || ' '}</td>
                <td style="font-family: monospace;">${row.n6b || ' '}</td>
                <td style="font-family: monospace;">${row.n6a || ' '}</td>
                <td style="font-family: monospace;">${row.n11 || ' '}</td>
                <td style="font-family: monospace;">${row.n9 || ' '}</td>
                <td style="font-family: monospace;">${row.n7 || ' '}</td>
                <td style="font-family: monospace;">${row.n5 || ' '}</td>
                <td style="font-family: monospace; border-left: 2px solid #000;">${row.paille || ' '}</td>
                <td style="font-family: monospace;">${row.foin || ' '}</td>
                <td style="font-family: monospace;">${row.verdure || ' '}</td>
                <td style="font-family: monospace;">${row.ensilage || ' '}</td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;

    // Render Charts
    setTimeout(() => {
        renderFodderTrendChart();
        renderFeedTypeChart(year);
    }, 100);
}

function renderFodderTrendChart() {
    const ctx = document.getElementById('fodderTrendChart');
    if (!ctx) return;
    if (fodderTrendChart) fodderTrendChart.destroy();

    fodderTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2024', '2025', '2026'],
            datasets: [{
                label: 'Consommation Totale (kg)',
                data: [10200, 12450, 15820],
                borderColor: '#1a1a1a',
                backgroundColor: 'rgba(26, 26, 26, 0.05)',
                tension: 0.4,
                fill: true,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { color: '#f0f0f0' } } }
        }
    });
}

function renderFeedTypeChart(year = '2026') {
    const ctx = document.getElementById('feedTypeChart');
    if (!ctx) return;
    if (feedTypeChart) feedTypeChart.destroy();

    const data = year === '2026' ? [45, 35, 20] : [40, 40, 20];

    feedTypeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Concentrés', 'Fourrage Sec', 'Verdure/Ensilage'],
            datasets: [{
                data: data,
                backgroundColor: ['#1a1a1a', '#4a4b4c', '#8e9196'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, font: { weight: '600' } } }
            }
        }
    });
}

window.renderFodderTable = renderFodderTable;
