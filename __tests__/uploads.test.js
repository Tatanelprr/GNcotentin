const {
  getExtension,
  isAllowedExtension,
  isAllowedSize,
  coverStoragePath,
  sectionStoragePath,
  MAX_SIZE_BYTES,
} = require('../lib/uploads')

describe('getExtension', () => {
  it('extrait jpg', () => { expect(getExtension('photo.jpg')).toBe('jpg') })
  it('extrait png', () => { expect(getExtension('image.PNG')).toBe('png') })
  it('extrait webp', () => { expect(getExtension('cover.webp')).toBe('webp') })
  it('gère les noms avec plusieurs points', () => { expect(getExtension('my.photo.jpeg')).toBe('jpeg') })
})

describe('isAllowedExtension', () => {
  it('accepte jpg', () => { expect(isAllowedExtension('photo.jpg')).toBe(true) })
  it('accepte jpeg', () => { expect(isAllowedExtension('photo.jpeg')).toBe(true) })
  it('accepte png', () => { expect(isAllowedExtension('photo.png')).toBe(true) })
  it('accepte webp', () => { expect(isAllowedExtension('photo.webp')).toBe(true) })
  it('refuse gif', () => { expect(isAllowedExtension('anim.gif')).toBe(false) })
  it('refuse pdf', () => { expect(isAllowedExtension('doc.pdf')).toBe(false) })
  it('refuse svg', () => { expect(isAllowedExtension('icon.svg')).toBe(false) })
})

describe('isAllowedSize', () => {
  it('accepte une image de 1 Mo', () => {
    expect(isAllowedSize(1 * 1024 * 1024)).toBe(true)
  })

  it('accepte exactement 2 Mo', () => {
    expect(isAllowedSize(MAX_SIZE_BYTES)).toBe(true)
  })

  it('refuse au-delà de 2 Mo', () => {
    expect(isAllowedSize(MAX_SIZE_BYTES + 1)).toBe(false)
  })

  it('accepte un fichier vide', () => {
    expect(isAllowedSize(0)).toBe(true)
  })
})

describe('coverStoragePath', () => {
  it('génère le bon chemin pour la cover', () => {
    expect(coverStoragePath('news-123', 'photo.jpg')).toBe('news/news-123/cover.jpg')
  })

  it('préserve l\'extension', () => {
    expect(coverStoragePath('abc', 'image.webp')).toBe('news/abc/cover.webp')
  })
})

describe('sectionStoragePath', () => {
  it('génère le bon chemin pour une section', () => {
    expect(sectionStoragePath('news-123', 1, 'photo.jpg')).toBe('news/news-123/section-1.jpg')
  })

  it('différencie les sections par leur ID', () => {
    const path1 = sectionStoragePath('news-123', 1, 'img.png')
    const path2 = sectionStoragePath('news-123', 2, 'img.png')
    expect(path1).not.toBe(path2)
  })
})
