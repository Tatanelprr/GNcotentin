const AUTH_DOMAIN = 'gncotentin.local'

function usernameToEmail(username) {
  return `${username.toLowerCase().trim()}@${AUTH_DOMAIN}`
}

function emailToUsername(email) {
  return email.replace(`@${AUTH_DOMAIN}`, '')
}

function isValidUsername(username) {
  return typeof username === 'string' && username.trim().length >= 2
}

module.exports = { usernameToEmail, emailToUsername, isValidUsername, AUTH_DOMAIN }
