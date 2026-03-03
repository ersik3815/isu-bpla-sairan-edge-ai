/*
 * telemetry.js
 *
 * Simulates live telemetry streams for the drone. When the user
 * navigates to the telemetry page a set of charts are created to
 * display altitude, velocity, accelerometer data and GPS metrics.
 * Randomly generated values update at regular intervals to mimic
 * real‑time sensors. A log panel shows occasional textual updates.
 */

window.pi.telemetry = function() {
  // Generate synthetic sequences for altitude and EKF corrected altitude
  const ad  = mkS2(120, 8, 3);
  const ekf = ad.map(v => v + Math.random() * 1.4 - 0.7);
  // Create altitude chart
  const labels = [];
  const N2 = 80;
  for (let i = 0; i < N2; i++) labels.push(i + 's');
  const cAlt = mkC('calt', 'line', labels, [
    ln2('#f59e0b', 'GPS Alt', ad, true),
    ln2('#3b82f6', 'EKF Alt', ekf)
  ]);
  // Velocity components
  mkC('cvel', 'line', labels, [
    ln2('#3b82f6', 'Vx', mkS2(12, 2, 1), true),
    ln2('#22c55e', 'Vy', mkS2(2, 1.5, 0.5)),
    ln2('#ef4444', 'Vz', mkS2(0, 0.5, 0.2))
  ]);
  // IMU accelerometer
  mkC('cimu', 'line', labels, [
    ln2('#f59e0b', 'Ax', mkS2(0.1, 0.3, 0.1), true),
    ln2('#a78bfa', 'Ay', mkS2(-0.05, 0.2, 0.1))
  ]);
  // GPS precision and number of satellites
  mkC('cgps', 'line', labels, [
    ln2('#3b82f6', 'HDOP', mkS2(1.2, 0.4, 0.2), true),
    ln2('#f59e0b', 'Спутники', mkS2(13, 2, 0.5))
  ]);
  // Write initial log entry
  addLog('tllog', 'Telemetry stream · 50&nbsp;Hz', 'ok');
  // Update altitude chart periodically with new data points
  setInterval(() => {
    if (!cAlt) return;
    // New simulated altitude value
    const a = 120 + Math.sin(Date.now() * 0.001) * 8 + Math.random() * 2;
    // Push to GPS alt dataset
    cAlt.data.datasets[0].data.push(a);
    cAlt.data.datasets[0].data.shift();
    // Push to EKF alt dataset with small perturbation
    cAlt.data.datasets[1].data.push(a + Math.random() - 0.5);
    cAlt.data.datasets[1].data.shift();
    cAlt.update('none');
    // Occasionally append a textual log entry
    if (Math.random() > 0.75) {
      addLog('tllog', 'GPS alt:' + Math.round(a) + 'm hdop:' + (1.2 + Math.random() * 0.4).toFixed(2), 'in');
    }
  }, 600);
  // Also append IMU orientation updates less frequently
  setInterval(() => {
    addLog('tllog', 'IMU roll:' + (Math.sin(window.gT) * 3).toFixed(2) + '° pitch:' + (Math.cos(window.gT * 0.7) * 2).toFixed(2) + '°', 'in');
  }, 2500);
};