/*
 * analysis.js
 *
 * Presents comparative metrics between different control strategies and
 * visualises NDVI distribution. The bar chart shows counts of
 * pixels at various NDVI thresholds for the Sayran dataset and the
 * radar chart contrasts performance of a neural network + RL setup
 * versus a classical PID controller across multiple criteria.
 */

window.pi.analysis = function() {
  // NDVI histogram: buckets from -0.3 to 0.6
  const nv = [-0.3,-0.2,-0.1,0,0.1,0.2,0.3,0.4,0.5,0.6];
  mkC('cndvi', 'bar', nv.map(v => v.toFixed(1)), [
    {
      label: 'Пикселей',
      data: [120,200,150,80,180,320,480,620,380,90],
      backgroundColor: nv.map(v => {
        if (v < 0) return '#3b82f660';
        if (v < 0.2) return '#f59e0b50';
        if (v < 0.4) return '#84cc1650';
        return '#22c55e50';
      }),
      borderWidth: 0,
      borderRadius: 3
    }
  ]);
  // Radar chart comparing NN+RL vs PID across six metrics
  const rc = document.getElementById('cradar');
  if (rc) {
    new Chart(rc.getContext('2d'), {
      type: 'radar',
      data: {
        labels: ['Точность','Стабильность','Скорость','Надёжность','Адаптация','Энергия'],
        datasets: [
          {
            label: 'NN + RL',
            data: [94.7, 88, 85, 92, 96, 78],
            borderColor: '#3b82f6',
            backgroundColor: '#3b82f614',
            borderWidth: 1.5,
            pointBackgroundColor: '#3b82f6',
            pointRadius: 3
          },
          {
            label: 'PID',
            data: [88.4, 72, 70, 85, 55, 82],
            borderColor: '#f59e0b',
            backgroundColor: '#f59e0b14',
            borderWidth: 1.5,
            pointBackgroundColor: '#f59e0b',
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 500 },
        plugins: {
          legend: {
            labels: { color: '#52525b', font: { size: 10 }, boxWidth: 10 }
          }
        },
        scales: {
          r: {
            ticks: {
              color: '#52525b',
              backdropColor: 'transparent',
              font: { size: 9 }
            },
            grid: { color: '#27272a' },
            angleLines: { color: '#27272a' },
            pointLabels: { color: '#a1a1aa', font: { size: 11 } }
          }
        }
      }
    });
  }
};