const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2 Mo

function getExtension(filename) {
  return filename.split('.').pop().toLowerCase()
}

function isAllowedExtension(filename) {
  return ALLOWED_EXTENSIONS.includes(getExtension(filename))
}

function isAllowedSize(sizeInBytes) {
  return sizeInBytes <= MAX_SIZE_BYTES
}

function coverStoragePath(newsId, filename) {
  return `news/${newsId}/cover.${getExtension(filename)}`
}

function sectionStoragePath(newsId, sectionId, filename) {
  return `news/${newsId}/section-${sectionId}.${getExtension(filename)}`
}

module.exports = {
  ALLOWED_EXTENSIONS,
  MAX_SIZE_BYTES,
  getExtension,
  isAllowedExtension,
  isAllowedSize,
  coverStoragePath,
  sectionStoragePath,
}
