const { todayKey, cutoffKey, fillMissingDays, isExpired } = require('../lib/visits')

describe('todayKey', () => {
  it('retourne une date au format YYYY-MM-DD', () => {
    expect(todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it("retourne la date d'aujourd'hui", () => {
    const expected = new Date().toISOString().slice(0, 10)
    expect(todayKey()).toBe(expected)
  })
})

describe('cutoffKey', () => {
  it('retourne une date 30 jours en arrière par défaut', () => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    expect(cutoffKey()).toBe(d.toISOString().slice(0, 10))
  })

  it('respecte le nombre de jours passé en paramètre', () => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    expect(cutoffKey(7)).toBe(d.toISOString().slice(0, 10))
  })

  it('est antérieur à aujourd\'hui', () => {
    expect(cutoffKey() < todayKey()).toBe(true)
  })
})

describe('fillMissingDays', () => {
  it('retourne exactement 30 labels', () => {
    const { labels } = fillMissingDays({})
    expect(labels).toHaveLength(30)
  })

  it('met 0 pour les jours sans données', () => {
    const { values } = fillMissingDays({})
    expect(values.every(v => v === 0)).toBe(true)
  })

  it("utilise la valeur Firestore pour aujourd'hui", () => {
    const today = todayKey()
    const { labels, values } = fillMissingDays({ [today]: 42 })
    const idx = labels.indexOf(today)
    expect(values[idx]).toBe(42)
  })

  it('les labels sont triés du plus ancien au plus récent', () => {
    const { labels } = fillMissingDays({})
    expect(labels[0] < labels[labels.length - 1]).toBe(true)
  })

  it('respecte un nombre de jours personnalisé', () => {
    const { labels } = fillMissingDays({}, 7)
    expect(labels).toHaveLength(7)
  })
})

describe('isExpired', () => {
  it('détecte une date expirée', () => {
    expect(isExpired('2020-01-01')).toBe(true)
  })

  it("ne marque pas aujourd'hui comme expiré", () => {
    expect(isExpired(todayKey())).toBe(false)
  })

  it('détecte correctement la limite', () => {
    const d = new Date()
    d.setDate(d.getDate() - 31)
    expect(isExpired(d.toISOString().slice(0, 10))).toBe(true)
  })
})
