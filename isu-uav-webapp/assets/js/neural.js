/*
 * neural.js
 *
 * Simulates a simple neural network training session. When the user
 * navigates to the "Нейросеть" page the buildNN() function draws
 * a stylised representation of an LSTM + MLP architecture. Two
 * charts illustrate how loss decreases and accuracy increases over
 * epochs. runTrain() animates a mock training loop, writing lines
 * to the log and updating a status badge.
 */

// Initialise the neural network page
window.pi.neural = function() {
  // Build the layer diagram
  buildNN();
  // Create loss/val loss and accuracy charts
  mkC('closs', 'line', window.E2, [
    ln2('#3b82f6', 'Train Loss', window.TL2, true),
    ln2('#f59e0b', 'Val Loss', window.VL2)
  ]);
  mkC('cacc', 'line', window.E2, [
    ln2('#22c55e', 'Train Acc', window.TA2, true),
    ln2('#3b82f6', 'Val Acc', window.VA2)
  ]);
  // Write some initial log lines
  addLog('nnlog', 'Модель LSTM инициализирована', 'ok');
  addLog('nnlog', 'Датасет: 2&nbsp;847 записей', 'in');
  addLog('nnlog', 'Нормализация выполнена', 'ok');
  addLog('nnlog', 'Готово к обучению', 'ok');
};

/**
 * Draw a simple vertical representation of the neural network.
 * Each column corresponds to a layer and contains a few nodes to
 * illustrate width. Between columns thin lines hint at
 * connections. Nodes in the output layer are coloured differently.
 */
function buildNN() {
  const c = document.getElementById('nnviz');
  if (!c) return;
  // Prevent duplicate diagrams on repeated initialisation
  if (c.childElementCount > 0) return;
  const layers = [
    { n: 'INPUT', ct: 6, c: '#52525b' },
    { n: 'LSTM 64', ct: 5, c: '#3b82f6' },
    { n: 'LSTM 32', ct: 4, c: '#3b82f6' },
    { n: 'DENSE', ct: 3, c: '#3b82f6' },
    { n: 'OUTPUT', ct: 3, c: '#22c55e' }
  ];
  layers.forEach((lay, li) => {
    const col = document.createElement('div');
    col.className = 'nl';
    for (let i = 0; i < Math.min(lay.ct, 5); i++) {
      const n = document.createElement('div');
      n.className = 'nd' + (li === layers.length - 1 ? ' out' : '');
      n.style.borderColor = lay.c;
      col.appendChild(n);
    }
    const lb = document.createElement('div');
    lb.className = 'nlb';
    lb.textContent = lay.n;
    lb.style.color = lay.c;
    col.appendChild(lb);
    c.appendChild(col);
    if (li < layers.length - 1) {
      const cn = document.createElement('div');
      cn.className = 'nc';
      c.appendChild(cn);
    }
  });
  // Randomly pulse nodes to simulate activity
  setInterval(() => {
    const ns = c.querySelectorAll('.nd');
    ns.forEach(n => n.classList.remove('lit'));
    const pick = ns[Math.floor(Math.random() * ns.length)];
    if (pick) pick.classList.add('lit');
  }, 400);
}

/**
 * Animate a fake training loop. Disables concurrent runs by
 * checking the global trRun flag. For each epoch it appends a
 * formatted line to the log and updates a summary above the loss
 * chart. After the last epoch it resets the status badge.
 */
window.runTrain = function() {
  if (window.trRun) return;
  window.trRun = true;
  // Update badge
  const tb = document.getElementById('tbadge');
  if (tb) {
    tb.textContent = 'Обучение';
    tb.className = 'badge ba';
  }
  // Clear old log entries
  const log = document.getElementById('nnlog');
  if (log) log.innerHTML = '';
  addLog('nnlog', 'Сброс весов...', 'in');
  let ep = 0;
  const iv = setInterval(() => {
    ep++;
    if (ep > 50) {
      clearInterval(iv);
      window.trRun = false;
      if (tb) {
        tb.textContent = 'Готово';
        tb.className = 'badge bg2';
      }
      return;
    }
    // Log current epoch
    const loss  = window.TL2[ep - 1].toFixed(4);
    const acc   = window.TA2[ep - 1].toFixed(1);
    addLog('nnlog', 'ep ' + String(ep).padStart(2, '0') + '/50  loss:' + loss + '  acc:' + acc + '%', ep >= 45 ? 'ok' : 'in');
    // Update summary line
    const epline = document.getElementById('epline');
    if (epline) {
      epline.textContent = 'EPOCH ' + ep + '/50 · LOSS: ' + loss + ' · ACC: ' + acc + '%';
    }
  }, 80);
};