/*
 * control.js
 *
 * Provides interactive controls for commanding the drone. The page
 * initialises a command log, allows switching between autopilot,
 * manual and RL agent modes, sends high level commands like takeoff
 * and landing and exposes a virtual joystick for manual control.
 */

window.pi.control = function() {
  // Initialise command log with a few startup messages
  addLog('cmdlog', 'Система готова', 'ok');
  addLog('cmdlog', 'Автопилот активирован', 'in');
  addLog('cmdlog', 'LSTM траектория загружена', 'ok');
  // Prepare joystick controls
  initJoy();
};

/**
 * Send a high level command to the drone. The command code is
 * appended to the log and after a short delay a completion message
 * is logged. This simulates asynchronous execution on the aircraft.
 */
window.cmd2 = function(c) {
  addLog('cmdlog', 'Команда: ' + c, 'in');
  setTimeout(() => {
    addLog('cmdlog', c + ': выполнено', 'ok');
  }, 350);
};

/**
 * Switch between autopilot, manual and RL modes. Updates the badge
 * colour and label on the control page and logs the change. The
 * mapping of ids to CSS classes mirrors the original prototype.
 */
window.sMode = function(id, name) {
  const cls = {
    auto: 'badge bg2',
    manual: 'badge bb',
    rl: 'badge ba'
  };
  const mb = document.getElementById('mbadge');
  if (mb) {
    mb.textContent = name;
    mb.className = cls[id] || 'badge bg2';
  }
  addLog('cmdlog', 'Режим: ' + name, 'lw');
};

/**
 * Trigger an emergency stop. Writes a warning to the log and
 * halts the simulated flight path animation by setting flyOn false.
 */
window.eStop = function() {
  addLog('cmdlog', 'АВАРИЙНЫЙ СТОП', 'lw');
  window.flyOn = false;
};

/**
 * Initialise the on‑screen joystick. Uses mouse and touch events to
 * drag the inner knob within a circular boundary. On release the
 * knob snaps back to centre and the displayed X/Y values reset to
 * zero. A guard ensures the listeners are only attached once.
 */
function initJoy() {
  const j = document.getElementById('joy');
  const d = document.getElementById('joyd');
  if (!j || !d) return;
  // Prevent multiple initialisations
  if (j._i) return;
  j._i = true;
  let drag = false;
  const R = 45; // radius within which the knob can move
  function mv(cx, cy) {
    const rc = j.getBoundingClientRect();
    const dx = cx - rc.left - rc.width / 2;
    const dy = cy - rc.top - rc.height / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const fx = dist > R ? (dx / dist) * R : dx;
    const fy = dist > R ? (dy / dist) * R : dy;
    d.style.transform = 'translate(calc(-50% + ' + fx + 'px), calc(-50% + ' + fy + 'px))';
    const jx = document.getElementById('jx');
    const jy = document.getElementById('jy');
    if (jx && jy) {
      jx.textContent = (fx / R).toFixed(2);
      jy.textContent = (-fy / R).toFixed(2);
    }
  }
  function rs() {
    d.style.transform = 'translate(-50%,-50%)';
    const jx = document.getElementById('jx');
    const jy = document.getElementById('jy');
    if (jx && jy) {
      jx.textContent = '0.00';
      jy.textContent = '0.00';
    }
  }
  d.addEventListener('mousedown', e => {
    drag = true;
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (drag) mv(e.clientX, e.clientY);
  });
  document.addEventListener('mouseup', () => {
    if (drag) {
      drag = false;
      rs();
    }
  });
  d.addEventListener('touchstart', e => {
    drag = true;
    e.preventDefault();
  }, { passive: false });
  document.addEventListener('touchmove', e => {
    if (drag) mv(e.touches[0].clientX, e.touches[0].clientY);
  });
  document.addEventListener('touchend', () => {
    if (drag) {
      drag = false;
      rs();
    }
  });
}