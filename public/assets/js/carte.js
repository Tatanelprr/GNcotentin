// Cotentin — coordonnées centrales
const CENTER = [49.63, -1.62]
const ZOOM   = 11

document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('map').setView(CENTER, ZOOM)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(map)

  const cluster = L.markerClusterGroup({ chunkedLoading: true })

  fetch('assets/gpx/caches.gpx')
    .then(r => {
      if (!r.ok) throw new Error('GPX introuvable')
      return r.text()
    })
    .then(gpxText => {
      const gpx  = new DOMParser().parseFromString(gpxText, 'application/xml')
      const wpts = Array.from(gpx.querySelectorAll('wpt'))

      wpts.forEach(wpt => {
        const lat  = parseFloat(wpt.getAttribute('lat'))
        const lon  = parseFloat(wpt.getAttribute('lon'))
        if (isNaN(lat) || isNaN(lon)) return

        const name = wpt.querySelector('name')?.textContent?.trim() || ''
        const desc = wpt.querySelector('desc')?.textContent?.trim() || ''
        const type = wpt.querySelector('type')?.textContent?.trim() || ''

        const marker = L.marker([lat, lon])

        if (name || desc) {
          marker.bindPopup(`
            ${name ? `<strong style="font-size:14px;">${name}</strong><br>` : ''}
            ${type ? `<span style="color:#888;font-size:12px;">${type}</span><br>` : ''}
            ${desc ? `<span style="font-size:13px;">${desc}</span>` : ''}
          `.trim())
        }

        cluster.addLayer(marker)
      })

      map.addLayer(cluster)

      if (wpts.length > 0) {
        map.fitBounds(cluster.getBounds(), { padding: [30, 30] })
        document.getElementById('cache-count').textContent =
          `${wpts.length} cache${wpts.length > 1 ? 's' : ''}`
      } else {
        showStatus('Aucune cache disponible pour le moment.')
      }
    })
    .catch(() => {
      showStatus('La carte des caches sera disponible bientôt.')
    })
})

function showStatus(msg) {
  const el = document.getElementById('map-status')
  el.textContent = msg
  el.style.display = 'block'
}
