/*
 * ui.js
 *
 * This module encapsulates low‑level DOM helpers and page navigation.
 * Functions here are intentionally small and focused: selecting
 * elements, formatting timestamps, appending log lines, updating
 * slider labels and switching pages. Pages themselves are initialised
 * elsewhere by registering callbacks on the global `pi` object.
 */

// Shortcut for document.getElementById. The double dollar prefix
// matches the convention used in the original prototype.
window.$$ = function(id) {
  return document.getElementById(id);
};

// Return a HH:MM:SS string for the current time. Useful for
// timestamping log entries. Not exposed globally since it is only
// used internally.
function ts2() {
  return new Date().toTimeString().substr(0, 8);
}

// Append a line to a log container. Each log line is timestamped and
// colour coded based on a type: 'ok' for success, 'in' for info,
// 'lw' for warnings, etc. The log is scrolled to the bottom after
// insertion so that the newest entry is always visible.
window.addLog = function(id, msg, t) {
  const l = $$(id);
  if (!l) return;
  const d = document.createElement('div');
  const cls = t || 'in';
  d.innerHTML = '<span class="lt">[' + ts2() + ']</span> ' +
                '<span class="l' + cls + '">' + msg + '</span>';
  l.appendChild(d);
  l.scrollTop = l.scrollHeight;
};

// Write the numeric value from a range input into a sibling span.
// Used for flight parameter sliders on the control page. It expects
// the element ID where the value should be written.
window.sv2 = function(el, id) {
  const out = $$(id);
  if (out) out.textContent = el.value;
};

// Format a range value by dividing it by a scale and writing to a
// target span. For example converting a slider from 1–100 to a
// decimal learning rate. The scale parameter is usually the maximum
// possible value of the slider.
window.svf = function(el, id, div) {
  const out = $$(id);
  if (!out) return;
  const val = el.value / div;
  out.textContent = val.toFixed(val < 0.01 ? 4 : 3);
};

// Switch between pages. Hides all elements with class 'page' and
// shows the requested page by adding the 'active' class. Also updates
// the left sidebar to highlight the active module. If a page has
// never been initialised before it calls the corresponding function
// registered on window.pi (see app.js). The pages array defines the
// order of modules and is also defined in app.js.
window.go = function(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.ni').forEach(n => n.classList.remove('active'));
  const pageEl = document.getElementById('page-' + id);
  if (pageEl) pageEl.classList.add('active');
  const idx = window.pages.indexOf(id);
  const navItems = document.querySelectorAll('.ni');
  if (idx >= 0 && navItems[idx]) navItems[idx].classList.add('active');
  // Lazily initialise the page on first visit
  if (!window.inited[id]) {
    window.inited[id] = true;
    if (window.pi && typeof window.pi[id] === 'function') {
      window.pi[id]();
    }
  }
};