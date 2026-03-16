const workshopYearlyData = {
    '2026': {
        tractors: [
            { name: 'TP1', hours: '1 294', hoursVal: '46 601,885', fuelQty: '5 800', fuelVal: '11 513,000', oil: '725,000', spares: '24 679,000', extLabor: '4 106,000', workshop: '-', insurance: '210,724', wear: '-', driverDays: '184', driverVal: '5 368,161', total: '46 601,885' },
            { name: 'TP2', hours: '1 443', hoursVal: '36 790,224', fuelQty: '6 610', fuelVal: '13 120,850', oil: '580,000', spares: '14 954,000', extLabor: '1 685,000', workshop: '-', insurance: '440,368', wear: '-', driverDays: '206', driverVal: '6 010,006', total: '36 790,224' },
            { name: 'TP3', hours: '572', hoursVal: '9 742,282', fuelQty: '2 440', fuelVal: '4 843,400', oil: '725,000', spares: '390,000', extLabor: '1 210,000', workshop: '-', insurance: '210,724', wear: '-', driverDays: '81', driverVal: '2 363,158', total: '9 742,282' },
            { name: 'TP4', hours: '128', hoursVal: '2 070,270', fuelQty: '540', fuelVal: '1 071,900', oil: '72,500', spares: '-', extLabor: '190,000', workshop: '-', insurance: '210,724', wear: '-', driverDays: '18', driverVal: '525,146', total: '2 070,270' }
        ],
        summary1: { name: 'مجموع الجرارات (1)', hours: '3 437', hoursVal: '95 204,661', fuelQty: '15 390', fuelVal: '30 549,150', oil: '2 102,500', spares: '40 023,000', extLabor: '7 191,000', workshop: '0,000', insurance: '1 072,540', wear: '0,000', driverDays: '489', driverVal: '14 266,471', total: '95 204,661' },
        summary2: { name: 'التوابع (2)', hours: '-', hoursVal: '18 910,871', fuelQty: '-', fuelVal: '0,000', oil: '-', spares: '-', extLabor: '15 876,000', workshop: '2 961,400', extVal: '73,471', insurance: '-', wear: '-', driverDays: '-', driverVal: '-', total: '18 910,871' },
        total12: { name: 'مجموع (1) + (2)', hours: '3 437', hoursVal: '114 115,532', fuelQty: '-', fuelVal: '30 549,150', oil: '-', spares: '40 023,000', extLabor: '23 067,000', workshop: '2 961,400', insurance: '1 072,540', wear: '73,471', driverDays: '-', driverVal: '-', total: '114 115,532' },
        harvesters: [
            { name: 'الآلة الحاصدة 1', hours: '237', hoursVal: '15 307,515', fuelQty: '1 980', fuelVal: '3 930,300', oil: '275,000', spares: '7 686,565', extLabor: '2 160,000', workshop: '-', insurance: '292,882', wear: '-', driverDays: '33', driverVal: '962,768', total: '15 307,515' },
            { name: 'الآلة الحاصدة 2', hours: '-', hoursVal: '0,000', fuelQty: '-', fuelVal: '0,000', oil: '-', spares: '-', extLabor: '-', workshop: '-', insurance: '-', wear: '-', driverDays: '-', driverVal: '0,000', total: '0,000' }
        ],
        summaryHarvester: { name: 'مجموع الآلات الحاصدة', hours: '237', hoursVal: '15 307,515', fuelQty: '1 980', fuelVal: '3 930,300', oil: '275,000', spares: '7 686,565', extLabor: '2 160,000', workshop: '0,000', insurance: '292,882', wear: '0,000', driverDays: '33', driverVal: '962,768', total: '15 307,515' },
        costs: { tractor: '27,700', mech: '33,202', harvester: '64,589' },
        summary: { hours: '3,674', cost: '129,423 DT', maint: '47,709 DT' }
    },
    '2025': {
        tractors: [
            { name: 'TP1', hours: '1 150', hoursVal: '41 200,000', fuelQty: '5 200', fuelVal: '10 300,000', oil: '650,000', spares: '21 000,000', extLabor: '3 800,000', workshop: '-', insurance: '210,000', wear: '-', driverDays: '165', driverVal: '4 800,000', total: '41 200,000' },
            { name: 'TP2', hours: '1 300', hoursVal: '32 500,000', fuelQty: '6 000', fuelVal: '11 900,000', oil: '520,000', spares: '12 500,000', extLabor: '1 500,000', workshop: '-', insurance: '440,000', wear: '-', driverDays: '190', driverVal: '5 500,000', total: '32 500,000' }
        ],
        summary1: { name: 'مجموع الجرارات (1)', hours: '2 450', hoursVal: '73 700,000', fuelQty: '11 200', fuelVal: '22 200,000', oil: '1 170,000', spares: '33 500,000', extLabor: '5 300,000', workshop: '0,000', insurance: '650,000', wear: '0,000', driverDays: '355', driverVal: '10 300,000', total: '73 700,000' },
        summary2: { name: 'التوابع (2)', hours: '-', hoursVal: '15 400,000', fuelQty: '-', fuelVal: '0,000', oil: '-', spares: '-', extLabor: '12 000,000', workshop: '2 100,000', extVal: '50,000', insurance: '-', wear: '-', driverDays: '-', driverVal: '-', total: '15 400,000' },
        total12: { name: 'مجموع (1) + (2)', hours: '2 450', hoursVal: '89 100,000', fuelQty: '-', fuelVal: '22 200,000', oil: '-', spares: '33 500,000', extLabor: '17 300,000', workshop: '2 100,000', insurance: '650,000', wear: '50,000', driverDays: '-', driverVal: '-', total: '89 100,000' },
        harvesters: [
            { name: 'الآلة الحاصدة 1', hours: '210', hoursVal: '13 500,000', fuelQty: '1 750', fuelVal: '3 450,000', oil: '250,000', spares: '6 800,000', extLabor: '1 900,000', workshop: '-', insurance: '270,000', wear: '-', driverDays: '30', driverVal: '850,000', total: '13 500,000' }
        ],
        summaryHarvester: { name: 'مجموع الآلات الحاصدة', hours: '210', hoursVal: '13 500,000', fuelQty: '1 750', fuelVal: '3 450,000', oil: '250,000', spares: '6 800,000', extLabor: '1 900,000', workshop: '0,000', insurance: '270,000', wear: '0,000', driverDays: '30', driverVal: '850,000', total: '13 500,000' },
        costs: { tractor: '25,400', mech: '31,500', harvester: '61,200' },
        summary: { hours: '2,660', cost: '102,600 DT', maint: '40,300 DT' }
    },
    '2024': {
        tractors: [
            { name: 'TP1', hours: '1 020', hoursVal: '36 400,000', fuelQty: '4 800', fuelVal: '9 500,000', oil: '600,000', spares: '18 500,000', extLabor: '3 400,000', workshop: '-', insurance: '200,000', wear: '-', driverDays: '150', driverVal: '4 200,000', total: '36 400,000' }
        ],
        summary1: { name: 'مجموع الجرارات (1)', hours: '1 020', hoursVal: '36 400,000', fuelQty: '4 800', fuelVal: '9 500,000', oil: '600,000', spares: '18 500,000', extLabor: '3 400,000', workshop: '0,000', insurance: '200,000', wear: '0,000', driverDays: '150', driverVal: '4 200,000', total: '36 400,000' },
        summary2: { name: 'التوابع (2)', hours: '-', hoursVal: '12 800,000', fuelQty: '-', fuelVal: '0,000', oil: '-', spares: '-', extLabor: '10 500,000', workshop: '1 800,000', extVal: '40,000', insurance: '-', wear: '-', driverDays: '-', driverVal: '-', total: '12 800,000' },
        total12: { name: 'مجموع (1) + (2)', hours: '1 020', hoursVal: '49 200,000', fuelQty: '-', fuelVal: '9 500,000', oil: '-', spares: '18 500,000', extLabor: '13 900,000', workshop: '1 800,000', insurance: '200,000', wear: '40,000', driverDays: '-', driverVal: '-', total: '49 200,000' },
        harvesters: [
            { name: 'الآلة الحاصدة 1', hours: '185', hoursVal: '11 800,000', fuelQty: '1 600', fuelVal: '3 100,000', oil: '220,000', spares: '5 900,000', extLabor: '1 700,000', workshop: '-', insurance: '250,000', wear: '-', driverDays: '26', driverVal: '750,000', total: '11 800,000' }
        ],
        summaryHarvester: { name: 'مجموع الآلات الحاصدة', hours: '185', hoursVal: '11 800,000', fuelQty: '1 600', fuelVal: '3 100,000', oil: '220,000', spares: '5 900,000', extLabor: '1 700,000', workshop: '0,000', insurance: '250,000', wear: '0,000', driverDays: '26', driverVal: '750,000', total: '11 800,000' },
        costs: { tractor: '23,800', mech: '29,200', harvester: '58,400' },
        summary: { hours: '1,205', cost: '61,000 DT', maint: '32,000 DT' }
    }
};

let workshopTrendChart = null;
let workshopTypeChart = null;

async function renderWorkshopTable(year = '2026') {
    const tableBody = document.getElementById('workshopTableBody');
    if (!tableBody) return;

    const currentData = workshopYearlyData[year] || workshopYearlyData['2026'];

    // Update Top Summary Stats with animation
    if (window.animateDashboardValue) {
        animateDashboardValue('stat-workshop-hours', currentData.summary.hours, ' h');
        animateDashboardValue('stat-workshop-cost', currentData.summary.cost, ' DT');
        animateDashboardValue('stat-workshop-maint', currentData.summary.maint, ' DT');

        // Update Bottom Cost Boxes
        animateDashboardValue('tractor-hour-cost', currentData.costs.tractor, ' DT');
        animateDashboardValue('attachment-hour-cost', currentData.costs.mech, ' DT');
        animateDashboardValue('harvester-hour-cost', currentData.costs.harvester, ' DT');
    }

    let html = '';

    // Tractors
    currentData.tractors.forEach(t => {
        html += `
            <tr>
                <td style="font-weight: 700;">${t.name}</td>
                <td>${t.hours}</td>
                <td style="font-family: monospace;">${t.hoursVal}</td>
                <td>${t.fuelQty}</td>
                <td style="font-family: monospace;">${t.fuelVal}</td>
                <td style="font-family: monospace;">${t.oil}</td>
                <td style="font-family: monospace;">${t.spares}</td>
                <td style="font-family: monospace;">${t.extLabor}</td>
                <td style="font-family: monospace;">${t.workshop}</td>
                <td style="font-family: monospace;">${t.insurance}</td>
                <td style="font-family: monospace;">${t.wear}</td>
                <td>${t.driverDays}</td>
                <td style="font-family: monospace;">${t.driverVal}</td>
                <td>
                    <span style="background: #1a1a1a; color: #fff; padding: 4px 12px; border-radius: 6px; font-family: monospace; font-weight: 700; display: inline-block; min-width: 80px; text-align: center;">
                        ${t.total}
                    </span>
                </td>
            </tr>
        `;
    });

    // Summary 1
    html += `
        <tr class="total-row" style="background: #f8f9fa;">
            <td style="text-align: right;">${currentData.summary1.name}</td>
            <td>${currentData.summary1.hours}</td>
            <td style="font-family: monospace;">${currentData.summary1.hoursVal}</td>
            <td>${currentData.summary1.fuelQty}</td>
            <td style="font-family: monospace;">${currentData.summary1.fuelVal}</td>
            <td style="font-family: monospace;">${currentData.summary1.oil}</td>
            <td style="font-family: monospace;">${currentData.summary1.spares}</td>
            <td style="font-family: monospace;">${currentData.summary1.extLabor}</td>
            <td style="font-family: monospace;">${currentData.summary1.workshop}</td>
            <td style="font-family: monospace;">${currentData.summary1.insurance}</td>
            <td style="font-family: monospace;">${currentData.summary1.wear}</td>
            <td>${currentData.summary1.driverDays}</td>
            <td style="font-family: monospace;">${currentData.summary1.driverVal}</td>
            <td style="font-family: monospace; font-weight: 800;">${currentData.summary1.total}</td>
        </tr>
    `;

    // Summary 2
    html += `
        <tr class="total-row" style="background: #f8f9fa;">
            <td style="text-align: right;">${currentData.summary2.name}</td>
            <td>${currentData.summary2.hours}</td>
            <td style="font-family: monospace;">${currentData.summary2.total}</td>
            <td>-</td>
            <td style="font-family: monospace;">${currentData.summary2.fuelVal}</td>
            <td>-</td>
            <td>-</td>
            <td style="font-family: monospace;">${currentData.summary2.extLabor}</td>
            <td style="font-family: monospace;">${currentData.summary2.workshop}</td>
            <td>-</td>
            <td style="font-family: monospace;">${currentData.summary2.extVal || '-'}</td>
            <td>-</td>
            <td>-</td>
            <td style="font-family: monospace; font-weight: 800;">${currentData.summary2.total}</td>
        </tr>
    `;

    // Total 1+2
    html += `
        <tr class="total-row" style="background: #eef2f7; border-top: 2px solid #000; border-bottom: 2px solid #000;">
            <td style="text-align: right; color: #000;">${currentData.total12.name}</td>
            <td style="color: #000;">${currentData.total12.hours}</td>
            <td style="font-family: monospace; color: #000;">${currentData.total12.hoursVal}</td>
            <td style="color: #000;">-</td>
            <td style="font-family: monospace; color: #000;">${currentData.total12.fuelVal}</td>
            <td style="color: #000;">-</td>
            <td style="font-family: monospace; color: #000;">${currentData.total12.spares}</td>
            <td style="font-family: monospace; color: #000;">${currentData.total12.extLabor}</td>
            <td style="font-family: monospace; color: #000;">${currentData.total12.workshop}</td>
            <td style="font-family: monospace; color: #000;">${currentData.total12.insurance}</td>
            <td style="font-family: monospace; color: #000;">${currentData.total12.wear}</td>
            <td style="color: #000;">-</td>
            <td style="color: #000;">-</td>
            <td style="font-family: monospace; font-weight: 900; color: #000;">${currentData.total12.total}</td>
        </tr>
    `;

    // Harvesters
    currentData.harvesters.forEach(h => {
        html += `
            <tr style="background: #f4f7f6;">
                <td style="font-weight: 700;">${h.name}</td>
                <td>${h.hours}</td>
                <td style="font-family: monospace;">${h.hoursVal}</td>
                <td>${h.fuelQty}</td>
                <td style="font-family: monospace;">${h.fuelVal}</td>
                <td style="font-family: monospace;">${h.oil}</td>
                <td style="font-family: monospace;">${h.spares}</td>
                <td style="font-family: monospace;">${h.extLabor}</td>
                <td style="font-family: monospace;">${h.workshop}</td>
                <td style="font-family: monospace;">${h.insurance}</td>
                <td style="font-family: monospace;">${h.wear}</td>
                <td>${h.driverDays}</td>
                <td style="font-family: monospace;">${h.driverVal}</td>
                <td>
                    <span style="background: #1a1a1a; color: #fff; padding: 4px 12px; border-radius: 6px; font-family: monospace; font-weight: 700; display: inline-block; min-width: 80px; text-align: center;">
                        ${h.total}
                    </span>
                </td>
            </tr>
        `;
    });

    // Summary Harvester
    html += `
        <tr class="total-row" style="background: #eef2f7; border-top: 1.5px solid #000;">
            <td style="text-align: right; font-weight: 800;">${currentData.summaryHarvester.name}</td>
            <td style="font-weight: 800;">${currentData.summaryHarvester.hours}</td>
            <td style="font-family: monospace; font-weight: 800;">${currentData.summaryHarvester.hoursVal}</td>
            <td style="font-weight: 800;">${currentData.summaryHarvester.fuelQty}</td>
            <td style="font-family: monospace; font-weight: 800;">${currentData.summaryHarvester.fuelVal}</td>
            <td style="font-family: monospace; font-weight: 800;">${currentData.summaryHarvester.oil}</td>
            <td style="font-family: monospace; font-weight: 800;">${currentData.summaryHarvester.spares}</td>
            <td style="font-family: monospace; font-weight: 800;">${currentData.summaryHarvester.extLabor}</td>
            <td style="font-family: monospace; font-weight: 800;">${currentData.summaryHarvester.workshop}</td>
            <td style="font-family: monospace; font-weight: 800;">${currentData.summaryHarvester.insurance}</td>
            <td style="font-family: monospace; font-weight: 800;">${currentData.summaryHarvester.wear}</td>
            <td style="font-weight: 800;">${currentData.summaryHarvester.driverDays}</td>
            <td style="font-family: monospace; font-weight: 800;">${currentData.summaryHarvester.driverVal}</td>
            <td style="font-family: monospace; font-weight: 900;">${currentData.summaryHarvester.total}</td>
        </tr>
    `;

    tableBody.innerHTML = html;

    // Render Charts
    setTimeout(() => {
        renderWorkshopTrendChart();
        renderWorkshopTypeChart(year);
        renderCircularStats(year);
    }, 100);
}

function renderCircularStats() {
    const configs = [
        { id: 'availabilityCircle', val: 85, color: '#1a1a1a' },
        { id: 'performanceCircle', val: 92, color: '#4a4b4c' },
        { id: 'efficiencyCircle', val: 78, color: '#8e9196' }
    ];

    configs.forEach(conf => {
        const ctx = document.getElementById(conf.id);
        if (!ctx) return;
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [conf.val, 100 - conf.val],
                    backgroundColor: [conf.color, '#f0f0f0'],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '85%',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { tooltip: { enabled: false }, legend: { display: false } }
            }
        });
    });
}

window.renderWorkshopTable = renderWorkshopTable;

function renderWorkshopTrendChart() {
    const ctx = document.getElementById('workshopTrendChart');
    if (!ctx) return;
    if (workshopTrendChart) workshopTrendChart.destroy();

    workshopTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2024', '2025', '2026'],
            datasets: [{
                label: 'Coût Maintenance (DT)',
                data: [32000, 41000, 47709],
                borderColor: '#1a1a1a',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointRadius: 6,
                pointBackgroundColor: '#1a1a1a',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { backgroundColor: '#1a1a1a' }
            },
            scales: {
                y: {
                    grid: { color: '#f5f5f5' },
                    ticks: { font: { size: 11, weight: '600' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 11, weight: '600' } }
                }
            }
        }
    });
}

function renderWorkshopTypeChart(year = '2026') {
    const ctx = document.getElementById('workshopTypeChart');
    if (!ctx) return;
    if (workshopTypeChart) workshopTypeChart.destroy();

    // Vary data slightly by year for visual interest
    const baseData = [4, 2, 2, 8];
    const modifier = year === '2025' ? 1 : (year === '2024' ? -1 : 0);
    const data = baseData.map(v => Math.max(1, v + modifier));

    workshopTypeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Tracteurs', 'Hachoirs', 'Moissonneuses', 'Autres'],
            datasets: [{
                data: data,
                backgroundColor: ['#1a1a1a', '#4a4b4c', '#8e9196', '#d1d4d9'],
                borderWidth: 3,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 25,
                        font: { size: 12, weight: '600' },
                        color: '#1a1a1a'
                    }
                }
            }
        }
    });
}


window.renderWorkshopTable = renderWorkshopTable;
