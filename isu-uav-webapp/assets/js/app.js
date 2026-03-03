/*
 * app.js
 *
 * This module defines global state and helper functions used across the
 * application. It also initialises a few repeating intervals for
 * updating the dashboard values, such as current time, altitude and
 * randomly fluctuating accuracy. By centralising these definitions here
 * the other modules remain focused on their own concerns (map
 * visualisation, neural network demo, telemetry charts, etc.).
 */

// Global variables controlling application state
window.gT = 0;          // time accumulator for sine-based animations
window.flyOn = true;    // whether the simulated drone is flying
window.mapO = null;     // Leaflet map object
window.dMark = null;    // marker showing drone on the map
window.pIdx = 0;        // current index along the flight path
window.trRun = false;   // flag to prevent multiple concurrent trainings

// Example flight path (longitude, latitude pairs). Coordinates
// correspond to the Sayran lake in Almaty. The path loops around
// the lake and returns to the start.
window.fp = [
  [43.218,76.85],
  [43.220,76.860],
  [43.224,76.865],
  [43.228,76.867],
  [43.232,76.864],
  [43.235,76.859],
  [43.233,76.854],
  [43.229,76.851],
  [43.225,76.849],
  [43.220,76.850],
  [43.218,76.850]
];

// Arrays used in the neural network demo to generate loss and
// accuracy curves. The values are synthesised to illustrate
// convergence and are not derived from a real model.
window.E2  = [];
window.TL2 = [];
window.VL2 = [];
window.TA2 = [];
window.VA2 = [];
for (let i = 1; i <= 50; i++) {
  E2.push(i);
  TL2.push(Math.max(0.8*Math.exp(-i*0.09) + 0.002 + Math.random()*0.002, 0.002));
  VL2.push(Math.max(0.85*Math.exp(-i*0.085) + 0.003 + Math.random()*0.003, 0.003));
  TA2.push(Math.min(96.2, 40 + 56*(1-Math.exp(-i*0.1)) + Math.random()*0.4));
  VA2.push(Math.min(94.7, 38 + 56*(1-Math.exp(-i*0.1)) + Math.random()*0.6));
}

// Keep track of which pages have been initialised. Each page will only
// run its setup code once per session, triggered by navigation in
// ui.js. The keys correspond to values in the pages array below.
window.inited = {};
window.pages  = ['home','map','neural','telemetry','analysis','control'];

// Root object for page modules. Each page registers a function on
// window.pi (e.g. pi.map) that initialises that page when called.
window.pi = {};

/* Chart configuration
 * Chart.js uses a set of options to style axes, legends and lines.
 * The CO2 object defines these options so that all charts share
 * consistent styling aligned with the dark UI theme.
 */
window.CO2 = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 500 },
  plugins: {
    legend: {
      labels: { color: '#52525b', font: { size: 10 }, boxWidth: 10 }
    }
  },
  scales: {
    x: {
      ticks: { color: '#52525b', font: { size: 9 }, maxTicksLimit: 8 },
      grid: { color: '#27272a' },
      border: { color: '#27272a' }
    },
    y: {
      ticks: { color: '#52525b', font: { size: 9 } },
      grid: { color: '#27272a' },
      border: { color: '#27272a' }
    }
  }
};

/**
 * Create a Chart.js line or bar chart.
 *
 * @param {string} id    The canvas element ID
 * @param {string} type  The chart type ('line', 'bar', 'radar', ...)
 * @param {Array} labels The labels for the x-axis
 * @param {Array} sets   An array of dataset objects (see ln2 helper)
 * @returns {Chart|null} The instantiated chart or null if element missing
 */
function mkC(id, type, labels, sets) {
  const ctx = document.getElementById(id);
  if (!ctx) return null;
  // Deep clone options to avoid sharing state between charts
  const opts = JSON.parse(JSON.stringify(window.CO2));
  return new Chart(ctx.getContext('2d'), {
    type: type,
    data: { labels: labels, datasets: sets },
    options: opts
  });
}

/**
 * Helper to define a dataset for a line chart.
 *
 * @param {string} c  Stroke colour
 * @param {string} l  Label for the legend
 * @param {Array} d   Array of numeric values
 * @param {boolean} f Whether to fill under the curve
 */
function ln2(c, l, d, f) {
  return {
    label: l,
    data: d,
    borderColor: c,
    borderWidth: 1.5,
    pointRadius: 0,
    tension: 0.35,
    fill: !!f,
    backgroundColor: f ? c + '14' : undefined
  };
}

/**
 * Generate a synthetic signal for telemetry graphs.
 *
 * The sine-based function produces oscillations around a baseline
 * amplitude with optional random noise. Used to create realistic
 * looking plots for demonstration purposes.
 *
 * @param {number} base  The baseline value
 * @param {number} amp   The amplitude of the sine wave
 * @param {number} noise Magnitude of random noise added to each point
 * @returns {number[]}   Array of generated values
 */
function mkS2(base, amp, noise) {
  const N2 = 80;
  const arr = [];
  for (let i = 0; i < N2; i++) {
    arr.push(base + Math.sin(i * 0.2) * amp + Math.random() * noise);
  }
  return arr;
}

// Expose helpers on the window so that other modules can call them
window.mkC = mkC;
window.ln2 = ln2;
window.mkS2 = mkS2;

// Initialise repeating updates for dashboard values. This function runs
// immediately to set initial values and sets up intervals to update
// values periodically.
function initIntervals() {
  // Update the top bar and telemetry values every 500ms
  setInterval(() => {
    window.gT += 0.05;
    const now = new Date().toTimeString().substr(0, 8);
    const htm = document.getElementById('htm');
    if (htm) htm.textContent = now;
    const halt = document.getElementById('halt');
    if (halt) {
      const alt = 120 + Math.sin(window.gT * 0.5) * 8;
      halt.textContent = Math.round(alt);
    }
    const mv = document.getElementById('mv');
    if (mv) {
      const spd = 12.4 + Math.sin(window.gT * 0.3) * 1.5;
      mv.textContent = spd.toFixed(1);
    }
    const mh = document.getElementById('mh');
    if (mh) {
      mh.textContent = Math.round((245 + window.gT * 2) % 360);
    }
    // Telemetry page values
    const talt = document.getElementById('talt');
    const tspd = document.getElementById('tspd');
    const troll = document.getElementById('troll');
    const tptch = document.getElementById('tptch');
    if (talt && tspd && troll && tptch) {
      const alt2 = 120 + Math.sin(window.gT * 0.5) * 8;
      const spd2 = 12.4 + Math.sin(window.gT * 0.3) * 1.5;
      talt.textContent = Math.round(alt2) + ' м';
      tspd.textContent = spd2.toFixed(1) + ' м/с';
      troll.textContent = (Math.sin(window.gT) * 3).toFixed(1) + '°';
      tptch.textContent = (Math.cos(window.gT * 0.7) * 2).toFixed(1) + '°';
    }
  }, 500);
  // Randomly jitter the displayed accuracy every 3 seconds
  setInterval(() => {
    const macc = document.getElementById('macc');
    if (macc) {
      macc.textContent = (94.7 + (Math.random() - 0.5) * 0.3).toFixed(1) + '%';
    }
  }, 3000);
}

// Kick off the intervals as soon as this module loads
initIntervals();