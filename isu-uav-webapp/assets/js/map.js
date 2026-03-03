/*
 * map.js
 *
 * Handles the map view using Leaflet. When the user navigates to
 * the map page the map is created once, the flight path and
 * obstacles are drawn and a marker animates along the path at
 * regular intervals. The marker's position updates the telemetry
 * panels on both the map and top bar.
 */

window.pi.map = function() {
  // Avoid re‑creating the map if it already exists
  if (window.mapO) return;
  // Centre on the first point of the path
  const start = window.fp[0];
  // Create the map
  window.mapO = L.map('map').setView([start[0], start[1]], 14);
  // Initial tile layer (satellite)
  let url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  let layer = L.tileLayer(url, { maxZoom: 19 });
  layer.addTo(window.mapO);
  window._lyr = layer;
  // Draw flight path polyline
  L.polyline(window.fp, { color: '#3b82f6', weight: 2, opacity: 0.7, dashArray: '5,4' }).addTo(window.mapO);
  // Draw area circle around Sayran lake (approx radius 600m)
  L.circle([43.2264, 76.8612], {
    radius: 600,
    color: '#3b82f6',
    weight: 1,
    fillColor: '#3b82f6',
    fillOpacity: 0.06
  }).addTo(window.mapO).bindTooltip('Сайран', { permanent: true, direction: 'center' });
  // Draw example obstacles
  L.circleMarker([43.229, 76.858], {
    radius: 6,
    color: '#ef4444',
    fillColor: '#ef4444',
    fillOpacity: 0.5
  }).addTo(window.mapO).bindPopup('<b>Башня&nbsp;45м</b>');
  // Marker icon for the drone
  const ic = L.divIcon({
    className: '',
    html: '<div style="width:12px;height:12px;background:#3b82f6;border-radius:50%;border:2px solid #fff"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
  window.dMark = L.marker(window.fp[0], { icon: ic }).addTo(window.mapO);
  // Animate the marker along the path every 1.2 seconds
  setInterval(() => {
    if (!window.flyOn) return;
    window.pIdx = (window.pIdx + 1) % window.fp.length;
    const p = window.fp[window.pIdx];
    if (window.dMark) window.dMark.setLatLng(p);
    // Update telemetry boxes on the map page
    const mlt = $$("mlt");
    const mln = $$("mln");
    const mal = $$("mal");
    const msp = $$("msp");
    const mhd = $$("mhd");
    if (mlt && mln && mal && msp && mhd) {
      mlt.textContent = p[0].toFixed(4) + '°N';
      mln.textContent = p[1].toFixed(4) + '°E';
      mal.textContent = (120 + Math.sin(window.pIdx * 0.5) * 8).toFixed(0) + ' м';
      msp.textContent = (12.4 + Math.sin(window.pIdx * 0.3) * 1.5).toFixed(1) + ' м/с';
      mhd.textContent = Math.round((245 + window.pIdx * 10) % 360) + '°';
    }
    // Update top bar GPS display
    const hgps = $$("hgps");
    if (hgps) {
      hgps.textContent = p[0].toFixed(4) + '°N ' + p[1].toFixed(4) + '°E';
    }
    // Display next three predicted points using simple wrap‑around
    const lstmpts = $$("lstmpts");
    if (lstmpts) {
      let html = '';
      for (let i = 1; i <= 3; i++) {
        const q = window.fp[(window.pIdx + i) % window.fp.length];
        html += '<span class="badge bb" style="font-size:10px">P' + i + ': ' + q[0].toFixed(3) + ' ' + q[1].toFixed(3) + '</span>';
      }
      lstmpts.innerHTML = html;
    }
  }, 1200);
};

/**
 * Switch between tile layers. Supports 'satellite' (Esri Imagery)
 * and 'osm' (OpenStreetMap). When called the existing tile layer
 * is removed and replaced with the chosen one.
 *
 * @param {string} t2 Either 'satellite' or 'osm'
 */
window.setLyr = function(t2) {
  if (!window.mapO) return;
  if (window._lyr) window.mapO.removeLayer(window._lyr);
  const url = t2 === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  window._lyr = L.tileLayer(url, { maxZoom: 19 }).addTo(window.mapO);
};

/**
 * Toggle the animation of the drone along its path. When flyOn is
 * false the interval in pi.map returns early, effectively pausing
 * motion. Called by the "Старт / Стоп" button.
 */
window.tglFly = function() {
  window.flyOn = !window.flyOn;
};