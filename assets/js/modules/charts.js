/**
 * Charts Wrapper Module (PRD §6.6, R-STK-07)
 * Wraps Chart.js and adapts dynamically to theme tokens & dark mode.
 */

let activeCharts = [];

function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function initRevenueChart(canvas) {
  if (!canvas || !window.Chart) return null;

  const ctx = canvas.getContext('2d');
  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const textColor = isDark ? '#a1a1aa' : '#71717a';

  const chart1 = getCSSVar('--chart-1') || '#e76e50';
  const chart2 = getCSSVar('--chart-2') || '#2a9d90';

  const chart = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
      datasets: [
        {
          label: 'Pendapatan 2026',
          data: [18500, 22400, 21800, 27500, 26000, 31200, 34500, 32800, 38900, 42100, 40500, 46800],
          borderColor: chart1,
          backgroundColor: 'transparent',
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5
        },
        {
          label: 'Pengeluaran 2026',
          data: [12000, 14500, 13800, 16200, 15500, 18400, 19200, 18700, 21500, 23000, 22100, 25400],
          borderColor: chart2,
          backgroundColor: 'transparent',
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderDash: [5, 5]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 12,
            font: { family: 'Inter', size: 12 },
            color: textColor
          }
        },
        tooltip: {
          padding: 10,
          backgroundColor: isDark ? '#18181b' : '#ffffff',
          titleColor: isDark ? '#fafafa' : '#09090b',
          bodyColor: isDark ? '#fafafa' : '#09090b',
          borderColor: isDark ? '#27272a' : '#e4e4e7',
          borderWidth: 1,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter', size: 11 }, color: textColor }
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            font: { family: 'Inter', size: 11 },
            color: textColor,
            callback: (v) => 'Rp ' + (v / 1000) + 'jt'
          }
        }
      }
    }
  });

  activeCharts.push(chart);
  return chart;
}

export function initTrafficChart(canvas) {
  if (!canvas || !window.Chart) return null;

  const ctx = canvas.getContext('2d');
  const chart1 = getCSSVar('--chart-1') || '#e76e50';
  const chart2 = getCSSVar('--chart-2') || '#2a9d90';
  const chart3 = getCSSVar('--chart-3') || '#274754';
  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
  const textColor = isDark ? '#a1a1aa' : '#71717a';

  const chart = new window.Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Organik', 'Langsung', 'Rujukan'],
      datasets: [{
        data: [58, 27, 15],
        backgroundColor: [chart1, chart2, chart3],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 10,
            font: { family: 'Inter', size: 12 },
            color: textColor
          }
        }
      }
    }
  });

  activeCharts.push(chart);
  return chart;
}

export function init() {
  document.addEventListener('xa:theme-change', () => {
    // Re-render or update active charts when theme or accent changes
    activeCharts.forEach(c => {
      if (c && c.destroy) c.destroy();
    });
    activeCharts = [];

    const revCanvas = document.getElementById('revenueChart');
    if (revCanvas) initRevenueChart(revCanvas);

    const trafficCanvas = document.getElementById('trafficChart');
    if (trafficCanvas) initTrafficChart(trafficCanvas);
  });
}

export function destroy() {
  activeCharts.forEach(c => {
    if (c && c.destroy) c.destroy();
  });
  activeCharts = [];
}
