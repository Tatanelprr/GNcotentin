const { newsUrl, isValidNews, getImgNameFromBg, sortNewsByDate, latestThree } = require('../lib/news')

describe('newsUrl', () => {
  it('génère la bonne URL', () => {
    expect(newsUrl('abc-123')).toBe('news.html?id=abc-123')
  })

  it('fonctionne avec un UUID', () => {
    const id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    expect(newsUrl(id)).toBe(`news.html?id=${id}`)
  })
})

describe('isValidNews', () => {
  it('valide une news complète', () => {
    expect(isValidNews({ title: 'Mon titre', resume: 'Mon résumé', coverImg: 'img.jpg' })).toBe(true)
  })

  it('valide une news sans image (optionnelle)', () => {
    expect(isValidNews({ title: 'Titre', resume: 'Résumé' })).toBe(true)
  })

  it('rejette une news sans titre', () => {
    expect(isValidNews({ title: '', resume: 'Résumé' })).toBe(false)
  })

  it('rejette une news sans résumé', () => {
    expect(isValidNews({ title: 'Titre', resume: '' })).toBe(false)
  })

  it('rejette null', () => {
    expect(isValidNews(null)).toBe(false)
  })

  it('rejette un titre avec uniquement des espaces', () => {
    expect(isValidNews({ title: '   ', resume: 'Résumé' })).toBe(false)
  })
})

describe('getImgNameFromBg', () => {
  it('extrait le nom de fichier depuis un background-image CSS', () => {
    expect(getImgNameFromBg('url("uploads/news1/cover.jpg")')).toBe('cover.jpg')
  })

  it('retire le cache-buster', () => {
    expect(getImgNameFromBg('url(uploads/news1/cover.jpg?t=12345)')).toBe('cover.jpg')
  })

  it('fonctionne sans guillemets', () => {
    expect(getImgNameFromBg('url(uploads/news/img.png)')).toBe('img.png')
  })

  it('retourne null si vide', () => {
    expect(getImgNameFromBg('')).toBe(null)
    expect(getImgNameFromBg(null)).toBe(null)
  })
})

describe('sortNewsByDate', () => {
  const news = [
    { id: '1', title: 'A', createdAt: new Date('2024-01-01') },
    { id: '2', title: 'B', createdAt: new Date('2024-03-01') },
    { id: '3', title: 'C', createdAt: new Date('2024-02-01') },
  ]

  it('trie du plus récent au plus ancien', () => {
    const sorted = sortNewsByDate(news)
    expect(sorted[0].id).toBe('2')
    expect(sorted[1].id).toBe('3')
    expect(sorted[2].id).toBe('1')
  })

  it('ne modifie pas le tableau original', () => {
    const original = [...news]
    sortNewsByDate(news)
    expect(news).toEqual(original)
  })
})

describe('latestThree', () => {
  it('retourne au plus 3 news', () => {
    const news = Array.from({ length: 5 }, (_, i) => ({
      id: String(i),
      title: `News ${i}`,
      createdAt: new Date(2024, i, 1),
    }))
    expect(latestThree(news)).toHaveLength(3)
  })

  it('retourne les 3 plus récentes', () => {
    const news = Array.from({ length: 5 }, (_, i) => ({
      id: String(i),
      title: `News ${i}`,
      createdAt: new Date(2024, i, 1),
    }))
    const result = latestThree(news)
    expect(result[0].id).toBe('4')
    expect(result[1].id).toBe('3')
    expect(result[2].id).toBe('2')
  })

  it('fonctionne avec moins de 3 news', () => {
    const news = [{ id: '1', title: 'A', createdAt: new Date() }]
    expect(latestThree(news)).toHaveLength(1)
  })

  it('fonctionne avec un tableau vide', () => {
    expect(latestThree([])).toHaveLength(0)
  })
})
