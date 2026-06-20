const { usernameToEmail, emailToUsername, isValidUsername, AUTH_DOMAIN } = require('../lib/auth')

describe('usernameToEmail', () => {
  it('convertit un identifiant en email Firebase', () => {
    expect(usernameToEmail('Gcncotentin')).toBe('gcncotentin@gncotentin.local')
  })

  it('met en minuscules', () => {
    expect(usernameToEmail('ADMIN')).toBe('admin@gncotentin.local')
  })

  it('supprime les espaces en début et fin', () => {
    expect(usernameToEmail('  admin  ')).toBe('admin@gncotentin.local')
  })

  it('utilise le bon domaine', () => {
    expect(usernameToEmail('test')).toContain(AUTH_DOMAIN)
  })
})

describe('emailToUsername', () => {
  it('extrait le pseudo depuis un email Firebase', () => {
    expect(emailToUsername('gcncotentin@gncotentin.local')).toBe('gcncotentin')
  })

  it('fonctionne avec différents identifiants', () => {
    expect(emailToUsername('admin@gncotentin.local')).toBe('admin')
  })

  it('est inverse de usernameToEmail', () => {
    const username = 'gcncotentin'
    expect(emailToUsername(usernameToEmail(username))).toBe(username)
  })
})

describe('isValidUsername', () => {
  it('accepte un identifiant valide', () => {
    expect(isValidUsername('Gcncotentin')).toBe(true)
  })

  it('refuse une chaîne trop courte', () => {
    expect(isValidUsername('a')).toBe(false)
  })

  it('refuse une chaîne vide', () => {
    expect(isValidUsername('')).toBe(false)
  })

  it('refuse null et undefined', () => {
    expect(isValidUsername(null)).toBe(false)
    expect(isValidUsername(undefined)).toBe(false)
  })

  it('refuse un non-string', () => {
    expect(isValidUsername(42)).toBe(false)
  })
})
