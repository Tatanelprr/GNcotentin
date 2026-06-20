function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function cutoffKey(days = 30) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

function fillMissingDays(visitsByDay, days = 30) {
  const labels = []
  const values = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const day = d.toISOString().slice(0, 10)
    labels.push(day)
    values.push(visitsByDay[day] ?? 0)
  }
  return { labels, values }
}

function isExpired(day, days = 30) {
  return day < cutoffKey(days)
}

module.exports = { todayKey, cutoffKey, fillMissingDays, isExpired }
